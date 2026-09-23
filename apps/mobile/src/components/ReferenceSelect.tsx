import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  resolveOptions, isReferenceField, loadReference, searchEntries, translateLabel,
  type FieldDef,
} from '@nova/core';
import { useTheme } from '../theme/ThemeProvider';
import { space, radius, type } from '../theme/tokens';
import { useT, useLocaleLanguage } from '../i18n/LocaleContext';

/**
 * Выбор значения из справочника.
 *
 * Для коротких списков показывает кнопки прямо на месте — четыре варианта
 * быстрее нажать, чем открывать модальное окно. Для длинных открывает окно
 * с поиском: шестьдесят марок кнопками не покажешь.
 *
 * Если справочник не загрузился, поле превращается в обычный ввод текста.
 * Человек впишет марку руками — это лучше, чем пустой список.
 */
export function ReferenceSelect({
  field,
  value,
  values,
  subcategoryId,
  onChange,
}: {
  field: FieldDef;
  value: string;
  /** Все значения формы — нужны для полей, зависящих от другого поля. */
  values: Record<string, string>;
  /** Подкатегория — для полей, сужаемых ею (профессия направлением). */
  subcategoryId?: string;
  onChange: (next: string) => void;
}) {
  const { theme } = useTheme();
  const t = useT();
  const language = useLocaleLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [, force] = useState(0);

  // Справочник грузим при первом показе поля, а не при старте приложения.
  useEffect(() => {
    if (!isReferenceField(field)) return;
    let cancelled = false;
    setLoading(true);
    loadReference(field.reference!).finally(() => {
      if (!cancelled) {
        setLoading(false);
        force((n) => n + 1);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [field]);

  const resolved = resolveOptions(field, values, subcategoryId);
  const parentValue = field.dependsOn ? values[field.dependsOn] : undefined;

  const filtered = useMemo(() => {
    if (resolved.kind !== 'list') return [];
    if (!query.trim()) return resolved.values;
    const entries = resolved.values.map((name) => ({ id: name, name }));
    return searchEntries(entries, query).map((e) => e.name);
  }, [resolved, query]);

  if (loading && isReferenceField(field)) {
    return (
      <View style={s.field}>
        <Text style={[type.label, { color: theme.ink2 }]}>{translateLabel(field.label, language)}</Text>
        <View style={[s.input, { borderColor: theme.line, backgroundColor: theme.surface2 }]}>
          <ActivityIndicator size="small" color={theme.accent} />
        </View>
      </View>
    );
  }

  // Справочник недоступен либо родительское поле не заполнено.
  if (resolved.kind === 'free-text') {
    const hint = resolved.reason === 'no-parent' ? t('wizard.fillAbove') : t('wizard.referenceOff');

    return (
      <View style={s.field}>
        <Text style={[type.label, { color: theme.ink2 }]}>{translateLabel(field.label, language)}</Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={translateLabel(field.label, language)}
          placeholderTextColor={theme.muted}
          editable={resolved.reason !== 'no-parent'}
          style={[
            s.input,
            {
              borderColor: theme.line,
              backgroundColor: theme.surface2,
              color: theme.ink,
              opacity: resolved.reason === 'no-parent' ? 0.5 : 1,
            },
          ]}
        />
        <Text style={{ color: theme.muted, fontSize: 11 }}>{hint}</Text>
      </View>
    );
  }

  // Короткий список — кнопками на месте.
  if (resolved.values.length <= 6) {
    return (
      <View style={s.field}>
        <Text style={[type.label, { color: theme.ink2 }]}>{translateLabel(field.label, language)}</Text>
        <View style={s.row}>
          {resolved.values.map((o) => {
            const on = value === o;
            return (
              <Pressable
                key={o}
                onPress={() => onChange(on ? '' : o)}
                style={[
                  s.option,
                  {
                    backgroundColor: on ? theme.accent : theme.surface,
                    borderColor: on ? theme.accent : theme.line,
                  },
                ]}
              >
                <Text style={{ color: on ? theme.accentInk : theme.ink2, fontSize: 12.5, fontWeight: '600' }}>
                  {translateLabel(o, language)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  // Длинный список — окно с поиском.
  return (
    <View style={s.field}>
      <Text style={[type.label, { color: theme.ink2 }]}>{translateLabel(field.label, language)}</Text>
      <Pressable
        onPress={() => {
          setQuery('');
          setOpen(true);
        }}
        style={[s.input, { borderColor: theme.line, backgroundColor: theme.surface2, justifyContent: 'center' }]}
      >
        <Text style={{ color: value ? theme.ink : theme.muted, fontSize: 14 }}>
          {value ? translateLabel(value, language) : t('picker.chooseValue', { field: translateLabel(field.label, language).toLowerCase() })}
        </Text>
      </Pressable>
      {parentValue && (
        <Text style={{ color: theme.muted, fontSize: 11 }}>
          {t('picker.optionsForParent', { count: resolved.values.length, parent: translateLabel(parentValue, language) })}
        </Text>
      )}

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
          <View style={{ padding: space.lg }}>
            <View style={s.modalHead}>
              <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                <Text style={{ color: theme.accentText, fontWeight: '700' }}>‹ {t('app.close')}</Text>
              </Pressable>
              <Text style={[type.label, { color: theme.ink }]}>{translateLabel(field.label, language)}</Text>
            </View>

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('place.searchPrefix')}
              placeholderTextColor={theme.muted}
              autoFocus
              style={[s.input, { borderColor: theme.line, backgroundColor: theme.surface2, color: theme.ink }]}
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(o) => o}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.xxl }}
            renderItem={({ item }) => {
              const on = value === item;
              return (
                <Pressable
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    s.listItem,
                    {
                      borderColor: on ? theme.accent : theme.line,
                      backgroundColor: on ? theme.accentSoft : pressed ? theme.surface2 : theme.surface,
                    },
                  ]}
                >
                  <Text style={{ color: theme.ink, fontWeight: on ? '700' : '500', fontSize: 14.5 }}>{translateLabel(item, language)}</Text>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={{ color: theme.muted, textAlign: 'center', paddingVertical: space.xl }}>
                {t('place.nothing')}
              </Text>
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  field: { marginBottom: space.lg, gap: space.sm },
  input: { borderWidth: 1, borderRadius: radius.sm, padding: 12, minHeight: 44, fontSize: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  option: { borderWidth: 1, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 13 },
  modalHead: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.md },
  listItem: { borderWidth: 1, borderRadius: radius.md, padding: 13, marginBottom: space.sm },
});
