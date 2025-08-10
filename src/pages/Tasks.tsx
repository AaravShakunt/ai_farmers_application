import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { BottomNav } from '../components/ui/BottomNav'

type ImageCategory = 'leaf' | 'soil' | 'insects'

interface UploadedImage {
  id: string
  category: ImageCategory
  file: File
  url: string
  timestamp: string
  name: string
  chatSessionId: string
}

interface Plot {
  id: string
  name: string
  location: string
  area: number
  crop: string
  soilType: string
  irrigationType: string
  plantingDate: string
  expectedHarvest: string
  lastChatDate?: string
  hasWorkflow: boolean
  status: 'Active' | 'Planning' | 'Harvested'
}

export default function Tasks() {
  const { t } = useI18n()
  const [showAddPlot, setShowAddPlot] = useState(false)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null)
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<ImageCategory>('leaf')
  const [showAddImageModal, setShowAddImageModal] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Load images from localStorage on component mount
  useEffect(() => {
    const savedImages = localStorage.getItem('chatImages')
    if (savedImages) {
      setUploadedImages(JSON.parse(savedImages))
    }
  }, [])

  const [plots, setPlots] = useState<Plot[]>([
    {
      id: '1',
      name: 'North Field',
      location: 'Karnataka, Bangalore Rural',
      area: 2.5,
      crop: 'Rice',
      soilType: 'Clay Loam',
      irrigationType: 'Drip Irrigation',
      plantingDate: '2024-06-15',
      expectedHarvest: '2024-10-15',
      lastChatDate: '2024-08-10',
      hasWorkflow: true,
      status: 'Active'
    },
    {
      id: '2',
      name: 'South Field',
      location: 'Karnataka, Mysore',
      area: 1.8,
      crop: 'Wheat',
      soilType: 'Sandy Loam',
      irrigationType: 'Sprinkler',
      plantingDate: '2024-07-01',
      expectedHarvest: '2024-11-01',
      lastChatDate: '2024-08-05',
      hasWorkflow: false,
      status: 'Active'
    },
    {
      id: '3',
      name: 'East Field',
      location: 'Karnataka, Hassan',
      area: 3.2,
      crop: 'Cotton',
      soilType: 'Black Soil',
      irrigationType: 'Flood Irrigation',
      plantingDate: '2024-05-20',
      expectedHarvest: '2024-12-20',
      hasWorkflow: true,
      status: 'Active'
    }
  ])

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

  const handleAddPlot = () => {
    if (newPlot.name && newPlot.location && newPlot.crop) {
      const plot: Plot = {
        id: Date.now().toString(),
        name: newPlot.name,
        location: newPlot.location,
        area: parseFloat(newPlot.area) || 0,
        crop: newPlot.crop,
        soilType: newPlot.soilType,
        irrigationType: newPlot.irrigationType,
        plantingDate: newPlot.plantingDate,
        expectedHarvest: newPlot.expectedHarvest,
        hasWorkflow: false,
        status: 'Planning'
      }
      setPlots([...plots, plot])
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

  const getCategoryIcon = (category: ImageCategory) => {
    switch (category) {
      case 'leaf': return '🍃'
      case 'soil': return '🌱'
      case 'insects': return '🐛'
    }
  }

  const getCategoryColor = (category: ImageCategory) => {
    switch (category) {
      case 'leaf': return 'bg-green-100 text-green-800'
      case 'soil': return 'bg-amber-100 text-amber-800'
      case 'insects': return 'bg-red-100 text-red-800'
    }
  }

  const getImagesForPlot = (plotId: string) => {
    return uploadedImages.filter(img => img.chatSessionId === plotId)
  }

  const getImagesByCategory = (plotId: string, category: ImageCategory) => {
    return uploadedImages.filter(img => img.chatSessionId === plotId && img.category === category)
  }

  const openImageGallery = (plotId: string) => {
    setSelectedPlotId(plotId)
    setSelectedGalleryCategory('leaf') // Default to leaf category
    setShowImageGallery(true)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedPlotId) return

    const timestamp = new Date().toLocaleString()
    const name = `${selectedGalleryCategory}_${timestamp.replace(/[/,:]/g, '-')}`
    
    const newImage: UploadedImage = {
      id: Date.now().toString(),
      category: selectedGalleryCategory,
      file,
      url: URL.createObjectURL(file),
      timestamp,
      name,
      chatSessionId: selectedPlotId
    }

    const updatedImages = [...uploadedImages, newImage]
    setUploadedImages(updatedImages)
    localStorage.setItem('chatImages', JSON.stringify(updatedImages))
    setShowAddImageModal(false)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (imageId: string) => {
    const imageToRemove = uploadedImages.find(img => img.id === imageId)
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.url)
    }
    const updatedImages = uploadedImages.filter(img => img.id !== imageId)
    setUploadedImages(updatedImages)
    localStorage.setItem('chatImages', JSON.stringify(updatedImages))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-green-100/40">
      <div className="mx-auto max-w-screen-md px-4 pb-24 pt-4 md:px-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t('my_plots')}</h1>
              <p className="text-sm text-gray-600">{t('manage_your_farming_plots')}</p>
            </div>
            <button
              onClick={() => setShowAddPlot(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('add_plot')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{plots.length}</div>
            <div className="text-xs text-gray-600">{t('total_plots')}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{plots.reduce((sum, plot) => sum + plot.area, 0).toFixed(1)}</div>
            <div className="text-xs text-gray-600">{t('total_area')} (acres)</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{plots.filter(p => p.status === 'Active').length}</div>
            <div className="text-xs text-gray-600">{t('active_plots')}</div>
          </div>
        </div>

        {/* Plots Grid */}
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
                    <div className="text-xs text-gray-600 mb-1">{t('crop')}</div>
                    <div className="text-sm font-semibold text-gray-900">{plot.crop}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">{t('area')}</div>
                    <div className="text-sm font-semibold text-gray-900">{plot.area} acres</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">{t('soil_type')}</div>
                    <div className="text-sm font-semibold text-gray-900">{plot.soilType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">{t('irrigation')}</div>
                    <div className="text-sm font-semibold text-gray-900">{plot.irrigationType}</div>
                  </div>
                </div>

                {/* Planting & Harvest Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">{t('planted_on')}</div>
                    <div className="text-sm font-semibold text-gray-900">{new Date(plot.plantingDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">{t('expected_harvest')}</div>
                    <div className="text-sm font-semibold text-gray-900">{new Date(plot.expectedHarvest).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Last Chat Info */}
                {plot.lastChatDate && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-600 mb-1">{t('last_consultation')}</div>
                    <div className="text-sm font-semibold text-blue-800">{new Date(plot.lastChatDate).toLocaleDateString()}</div>
                  </div>
                )}

                {/* Action Buttons - All Same Size */}
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    to={`/chat?plotId=${plot.id}`}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-2 rounded-lg text-center text-sm font-medium transition-colors flex flex-col items-center justify-center"
                  >
                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-xs">{t('query')}</span>
                  </Link>
                  
                  <Link
                    to={`/workflow?plotId=${plot.id}`}
                    className={`py-3 px-2 rounded-lg text-center text-sm font-medium transition-colors flex flex-col items-center justify-center ${
                      plot.hasWorkflow 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span className="text-xs">{plot.hasWorkflow ? t('workflow') : t('no_workflow')}</span>
                  </Link>

                  {/* Image Gallery Button */}
                  <button
                    onClick={() => openImageGallery(plot.id)}
                    className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-2 rounded-lg text-sm font-medium transition-colors flex flex-col items-center justify-center relative"
                    title="View Images"
                  >
                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">Images</span>
                    {getImagesForPlot(plot.id).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                        {getImagesForPlot(plot.id).length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Plot Modal */}
        {showAddPlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{t('add_new_plot')}</h3>
                  <button 
                    onClick={() => setShowAddPlot(false)}
                    className="text-white hover:text-gray-200 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('plot_name')} *</label>
                    <input
                      type="text"
                      value={newPlot.name}
                      onChange={(e) => setNewPlot({...newPlot, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., North Field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('location')} *</label>
                    <input
                      type="text"
                      value={newPlot.location}
                      onChange={(e) => setNewPlot({...newPlot, location: e.target.value})}
                      className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Karnataka, Bangalore Rural"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('area')} (acres)</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('crop')} *</label>
                      <select
                        value={newPlot.crop}
                        onChange={(e) => setNewPlot({...newPlot, crop: e.target.value})}
                        className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">{t('select_crop')}</option>
                        <option value="Rice">Rice</option>
                        <option value="Wheat">Wheat</option>
                        <option value="Cotton">Cotton</option>
                        <option value="Maize">Maize</option>
                        <option value="Sugarcane">Sugarcane</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('soil_type')}</label>
                    <select
                      value={newPlot.soilType}
                      onChange={(e) => setNewPlot({...newPlot, soilType: e.target.value})}
                      className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">{t('select_soil_type')}</option>
                      <option value="Clay Loam">Clay Loam</option>
                      <option value="Sandy Loam">Sandy Loam</option>
                      <option value="Black Soil">Black Soil</option>
                      <option value="Red Soil">Red Soil</option>
                      <option value="Alluvial Soil">Alluvial Soil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('irrigation_type')}</label>
                    <select
                      value={newPlot.irrigationType}
                      onChange={(e) => setNewPlot({...newPlot, irrigationType: e.target.value})}
                      className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">{t('select_irrigation')}</option>
                      <option value="Drip Irrigation">Drip Irrigation</option>
                      <option value="Sprinkler">Sprinkler</option>
                      <option value="Flood Irrigation">Flood Irrigation</option>
                      <option value="Rain Fed">Rain Fed</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('planting_date')}</label>
                      <input
                        type="date"
                        value={newPlot.plantingDate}
                        onChange={(e) => setNewPlot({...newPlot, plantingDate: e.target.value})}
                        className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('expected_harvest')}</label>
                      <input
                        type="date"
                        value={newPlot.expectedHarvest}
                        onChange={(e) => setNewPlot({...newPlot, expectedHarvest: e.target.value})}
                        className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddPlot(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleAddPlot}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t('add_plot')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Image Gallery Modal with Category Tabs */}
        {showImageGallery && selectedPlotId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
              <div className="bg-purple-500 text-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">
                    Image Gallery - {plots.find(p => p.id === selectedPlotId)?.name}
                  </h3>
                  <button 
                    onClick={() => setShowImageGallery(false)}
                    className="text-white hover:text-gray-200 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs opacity-80 mt-1">
                  Manage images by category - view, add, and remove images
                </p>
              </div>

              {/* Category Tabs */}
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="flex">
                  {(['leaf', 'soil', 'insects'] as ImageCategory[]).map(category => {
                    const count = getImagesByCategory(selectedPlotId, category).length
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedGalleryCategory(category)}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center ${
                          selectedGalleryCategory === category
                            ? 'bg-white text-purple-600 border-b-2 border-purple-500'
                            : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-lg mr-2">{getCategoryIcon(category)}</span>
                        <span className="capitalize">{category}</span>
                        {count > 0 && (
                          <span className="ml-2 bg-purple-100 text-purple-600 text-xs rounded-full px-2 py-1">
                            {count}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {/* Current Category Images */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center px-3 py-2 rounded-full text-sm font-medium ${getCategoryColor(selectedGalleryCategory)}`}>
                      <span className="mr-2 text-lg">{getCategoryIcon(selectedGalleryCategory)}</span>
                      {selectedGalleryCategory.charAt(0).toUpperCase() + selectedGalleryCategory.slice(1)} Images
                    </div>
                    <button
                      onClick={() => setShowAddImageModal(true)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Image
                    </button>
                  </div>

                  {getImagesByCategory(selectedPlotId, selectedGalleryCategory).length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">{getCategoryIcon(selectedGalleryCategory)}</div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        No {selectedGalleryCategory} images yet
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Upload {selectedGalleryCategory} images to help with AI analysis
                      </p>
                      <button
                        onClick={() => setShowAddImageModal(true)}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Upload First Image
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto space-y-2">
                      {getImagesByCategory(selectedPlotId, selectedGalleryCategory).map(image => (
                        <div key={image.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="text-lg">{getCategoryIcon(selectedGalleryCategory)}</div>
                            <div>
                              <div className="text-sm font-medium text-gray-800">{image.name}</div>
                              <div className="text-xs text-gray-500">{image.timestamp}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeImage(image.id)}
                            className="w-8 h-8 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors flex items-center justify-center"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Total: {getImagesForPlot(selectedPlotId).length} images across all categories
                  </div>
                  <Link
                    to={`/chat?plotId=${selectedPlotId}`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Continue Chat Session
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Image Modal */}
        {showAddImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-purple-500 text-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">
                    Add {selectedGalleryCategory.charAt(0).toUpperCase() + selectedGalleryCategory.slice(1)} Image
                  </h3>
                  <button 
                    onClick={() => setShowAddImageModal(false)}
                    className="text-white hover:text-gray-200 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs opacity-80 mt-1">Upload image for better AI analysis</p>
              </div>
              
              <div className="p-6">
                <div className="mb-4 text-center">
                  <div className="text-6xl mb-2">{getCategoryIcon(selectedGalleryCategory)}</div>
                  <div className="text-lg font-semibold capitalize">{selectedGalleryCategory} Image</div>
                </div>

                <div className="mb-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors"
                  />
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Images will be saved with timestamp and linked to this plot.
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
