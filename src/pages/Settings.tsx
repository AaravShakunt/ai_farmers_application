import { useI18n, type Language } from '../i18n'

export default function Settings() {
  const { lang, setLang, t } = useI18n()

  const Radio = ({ value, label }: { value: Language; label: string }) => (
    <label className="flex items-center justify-between rounded-xl border p-3">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="radio"
        name="lang"
        value={value}
        checked={lang === value}
        onChange={() => setLang(value)}
      />
    </label>
  )

  return (
    <div className="mx-auto max-w-screen-md px-4 pb-24 pt-4 md:px-6">
      <h1 className="py-3 text-xl font-bold">{t('settings')}</h1>

      <section className="space-y-2">
        <div>
          <h2 className="text-base font-semibold">{t('language')}</h2>
          <p className="text-xs text-gray-600">{t('choose_language')}</p>
        </div>
        <div className="grid gap-2">
          <Radio value="en" label="English" />
          <Radio value="hi" label="हिंदी (Hindi)" />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border p-4">
        <div className="text-xs text-gray-600">More settings coming soon…</div>
      </section>
    </div>
  )
}

