import type { WeatherData } from '../../types'
import { Card } from '../ui/Card'
import { useI18n } from '../../i18n'

type Props = { data: WeatherData | null; loading?: boolean }

export function WeatherCard({ data, loading }: Props) {
  const { t } = useI18n()
  return (
    <Card title={t('weather')} right={loading ? <span className="text-xs text-gray-500">Loading…</span> : null}>
      {data ? (
        <div className="mt-2 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-3xl font-bold text-emerald-700">{data.temperatureC}°C</div>
            <div className="text-xs text-gray-500">{t('temp')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-700">{data.humidityPct}%</div>
            <div className="text-xs text-gray-500">{t('humidity')}</div>
          </div>
          <div>
            <div className="text-base font-semibold text-gray-900">{data.condition}</div>
            <div className="text-xs text-gray-500">{t('condition')}</div>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-600">No data.</p>
      )}
    </Card>
  )
}

