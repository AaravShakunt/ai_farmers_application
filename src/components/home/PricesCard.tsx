import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { MarketPrice, CropPriceDisplay } from '../../types'
import { useI18n } from '../../i18n'
import { getLatestPricesForCommodities, getAveragePrice, type MandiPrice } from '../../services/mandiApi'
import { CacheManager } from '../../lib/cache'

type Props = { prices: MarketPrice[]; loading?: boolean }

const CROP_ICONS: Record<string, string> = {
  'Rice': '🌾',
  'Wheat': '🌾', 
  'Tomato': '🍅',
  'Onion': '🧅',
  'Potato': '🥔',
  'Cotton': '🌿',
  'Sugarcane': '🎋',
  'Maize': '🌽',
  'Soybean': '🫘',
  'Groundnut': '🥜',
  'Chili': '🌶️',
  'Turmeric': '🟡',
  'Ginger': '🫚',
  'Garlic': '🧄',
  'Banana': '🍌'
}

export function PricesCard({ prices, loading }: Props) {
  const { t } = useI18n()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCrops, setSelectedCrops] = useState<CropPriceDisplay[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [cacheInfo, setCacheInfo] = useState<any>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [previousPrices, setPreviousPrices] = useState<Record<string, number>>({})

  const allCrops: CropPriceDisplay[] = [
    { name: 'Rice', unit: 'per quintal', price: 0, change: 0, icon: '🌾' },
    { name: 'Wheat', unit: 'per quintal', price: 0, change: 0, icon: '🌾' },
    { name: 'Tomato', unit: 'per quintal', price: 0, change: 0, icon: '🍅' },
    { name: 'Onion', unit: 'per quintal', price: 0, change: 0, icon: '🧅' },
    { name: 'Potato', unit: 'per quintal', price: 0, change: 0, icon: '🥔' },
    { name: 'Cotton', unit: 'per quintal', price: 0, change: 0, icon: '🌿' },
    { name: 'Sugarcane', unit: 'per quintal', price: 0, change: 0, icon: '🎋' },
    { name: 'Maize', unit: 'per quintal', price: 0, change: 0, icon: '🌽' },
    { name: 'Soybean', unit: 'per quintal', price: 0, change: 0, icon: '🫘' },
    { name: 'Groundnut', unit: 'per quintal', price: 0, change: 0, icon: '🥜' },
    { name: 'Chili', unit: 'per quintal', price: 0, change: 0, icon: '🌶️' },
    { name: 'Turmeric', unit: 'per quintal', price: 0, change: 0, icon: '🟡' },
    { name: 'Ginger', unit: 'per quintal', price: 0, change: 0, icon: '🫚' },
    { name: 'Garlic', unit: 'per quintal', price: 0, change: 0, icon: '🧄' },
    { name: 'Banana', unit: 'per quintal', price: 0, change: 0, icon: '🍌' }
  ]

  // Initialize component with cached data
  useEffect(() => {
    const initializeComponent = () => {
      // Load cached selected crops
      const cachedCrops = CacheManager.loadSelectedCrops()
      if (cachedCrops && cachedCrops.length > 0) {
        setSelectedCrops(cachedCrops)
      } else {
        // Default crops if no cache
        setSelectedCrops([
          { name: 'Rice', unit: 'per quintal', price: 0, change: 0, icon: '🌾' },
          { name: 'Wheat', unit: 'per quintal', price: 0, change: 0, icon: '🌾' },
          { name: 'Tomato', unit: 'per quintal', price: 0, change: 0, icon: '🍅' }
        ])
      }
      
      // Load cached previous prices
      const cachedPreviousPrices = CacheManager.loadPreviousPrices()
      setPreviousPrices(cachedPreviousPrices)
      
      // Get cache info
      setCacheInfo(CacheManager.getCacheInfo())
      
      setIsInitialized(true)
    }
    
    initializeComponent()
  }, [])

  const fetchPricesForSelectedCrops = useCallback(async (forceRefresh: boolean = false) => {
    if (selectedCrops.length === 0) return
    
    setIsLoadingPrices(true)
    try {
      const commodityNames = selectedCrops.map(crop => crop.name)
      const mandiPrices = await getLatestPricesForCommodities(commodityNames, !forceRefresh)
      
      setSelectedCrops(prevCrops => {
        const updatedCrops = prevCrops.map(crop => {
          const mandiPrice = mandiPrices.find(mp => 
            mp.commodity.toLowerCase().includes(crop.name.toLowerCase())
          )
          
          if (mandiPrice) {
            const currentPrice = getAveragePrice(mandiPrice)
            const previousPrice = previousPrices[crop.name] || currentPrice
            const change = previousPrice > 0 ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0
            
            return {
              ...crop,
              price: Math.round(currentPrice),
              change: Number(change.toFixed(1)),
              market: mandiPrice.market,
              date: mandiPrice.arrival_date
            }
          }
          return crop
        })
        
        // Cache updated crops
        CacheManager.saveSelectedCrops(updatedCrops)
        return updatedCrops
      })
      
      setPreviousPrices(prev => {
        const newPreviousPrices = { ...prev }
        mandiPrices.forEach(mp => {
          const price = getAveragePrice(mp)
          if (price > 0) {
            newPreviousPrices[mp.commodity] = Math.round(price)
          }
        })
        // Cache updated previous prices
        CacheManager.savePreviousPrices(newPreviousPrices)
        return newPreviousPrices
      })
      
      // Update cache info
      setCacheInfo(CacheManager.getCacheInfo())
    } catch (error) {
      console.error('Error fetching mandi prices:', error)
    } finally {
      setIsLoadingPrices(false)
    }
  }, [selectedCrops.map(c => c.name).sort().join(','), previousPrices])

  const refreshPrices = useCallback(() => {
    CacheManager.clearPriceCache()
    fetchPricesForSelectedCrops(true)
  }, [fetchPricesForSelectedCrops])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (isInitialized && selectedCrops.length > 0) {
      timeoutId = setTimeout(() => {
        fetchPricesForSelectedCrops()
      }, 100)
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [selectedCrops.map(c => c.name).sort().join(','), isInitialized])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (selectedCrops.length > 0) {
      interval = setInterval(refreshPrices, 5 * 60 * 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [refreshPrices, selectedCrops.length])

  // Filter crops based on search query (max 3 results)
  const filteredCrops = allCrops
    .filter(crop => 
      crop.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedCrops.some(selected => selected.name === crop.name)
    )
    .slice(0, 3)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const addCrop = (crop: CropPriceDisplay) => {
    if (selectedCrops.length < 10 && !selectedCrops.some(c => c.name === crop.name)) {
      const newCrop = { ...crop, price: 0, change: 0 }
      setSelectedCrops(prev => {
        const updated = [...prev, newCrop]
        CacheManager.saveSelectedCrops(updated)
        return updated
      })
    }
    setSearchQuery('')
    setIsDropdownOpen(false)
  }

  const removeCrop = (cropName: string) => {
    setSelectedCrops(prev => {
      const updated = prev.filter(crop => crop.name !== cropName)
      CacheManager.saveSelectedCrops(updated)
      return updated
    })
  }

  if (loading || isLoadingPrices) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-800">{t('market_prices')}</h3>
          <div className="text-lg">💰</div>
        </div>
        
        {/* Scrollable list */}
        <div className="max-h-32 overflow-y-auto space-y-1 mb-2 scrollbar-hide">
          {selectedCrops.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="text-sm mr-1.5">{item.icon}</div>
                <div>
                  <div className="text-xs font-semibold text-gray-800">{item.name}</div>
                  <div className="text-xs text-gray-600">{item.unit}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-gray-800">
                  {item.price > 0 ? `₹${item.price}` : 'Loading...'}
                </div>
                {item.price > 0 && (
                  <div className={`text-xs ${item.change > 0 ? 'text-green-600' : item.change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {item.change > 0 ? '↗' : item.change < 0 ? '↘' : '→'} {Math.abs(item.change)}%
                  </div>
                )}
                {item.market && (
                  <div className="text-xs text-gray-400 truncate max-w-20" title={item.market}>
                    {item.market}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-2">
          {/* Cache Status */}
          {cacheInfo?.priceCache && (
            <div className="text-xs text-gray-500 flex items-center justify-between">
              <span>
                {cacheInfo.priceCache.isExpired ? '📅 Cache expired' : `💾 Cached ${cacheInfo.priceCache.age}m ago`}
              </span>
            </div>
          )}
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Customize
            </button>
            <button 
              onClick={refreshPrices}
              disabled={isLoadingPrices}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center"
              title="Refresh prices (clears cache)"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Customize Prices Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 sticky top-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Customize Market Prices</h3>
                  <p className="text-xs opacity-90">Add or remove crops from your dashboard ({selectedCrops.length}/10)</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {/* Search Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  🔍 Add New Crop to Track
                </label>
                <div className="relative" ref={dropdownRef}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setIsDropdownOpen(e.target.value.length > 0)
                    }}
                    onFocus={() => setIsDropdownOpen(searchQuery.length > 0)}
                    className="w-full p-3 border-2 border-gray-200 bg-white text-gray-900 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Type crop name (e.g., Rice, Wheat, Tomato)..."
                    disabled={selectedCrops.length >= 10}
                  />
                  
                  {/* Search Dropdown */}
                  {isDropdownOpen && searchQuery && filteredCrops.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                      {filteredCrops.map((crop) => (
                        <button
                          key={crop.name}
                          onClick={() => addCrop(crop)}
                          className="w-full p-3 text-left hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center group"
                        >
                          <span className="text-xl mr-3 group-hover:scale-110 transition-transform">{crop.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">{crop.name}</div>
                            <div className="text-xs text-gray-500">{crop.unit}</div>
                          </div>
                          <svg className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {isDropdownOpen && searchQuery && filteredCrops.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 p-4 text-center text-gray-500 text-sm">
                      No crops found matching "{searchQuery}"
                    </div>
                  )}
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  {selectedCrops.length >= 10 ? (
                    <p className="text-xs text-orange-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Maximum 10 crops reached. Remove some to add new ones.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      {10 - selectedCrops.length} more crops can be added
                    </p>
                  )}
                </div>
              </div>

              {/* Current Selected Crops */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">📊</span>
                  Your Tracked Crops
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {selectedCrops.length}/10
                  </span>
                </label>
                
                {selectedCrops.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="text-4xl mb-2">🌾</div>
                    <p className="text-gray-500 text-sm">No crops selected yet</p>
                    <p className="text-gray-400 text-xs">Search above to add crops to track</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-hide">
                    {selectedCrops.map((crop, index) => (
                      <div key={`${crop.name}-${index}`} className="group flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-green-50 hover:to-green-100 rounded-xl transition-all duration-200 border border-gray-200 hover:border-green-300">
                        <div className="flex items-center flex-1">
                          <span className="text-xl mr-3 group-hover:scale-110 transition-transform">{crop.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-800">{crop.name}</div>
                            <div className="text-xs text-gray-600 flex items-center">
                              {crop.price > 0 ? (
                                <span className="font-medium text-green-700">₹{crop.price} {crop.unit}</span>
                              ) : (
                                <span className="text-gray-500">{crop.unit}</span>
                              )}
                              {crop.market && (
                                <span className="ml-2 text-gray-400">• {crop.market}</span>
                              )}
                            </div>
                          </div>
                          {crop.price > 0 && (
                            <div className="text-right mr-3">
                              <div className={`text-xs px-2 py-1 rounded-full ${crop.change > 0 ? 'bg-green-100 text-green-700' : crop.change < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                {crop.change > 0 ? '↗' : crop.change < 0 ? '↘' : '→'} {Math.abs(crop.change)}%
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeCrop(crop.name)}
                          className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm transition-all duration-200 flex items-center justify-center group-hover:scale-110 hover:shadow-lg"
                          title="Remove crop"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Done
                </button>
                {selectedCrops.length > 0 && (
                  <button
                    onClick={refreshPrices}
                    disabled={isLoadingPrices}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg flex items-center justify-center"
                  >
                    {isLoadingPrices ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
