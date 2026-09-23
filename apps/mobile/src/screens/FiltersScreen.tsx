import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  itemsFor, matchItem, filterableFields, getLoadedTree, isReferenceField, translateLabel,
  type CategoryModule, type Subcategory, type FilterValues, type LocationSelection,
} from '@nova/core';
import { ReferenceSelect } from '../components/ReferenceSelect';
import { useTheme } from '../theme/ThemeProvider';
import { space, radius, type } from '../theme/tokens';
import { useT, useLocaleLanguage, usePluralListings } from '../i18n/LocaleContext';

/**
 * Фильтры.
 *
 * Набор полей приходит из конфигурации подкатегории, поэтому для участка
 * и для телефона показываются разные фильтры без единого условия в коде.
 *
 * Значения правятся локально и применяются по кнопке: пока человек крутит
 * список, ничего не меняется — иначе «Назад» оставлял бы изменение,
 * которого он не подтверждал.
 */
export function FiltersScreen({
  category,
  sub,
  intentId,
  initial,
  location,
  onApply,
  onBack,
}: {
  category: CategoryModule;
  sub: Subcategory;
  intentId?: string;
  initial: FilterValues;
  location: LocationSelection;
  onApply: (next: FilterValues) => void;
  onBack: () => void;
}) {
  const { theme } = useTheme();
  const t = useT();
  const language = useLocaleLanguage();
  const pluralListings = usePluralListings();
  const [values, setValues] = useState<FilterValues>(initial);

  const intent = category.intents.find((i) => i.id === intentId && i.mode === 'browse');
  // Фильтры зависят и от вида сделки: у аренды свои поля.
  const fields = filterableFields(sub, intent?.deal);

  const count = useMemo(() => {
    return itemsFor(category.id, sub.id).filter((item) => {
      const tree = getLoadedTree(item.countryCode);
      const path = tree?.places.find((p) => p.id === item.placeId)?.path;
      return matchItem(item, sub, values, location, intent?.deal, path);
    }).length;
  }, [category.id, sub, values, location, intent]);

  function set(key: string, value: string) {
    setValues((prev) => {
      const next = { ...prev };
      if (!value) delete next[key];
      else next[key] = value;

      // Clear stale dependent filters when their parent changes (brand -> model, etc.).
      for (const field of fields) {
        if (field.dependsOn === key) delete next[field.key];
      }
      return next;
    });
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]}>
      <View style={s.head}>
        <Pressable onPress={onBack} hitSlop={10}>
          <Text style={{ color: theme.accentText, fontWeight: '700' }}>‹ {t('app.back')}</Text>
        </Pressable>
        <Text style={[type.h2, { color: theme.ink }]}>{t('list.filters')}</Text>
        <Pressable onPress={() => setValues({})} hitSlop={10}>
          <Text style={{ color: theme.accentText, fontWeight: '700' }}>{t('list.reset')}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Range
          label={t('listing.price')}
          from={values.priceFrom ?? ''}
          to={values.priceTo ?? ''}
          onFrom={(v) => set('priceFrom', v)}
          onTo={(v) => set('priceTo', v)}
        />

        {fields.map((f) =>
          f.filterKind === 'range' ? (
            <Range
              key={f.key}
              label={`${translateLabel(f.label, language)}${f.unit ? `, ${translateLabel(f.unit, language)}` : ''}`}
              from={values[`${f.key}.from`] ?? ''}
              to={values[`${f.key}.to`] ?? ''}
              onFrom={(v) => set(`${f.key}.from`, v)}
              onTo={(v) => set(`${f.key}.to`, v)}
            />
          ) : isReferenceField(f) ? (
            // Поле со справочником: длинные списки открываются окном с поиском,
            // зависимые поля сужаются по родителю.
            <ReferenceSelect
              key={f.key}
              field={f}
              value={values[f.key] ?? ''}
              values={values as Record<string, string>}
              subcategoryId={sub.id}
              onChange={(v) => set(f.key, v)}
            />
          ) : (
            <Options
              key={f.key}
              label={translateLabel(f.label, language)}
              // Значение — стабильный код 'yes'/'no' для переключателя или
              // исходный (русский) текст конфигурации для обычного select:
              // так фильтр совпадает с тем, что хранится в attrs объявления,
              // независимо от того, что показано на кнопке.
              options={f.type === 'toggle' ? [{ value: 'yes', label: t('app.yes') }, { value: 'no', label: t('app.no') }] : (f.options ?? []).map((o) => ({ value: o, label: translateLabel(o, language) }))}
              value={values[f.key] ?? ''}
              onChange={(v) => set(f.key, v)}
            />
          ),
        )}

        <Options
          label={t('seller.who')}
          options={[
            { value: 'owner', label: t('seller.owner') },
            { value: 'agent', label: t('seller.agent') },
            { value: 'company', label: t('seller.company') },
          ]}
          value={values.sellerKind ?? ''}
          onChange={(v) => set('sellerKind', v)}
        />
      </ScrollView>

      <View style={[s.footer, { borderTopColor: theme.line, backgroundColor: theme.bg }]}>
        <Pressable
          onPress={() => onApply(values)}
          disabled={count === 0}
          style={({ pressed }) => [
            s.cta,
            {
              backgroundColor: count === 0 ? theme.surface2 : theme.accent,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={{
              color: count === 0 ? theme.muted : theme.accentInk,
              fontWeight: '700',
              fontSize: 15,
            }}
          >
            {count === 0 ? t('filters.nothing') : t('list.showCount', { count: pluralListings(count) })}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Range({
  label, from, to, onFrom, onTo,
}: {
  label: string; from: string; to: string;
  onFrom: (v: string) => void; onTo: (v: string) => void;
}) {
  const { theme } = useTheme();
  const t = useT();
  return (
    <View style={s.field}>
      <Text style={[type.label, { color: theme.ink2 }]}>{label}</Text>
      <View style={s.rangeRow}>
        <TextInput
          value={from}
          onChangeText={onFrom}
          placeholder={t('filters.from')}
          placeholderTextColor={theme.muted}
          keyboardType="numeric"
          style={[s.input, { borderColor: theme.line, backgroundColor: theme.surface2, color: theme.ink }]}
        />
        <TextInput
          value={to}
          onChangeText={onTo}
          placeholder={t('filters.to')}
          placeholderTextColor={theme.muted}
          keyboardType="numeric"
          style={[s.input, { borderColor: theme.line, backgroundColor: theme.surface2, color: theme.ink }]}
        />
      </View>
    </View>
  );
}

/**
 * Варианты выбора кнопками, а не выпадающим списком.
 * На телефоне список из четырёх пунктов быстрее нажать, чем открыть,
 * прокрутить и закрыть.
 */
function Options({
  label, options, value, onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const { theme } = useTheme();
  const t = useT();
  const all = [{ value: '', label: t('app.any') }, ...options];

  return (
    <View style={s.field}>
      <Text style={[type.label, { color: theme.ink2 }]}>{label}</Text>
      <View style={s.optionsRow}>
        {all.map((o) => {
          const on = value === o.value;
          return (
            <Pressable
              key={o.value || '_any'}
              onPress={() => onChange(o.value)}
              style={({ pressed }) => [
                s.option,
                {
                  backgroundColor: on ? theme.accent : theme.surface,
                  borderColor: on ? theme.accent : theme.line,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={{ color: on ? theme.accentInk : theme.ink2, fontSize: 12.5, fontWeight: '600' }}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  scroll: { paddingHorizontal: space.lg, paddingBottom: space.xxl },
  field: { marginBottom: space.lg, gap: space.sm },
  rangeRow: { flexDirection: 'row', gap: space.sm },
  input: { flex: 1, borderWidth: 1, borderRadius: radius.sm, padding: 12, fontSize: 14 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  option: { borderWidth: 1, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 13 },
  footer: { padding: space.lg, borderTopWidth: 1 },
  cta: { padding: 15, borderRadius: radius.md, alignItems: 'center' },
});
