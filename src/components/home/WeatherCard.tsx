import type { WeatherData } from '../../types'

type Props = { data: WeatherData | null; loading?: boolean }

export function WeatherCard({ data, loading }: Props) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Weather</h2>
        {loading && <span className="text-xs text-gray-500">Loading…</span>}
      </div>
      {data ? (
        <div className="mt-2 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-3xl font-bold">{data.temperatureC}°C</div>
            <div className="text-xs text-gray-500">Temp</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{data.humidityPct}%</div>
            <div className="text-xs text-gray-500">Humidity</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{data.condition}</div>
            <div className="text-xs text-gray-500">Condition</div>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-600">No data.</p>
      )}
    </div>
  )
}

