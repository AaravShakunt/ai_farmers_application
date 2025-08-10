import { useState, useRef, useEffect } from 'react'
import type { MarketPrice } from '../../types'
import { useI18n } from '../../i18n'

type Props = { prices: MarketPrice[]; loading?: boolean }

interface CropOption {
  name: string
  unit: string
  price: number
  change: number
  icon: string
}

export function PricesCard({ prices, loading }: Props) {
  const { t } = useI18n()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCrops, setSelectedCrops] = useState<CropOption[]>([
    { name: 'Rice', unit: 'per kg', price: 45, change: 2.5, icon: '🌾' },
    { name: 'Wheat', unit: 'per kg', price: 32, change: -1.2, icon: '🌾' },
    { name: 'Tomato', unit: 'per kg', price: 28, change: 5.8, icon: '🍅' }
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // All available crops
  const allCrops: CropOption[] = [
    { name: 'Rice', unit: 'per kg', price: 45, change: 2.5, icon: '🌾' },
    { name: 'Wheat', unit: 'per kg', price: 32, change: -1.2, icon: '🌾' },
    { name: 'Tomato', unit: 'per kg', price: 28, change: 5.8, icon: '🍅' },
    { name: 'Onion', unit: 'per kg', price: 22, change: -3.1, icon: '🧅' },
    { name: 'Potato', unit: 'per kg', price: 18, change: 0.5, icon: '🥔' },
    { name: 'Cotton', unit: 'per quintal', price: 5800, change: 1.8, icon: '🌿' },
    { name: 'Sugarcane', unit: 'per quintal', price: 350, change: -0.8, icon: '🎋' },
    { name: 'Maize', unit: 'per kg', price: 28, change: 2.1, icon: '🌽' },
    { name: 'Soybean', unit: 'per kg', price: 65, change: 3.2, icon: '🫘' },
    { name: 'Groundnut', unit: 'per kg', price: 95, change: -1.5, icon: '🥜' },
    { name: 'Chili', unit: 'per kg', price: 180, change: 8.2, icon: '🌶️' },
    { name: 'Turmeric', unit: 'per kg', price: 120, change: 4.1, icon: '🟡' },
    { name: 'Ginger', unit: 'per kg', price: 85, change: -2.3, icon: '🫚' },
    { name: 'Garlic', unit: 'per kg', price: 150, change: 6.7, icon: '🧄' },
    { name: 'Banana', unit: 'per dozen', price: 40, change: 1.9, icon: '🍌' }
  ]

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

  const addCrop = (crop: CropOption) => {
    if (selectedCrops.length < 10) { // Limit to 10 crops
      setSelectedCrops([...selectedCrops, crop])
    }
    setSearchQuery('')
    setIsDropdownOpen(false)
  }

  const removeCrop = (cropName: string) => {
    setSelectedCrops(selectedCrops.filter(crop => crop.name !== cropName))
  }

  if (loading) {
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
                <div className="text-xs font-bold text-gray-800">₹{item.price}</div>
                <div className={`text-xs ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.change > 0 ? '↗' : '↘'} {Math.abs(item.change)}%
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Full width button like weather card */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Customize Prices
        </button>
      </div>

      {/* Customize Prices Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Customize Market Prices</h3>
                  <p className="text-xs opacity-90">Add or remove crops from your list</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {/* Search Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New Crop
                </label>
                <div className="relative" ref={dropdownRef}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setIsDropdownOpen(true)
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Search for crops (e.g., Rice, Wheat, Tomato)"
                  />
                  
                  {/* Search Dropdown */}
                  {isDropdownOpen && searchQuery && filteredCrops.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                      {filteredCrops.map((crop) => (
                        <button
                          key={crop.name}
                          onClick={() => addCrop(crop)}
                          className="w-full p-3 text-left hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center"
                        >
                          <span className="text-lg mr-3">{crop.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-800">{crop.name}</div>
                            <div className="text-xs text-gray-500">₹{crop.price} {crop.unit}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedCrops.length >= 10 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Maximum 10 crops allowed
                  </p>
                )}
              </div>

              {/* Current Selected Crops */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Selected Crops ({selectedCrops.length}/10)
                </label>
                <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-hide">
                  {selectedCrops.map((crop, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{crop.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-800">{crop.name}</div>
                          <div className="text-xs text-gray-500">₹{crop.price} {crop.unit}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeCrop(crop.name)}
                        className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors flex items-center justify-center"
                        title="Remove crop"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
