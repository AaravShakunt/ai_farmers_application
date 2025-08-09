import type { MarketPrice } from '../../types'
import { Card } from '../ui/Card'
import { useI18n } from '../../i18n'

type Props = { prices: MarketPrice[]; loading?: boolean }

export function PricesCard({ prices, loading }: Props) {
  const { t } = useI18n()
  return (
    <Card title={t('market_prices')} right={loading ? <span className="text-xs text-gray-500">Loading…</span> : null}>
      <div className="mt-2 grid grid-cols-1 gap-2">
        {prices.map((p) => (
          <div key={p.crop} className="flex items-center justify-between rounded-xl border p-3">
            <div className="font-medium">{p.crop}</div>
            <div className="text-sm text-gray-700">₹ {p.pricePerKg.toFixed(2)} / {p.unit}</div>
          </div>
        ))}
        {prices.length === 0 && !loading && (
          <p className="text-sm text-gray-600">No prices available.</p>
        )}
      </div>
    </Card>
  )
}

