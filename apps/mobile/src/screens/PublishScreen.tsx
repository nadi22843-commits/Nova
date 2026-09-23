import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  fieldsForStep, isReferenceField, loadDraft, saveDraft, clearDraft, translateLabel,
  type CategoryModule, type Subcategory, type DealType, type FieldDef,
} from '@nova/core';
import { useTheme } from '../theme/ThemeProvider';
import { ReferenceSelect } from '../components/ReferenceSelect';
import { space, radius, type } from '../theme/tokens';
import { useT, useLocaleLanguage } from '../i18n/LocaleContext';

/**
 * Мастер публикации.
 *
 * Шаги и поля берутся из конфигурации подкатегории и вида сделки: у продажи
 * квартиры своя форма, у аренды своя. Ни одного условия по названию
 * категории здесь нет.
 *
 * На телефоне форма из четырёх шагов без сохранения — гарантированная потеря
 * данных: входящий звонок, свернул приложение, случайный «назад». Черновик
 * пишется после каждого шага.
 */
export function PublishScreen({
  category,
  sub,
  deal,
  money,
  onDone,
  onBack,
}: {
  category: CategoryModule;
  sub: Subcategory;
  deal?: DealType;
  money: (amount: number) => string;
  onDone: (title: string) => void;
  onBack: () => void;
}) {
  const { theme } = useTheme();
  const t = useT();
  const language = useLocaleLanguage();
  const total = sub.steps.length;

  const [step, setStep] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [restored, setRestored] = useState(false);

  // Восстановление черновика — один раз при входе.
  useEffect(() => {
    const draft = loadDraft(category.id, sub.id);
    if (draft) {
      setValues(draft.values);
      setStep(Math.min(draft.step, total));
      setRestored(true);
    }
  }, [category.id, sub.id, total]);

  function set(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function persist(nextStep: number) {
    saveDraft({ categoryId: category.id, subcategoryId: sub.id, step: nextStep, values, updatedAt: Date.now() });
  }

  function missingIn(fields: FieldDef[]): string[] {
    return fields.filter((f) => f.required && !values[f.key]?.trim()).map((f) => translateLabel(f.label, language));
  }

  function next() {
    const missing = missingIn(fieldsForStep(sub, step, deal));
    setErrors(missing);
    if (missing.length > 0) return;

    const nextStep = Math.min(step + 1, total);
    setStep(nextStep);
    persist(nextStep);
  }

  function back() {
    if (step === 1) {
      persist(step);
      onBack();
      return;
    }
    setStep(step - 1);
    setErrors([]);
  }

  /**
   * Перед публикацией проверяем ВСЕ шаги, а не только последний:
   * восстановленный черновик открывается сразу на предпросмотре,
   * и обязательные поля ранних шагов могли остаться пустыми.
   */
  function publish() {
    for (let i = 1; i < total; i += 1) {
      const missing = missingIn(fieldsForStep(sub, i, deal));
      if (missing.length > 0) {
        setStep(i);
        setErrors(missing);
        persist(i);
        return;
      }
    }
    clearDraft(category.id, sub.id);
    onDone(values.title || translateLabel(sub.title, language));
  }

  const isPreview = step === total;
  const stepFields = fieldsForStep(sub, step, deal);

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]}>
      <View style={s.head}>
        <Pressable onPress={back} hitSlop={10}>
          <Text style={{ color: theme.accentText, fontWeight: '700' }}>‹ {t('app.back')}</Text>
        </Pressable>

        <View style={[s.progress, { backgroundColor: theme.surface2 }]}>
          <View style={[s.progressFill, { width: `${(step / total) * 100}%`, backgroundColor: theme.accent }]} />
        </View>
        <Text style={{ color: theme.muted, fontSize: 12, marginTop: 6 }}>
          {t('wizard.step', { current: step, total })} · {translateLabel(sub.steps[step - 1], language)}
        </Text>

        {restored && step > 1 && (
          <View style={[s.note, { backgroundColor: theme.accentSoft, borderColor: theme.line }]}>
            <Text style={{ color: theme.ink2, fontSize: 12.5 }}>
              {t('wizard.draftRestored')}
            </Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {isPreview ? (
          <>
            <Text style={[type.h1, { color: theme.ink }]}>{values.title || translateLabel(sub.title, language)}</Text>
            {values.price && (
              <Text style={[type.price, { color: theme.ink, marginTop: space.sm }]}>
                {money(Number(values.price) || 0)}
              </Text>
            )}

            <View style={[s.specs, { borderColor: theme.line }]}>
              {sub.fields
                .filter((f) => f.showInCard && values[f.key])
                .map((f, i) => (
                  <View
                    key={f.key}
                    style={[s.specRow, { borderTopWidth: i === 0 ? 0 : 1, borderTopColor: theme.line }]}
                  >
                    <Text style={{ color: theme.muted, fontSize: 13 }}>{translateLabel(f.label, language)}</Text>
                    <Text style={{ color: theme.ink, fontSize: 13, fontWeight: '700' }}>
                      {translateLabel(values[f.key], language)}
                      {f.unit ? ` ${translateLabel(f.unit, language)}` : ''}
                    </Text>
                  </View>
                ))}
            </View>
          </>
        ) : (
          stepFields.map((f) => (
            <Field
              key={f.key}
              field={f}
              value={values[f.key] ?? ''}
              values={values}
              subcategoryId={sub.id}
              onChange={(v) => set(f.key, v)}
            />
          ))
        )}

        {errors.length > 0 && (
          <Text style={{ color: theme.danger, fontSize: 13, marginTop: space.sm }}>
            {t('wizard.required', { fields: errors.join(', ') })}
          </Text>
        )}
      </ScrollView>

      <View style={[s.footer, { borderTopColor: theme.line }]}>
        {isPreview ? (
          <View style={s.row}>
            <Pressable
              onPress={() => {
                setStep(1);
                persist(1);
              }}
              style={[s.cta, s.ghost, { borderColor: theme.accent, flex: 1 }]}
            >
              <Text style={{ color: theme.accentText, fontWeight: '700' }}>{t('app.edit')}</Text>
            </Pressable>
            <Pressable
              onPress={publish}
              style={({ pressed }) => [
                s.cta,
                { backgroundColor: theme.accent, flex: 1, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={{ color: theme.accentInk, fontWeight: '700' }}>{t('account.publish')}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={next}
            style={({ pressed }) => [s.cta, { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={{ color: theme.accentInk, fontWeight: '700', fontSize: 15 }}>{t('wizard.next')}</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

function Field({
  field, value, values, subcategoryId, onChange,
}: {
  field: FieldDef;
  value: string;
  values: Record<string, string>;
  subcategoryId: string;
  onChange: (v: string) => void;
}) {
  const { theme } = useTheme();
  const language = useLocaleLanguage();

  // Поле со справочником отрисовывает себя само: короткие списки кнопками,
  // длинные — окном с поиском.
  if (field.type === 'select' && isReferenceField(field)) {
    return (
      <ReferenceSelect field={field} value={value} values={values} subcategoryId={subcategoryId} onChange={onChange} />
    );
  }

  const label = `${translateLabel(field.label, language)}${field.unit ? `, ${translateLabel(field.unit, language)}` : ''}${field.required ? ' *' : ''}`;

  if (field.type === 'select') {
    return (
      <View style={s.field}>
        <Text style={[type.label, { color: theme.ink2 }]}>{label}</Text>
        <View style={s.options}>
          {(field.options ?? []).map((o) => {
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
        {field.hint && <Text style={{ color: theme.muted, fontSize: 11 }}>{translateLabel(field.hint, language)}</Text>}
      </View>
    );
  }

  if (field.type === 'toggle') {
    return (
      <View style={[s.field, s.toggleRow]}>
        <Text style={[type.label, { color: theme.ink2, flex: 1 }]}>{label}</Text>
        <Switch
          value={value === 'да'}
          onValueChange={(on) => onChange(on ? 'да' : '')}
          trackColor={{ true: theme.accent, false: theme.line }}
        />
      </View>
    );
  }

  return (
    <View style={s.field}>
      <Text style={[type.label, { color: theme.ink2 }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        multiline={field.type === 'textarea'}
        numberOfLines={field.type === 'textarea' ? 4 : 1}
        keyboardType={field.type === 'number' || field.type === 'money' ? 'numeric' : 'default'}
        placeholder={translateLabel(field.label, language)}
        placeholderTextColor={theme.muted}
        style={[
          s.input,
          {
            borderColor: theme.line,
            backgroundColor: theme.surface2,
            color: theme.ink,
            height: field.type === 'textarea' ? 96 : undefined,
            textAlignVertical: field.type === 'textarea' ? 'top' : 'center',
          },
        ]}
      />
      {field.hint && <Text style={{ color: theme.muted, fontSize: 11 }}>{translateLabel(field.hint, language)}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  head: { paddingHorizontal: space.lg, paddingTop: space.md },
  progress: { height: 5, borderRadius: radius.pill, overflow: 'hidden', marginTop: space.md },
  progressFill: { height: '100%', borderRadius: radius.pill },
  note: { borderWidth: 1, borderRadius: radius.sm, padding: space.md, marginTop: space.md },
  scroll: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.xxl },
  field: { marginBottom: space.lg, gap: space.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center' },
  input: { borderWidth: 1, borderRadius: radius.sm, padding: 12, minHeight: 44, fontSize: 14 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  option: { borderWidth: 1, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 13 },
  specs: { borderWidth: 1, borderRadius: radius.md, marginTop: space.lg, overflow: 'hidden' },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', gap: space.md, padding: 13 },
  footer: { padding: space.lg, borderTopWidth: 1 },
  row: { flexDirection: 'row', gap: space.sm },
  cta: { padding: 15, borderRadius: radius.md, alignItems: 'center' },
  ghost: { backgroundColor: 'transparent', borderWidth: 1.5 },
});
