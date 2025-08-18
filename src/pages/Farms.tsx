import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { BottomNav } from '../components/ui/BottomNav'
import { authStorage } from '../services/authApi'
import type { UserData } from '../services/authApi'
import { 
  getUserFarms, 
  createFarm,
  getFarmImages,
  uploadFarmImage,
  deleteFarmImage,
  type Farm,
  type FarmImage,
  type CreateFarmRequest
} from '../services/farmsApi'
import { CacheManager } from '../lib/cache'
import { v4 as uuid } from 'uuid'

type ImageCategory = 'leaf' | 'soil' | 'insects'

interface UploadedImage {
  id: string
  category: ImageCategory
  file: File
  url: string
  timestamp: string
  name: string
  farmId: string
}

// Toast notification component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  } animate-slide-down`}>
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
        ×
      </button>
    </div>
  </div>
)

export default function Farms() {
  const { t } = useI18n()
  const [showAddPlot, setShowAddPlot] = useState(false)
  const [loading, setLoading] = useState(true)
  const [addingPlot, setAddingPlot] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [plots, setPlots] = useState<Farm[]>([])
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)
  const [farmImages, setFarmImages] = useState<{ [farmId: string]: FarmImage[] }>({})
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory>('leaf')
  const [selectedFarmId, setSelectedFarmId] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newPlot, setNewPlot] = useState({
    name: '',
    location: '',
    area: '',
    crop: '',
    soilType: '',
    irrigationType: '',
    plantingDate: '',
    expectedHarvest: ''
  })

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Get current user on component mount
  useEffect(() => {
    const user = authStorage.getCurrentUser()
    setCurrentUser(user)
  }, [])

  // Load farms from backend with caching
  useEffect(() => {
    const loadFarms = async () => {
      if (!currentUser?.mobile) {
        setLoading(false)
        return
      }

      try {
        // Try to load from cache first
        const cachedFarms = CacheManager.loadFarmsData(currentUser.mobile)
        if (cachedFarms) {
          setPlots(cachedFarms)
          setLoading(false)
          return
        }

        // If no cache, fetch from backend
        const response = await getUserFarms(currentUser.mobile)
        if (response.success) {
          setPlots(response.farms)
          // Save to cache for next time
          CacheManager.saveFarmsData(response.farms, currentUser.mobile)
        }
      } catch (error) {
        console.error('Error loading farms:', error)
        // Try to load from cache as fallback
        const cachedFarms = CacheManager.loadFarmsData(currentUser.mobile)
        if (cachedFarms) {
          setPlots(cachedFarms)
        }
      } finally {
        setLoading(false)
      }
    }

    loadFarms()
  }, [currentUser])

  // Load farm images from backend
  useEffect(() => {
    const loadFarmImages = async () => {
      if (!currentUser?.mobile || plots.length === 0) return

      try {
        const imagePromises = plots.map(async (plot) => {
          const response = await getFarmImages(currentUser.mobile, plot.id)
          return { farmId: plot.id, images: response.success ? response.images : [] }
        })

        const results = await Promise.all(imagePromises)
        const imagesByFarm: { [farmId: string]: FarmImage[] } = {}
        
        results.forEach(({ farmId, images }) => {
          imagesByFarm[farmId] = images
        })

        setFarmImages(imagesByFarm)
      } catch (error) {
        console.error('Error loading farm images:', error)
      }
    }

    loadFarmImages()
  }, [currentUser, plots])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedFarmId || !currentUser?.mobile) return

    try {
      const response = await uploadFarmImage(currentUser.mobile, selectedFarmId, selectedCategory, file)
      if (response.success) {
        // Update local state with new image
        setFarmImages(prev => ({
          ...prev,
          [selectedFarmId]: [...(prev[selectedFarmId] || []), response.image]
        }))
        
        setShowImageModal(false)
        showToast('Image uploaded successfully!', 'success')
      } else {
        showToast('Failed to upload image. Please try again.', 'error')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      showToast('Failed to upload image. Please check your connection.', 'error')
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getImagesByFarm = (farmId: string): FarmImage[] => {
    return farmImages[farmId] || []
  }

  const getCategoryIcon = (category: ImageCategory) => {
    switch (category) {
      case 'leaf': return '🍃'
      case 'soil': return '🌱'
      case 'insects': return '🐛'
    }
  }

  const removeImage = async (imageId: string) => {
    if (!currentUser?.mobile) return

    // Find the image to get farm and category info
    let imageToRemove: FarmImage | null = null
    let farmId = ''
    
    for (const [fId, images] of Object.entries(farmImages)) {
      const found = images.find(img => img.id === imageId)
      if (found) {
        imageToRemove = found
        farmId = fId
        break
      }
    }

    if (!imageToRemove || !farmId) return

    try {
      const response = await deleteFarmImage(
        currentUser.mobile, 
        farmId, 
        imageToRemove.category, 
        imageToRemove.filename
      )
      
      if (response.success) {
        // Update local state
        setFarmImages(prev => ({
          ...prev,
          [farmId]: prev[farmId].filter(img => img.id !== imageId)
        }))
        showToast('Image removed successfully!', 'success')
      } else {
        showToast('Failed to remove image. Please try again.', 'error')
      }
    } catch (error) {
      console.error('Error removing image:', error)
      showToast('Failed to remove image. Please check your connection.', 'error')
    }
  }

  const handleAddPlot = async () => {
    if (!newPlot.name || !newPlot.location || !newPlot.crop || !currentUser?.mobile) {
      showToast('Please fill in all required fields (Name, Location, Crop)', 'error')
      return
    }

    setAddingPlot(true)
    try {
      const farmData: CreateFarmRequest = {
        name: newPlot.name,
        location: newPlot.location,
        area: parseFloat(newPlot.area) || 0,
        crop: newPlot.crop,
        soilType: newPlot.soilType || 'Clay Loam',
        irrigationType: newPlot.irrigationType || 'Drip Irrigation',
        plantingDate: newPlot.plantingDate || new Date().toISOString().split('T')[0],
        expectedHarvest: newPlot.expectedHarvest || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Planning',
        hasWorkflow: false
      }

      const response = await createFarm(currentUser.mobile, farmData)
      if (response.success) {
        const updatedPlots = [...plots, response.farm]
        setPlots(updatedPlots)
        // Update cache with new farm
        CacheManager.saveFarmsData(updatedPlots, currentUser.mobile)
        setNewPlot({
          name: '',
          location: '',
          area: '',
          crop: '',
          soilType: '',
          irrigationType: '',
          plantingDate: '',
          expectedHarvest: ''
        })
        setShowAddPlot(false)
        showToast('Farm created successfully!', 'success')
      } else {
        showToast('Failed to create farm. Please try again.', 'error')
      }
    } catch (error) {
      console.error('Error creating farm:', error)
      showToast('Failed to create farm. Please check your connection and try again.', 'error')
    } finally {
      setAddingPlot(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Planning': return 'bg-blue-100 text-blue-800'
      case 'Harvested': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCropIcon = (crop: string) => {
    switch (crop.toLowerCase()) {
      case 'rice': return '🌾'
      case 'wheat': return '🌾'
      case 'cotton': return '🌿'
      case 'maize': return '🌽'
      case 'sugarcane': return '🎋'
      default: return '🌱'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-green-100/40">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      <div className="mx-auto max-w-screen-md px-4 pb-24 pt-4 md:px-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Farms</h1>
              <p className="text-sm text-gray-600">Manage your farming operations</p>
            </div>
            <button
              onClick={() => setShowAddPlot(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Farm
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{plots.length}</div>
            <div className="text-xs text-gray-600">Total Farms</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{plots.reduce((sum, plot) => sum + plot.area, 0).toFixed(1)}</div>
            <div className="text-xs text-gray-600">Total Area (acres)</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{plots.filter(p => p.status === 'Active').length}</div>
            <div className="text-xs text-gray-600">Active Farms</div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your farms...</p>
          </div>
        ) : plots.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🌾</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No farms yet</h3>
            <p className="text-gray-600 mb-4">Create your first farm to get started</p>
            <button
              onClick={() => setShowAddPlot(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add Your First Farm
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {plots.map((plot) => (
              <div key={plot.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Plot Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{getCropIcon(plot.crop)}</div>
                      <div>
                        <h3 className="text-lg font-bold">{plot.name}</h3>
                        <p className="text-sm opacity-90">{plot.location}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(plot.status)}`}>
                      {plot.status}
                    </div>
                  </div>
                </div>

                {/* Plot Details */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Crop</div>
                      <div className="text-sm font-semibold text-gray-900">{plot.crop}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Area</div>
                      <div className="text-sm font-semibold text-gray-900">{plot.area} acres</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Soil Type</div>
                      <div className="text-sm font-semibold text-gray-900">{plot.soilType}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Irrigation</div>
                      <div className="text-sm font-semibold text-gray-900">{plot.irrigationType}</div>
                    </div>
                  </div>

                  {/* Planting & Harvest Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Planted On</div>
                      <div className="text-sm font-semibold text-gray-900">{new Date(plot.plantingDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Expected Harvest</div>
                      <div className="text-sm font-semibold text-gray-900">{new Date(plot.expectedHarvest).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Images Section */}
                  {getImagesByFarm(plot.id).length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-600 mb-2">Farm Images ({getImagesByFarm(plot.id).length})</div>
                      <div className="flex flex-wrap gap-2">
                        {getImagesByFarm(plot.id).slice(0, 3).map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute top-1 right-1">
                              <button
                                onClick={() => removeImage(image.id)}
                                className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                              {getCategoryIcon(image.category)}
                            </div>
                          </div>
                        ))}
                        {getImagesByFarm(plot.id).length > 3 && (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-600">
                            +{getImagesByFarm(plot.id).length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      to={`/chat?plotId=${plot.id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-2 rounded-lg text-center text-sm font-medium transition-colors flex flex-col items-center justify-center"
                    >
                      <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-xs">Chat</span>
                    </Link>
                    
                    <Link
                      to={`/workflow?plotId=${plot.id}`}
                      className="bg-green-500 hover:bg-green-600 text-white py-3 px-2 rounded-lg text-center text-sm font-medium transition-colors flex flex-col items-center justify-center"
                    >
                      <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <span className="text-xs">Workflow</span>
                    </Link>

                    <button
                      onClick={() => {
                        setSelectedFarmId(plot.id)
                        setSelectedCategory('leaf')
                        setShowImageModal(true)
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-2 rounded-lg text-center text-sm font-medium transition-colors flex flex-col items-center justify-center relative"
                    >
                      <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs">Images</span>
                      {getImagesByFarm(plot.id).length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {getImagesByFarm(plot.id).length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Simple Add Plot Modal - Fixed positioning and z-index */}
        {showAddPlot && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Add New Farm</h3>
                  <button 
                    onClick={() => setShowAddPlot(false)}
                    className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name *</label>
                    <input
                      type="text"
                      value={newPlot.name}
                      onChange={(e) => setNewPlot({...newPlot, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., North Field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      value={newPlot.location}
                      onChange={(e) => setNewPlot({...newPlot, location: e.target.value})}
                      className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your farm location"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Area (acres)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newPlot.area}
                        onChange={(e) => setNewPlot({...newPlot, area: e.target.value})}
                        className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="2.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Crop *</label>
                      <input
                        type="text"
                        value={newPlot.crop}
                        onChange={(e) => setNewPlot({...newPlot, crop: e.target.value})}
                        className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., Rice, Wheat, Cotton"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                    <input
                      type="text"
                      value={newPlot.soilType}
                      onChange={(e) => setNewPlot({...newPlot, soilType: e.target.value})}
                      className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Clay Loam, Sandy Loam"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation Type</label>
                    <input
                      type="text"
                      value={newPlot.irrigationType}
                      onChange={(e) => setNewPlot({...newPlot, irrigationType: e.target.value})}
                      className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Drip Irrigation, Sprinkler"
                    />
                  </div>

                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddPlot(false)}
                    disabled={addingPlot}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPlot}
                    disabled={addingPlot}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    {addingPlot ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      'Add Farm'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Upload Modal */}
        {showImageModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Upload Farm Image</h3>
                  <button 
                    onClick={() => setShowImageModal(false)}
                    className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['leaf', 'soil', 'insects'] as ImageCategory[]).map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`p-3 rounded-lg border-2 text-center transition-colors ${
                          selectedCategory === category
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{getCategoryIcon(category)}</div>
                        <div className="text-xs font-medium capitalize">{category}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Image</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload images of your farm for analysis and record keeping
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choose Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  )
}
