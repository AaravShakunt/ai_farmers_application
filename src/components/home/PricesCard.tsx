import type { MarketPrice } from '../../types'

type Props = { prices: MarketPrice[]; loading?: boolean }

export function PricesCard({ prices, loading }: Props) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Market Prices</h2>
        {loading && <span className="text-xs text-gray-500">Loading…</span>}
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2">
        {prices.map((p) => (
          <div key={p.crop} className="flex items-center justify-between rounded-lg border p-3">
            <div className="font-medium">{p.crop}</div>
            <div className="text-sm text-gray-600">₹ {p.pricePerKg.toFixed(2)} / {p.unit}</div>
          </div>
        ))}
        {prices.length === 0 && !loading && (
          <p className="text-sm text-gray-600">No prices available.</p>
        )}
      </div>
    </div>
  )
}

