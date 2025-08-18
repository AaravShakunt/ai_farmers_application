import { useState, useRef } from 'react'
import { useI18n } from '../../i18n'

interface UploadedImage {
  id: string
  file: File
  preview: string
  category: string
}

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onImagesConfirm: (images: UploadedImage[]) => void
  maxImages?: number
}

export function ImageUploadModal({ 
  isOpen, 
  onClose, 
  onImagesConfirm, 
  maxImages = 5 
}: ImageUploadModalProps) {
  const { t } = useI18n()
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    { value: 'leaf', label: 'Leaf Disease' },
    { value: 'soil', label: 'Soil Analysis' },
    { value: 'plant', label: 'Plant Health' },
    { value: 'pest', label: 'Pest/Insect' },
    { value: 'general', label: 'General' }
  ]

  if (!isOpen) return null

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newImages: UploadedImage[] = []
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/') && uploadedImages.length + newImages.length < maxImages) {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        const preview = URL.createObjectURL(file)
        
        newImages.push({
          id,
          file,
          preview,
          category: 'general'
        })
      }
    })

    setUploadedImages(prev => [...prev, ...newImages])
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const removeImage = (id: string) => {
    setUploadedImages(prev => {
      const updated = prev.filter(img => img.id !== id)
      // Clean up object URL to prevent memory leaks
      const imageToRemove = prev.find(img => img.id === id)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      return updated
    })
  }

  const updateImageCategory = (id: string, category: string) => {
    setUploadedImages(prev => 
      prev.map(img => img.id === id ? { ...img, category } : img)
    )
  }

  const handleConfirm = () => {
    onImagesConfirm(uploadedImages)
    handleClose()
  }

  const handleClose = () => {
    // Clean up object URLs
    uploadedImages.forEach(img => URL.revokeObjectURL(img.preview))
    setUploadedImages([])
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-green-500 text-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Upload Images</h3>
            <button 
              onClick={handleClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-xs opacity-80 mt-1">
            Add up to {maxImages} images for analysis ({uploadedImages.length}/{maxImages})
          </p>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive 
                ? 'border-green-500 bg-green-50' 
                : uploadedImages.length >= maxImages
                ? 'border-gray-300 bg-gray-50'
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploadedImages.length >= maxImages ? (
              <div className="text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">Maximum images reached</p>
                <p className="text-sm">Remove some images to add more</p>
              </div>
            ) : (
              <div>
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drop images here or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports JPG, PNG, WebP up to 10MB each
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  disabled={uploadedImages.length >= maxImages}
                >
                  Choose Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Uploaded Images */}
          {uploadedImages.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">Uploaded Images</h4>
              <div className="space-y-4">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl">
                    {/* Image Preview */}
                    <div className="flex-shrink-0">
                      <img
                        src={image.preview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    </div>
                    
                    {/* Image Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {image.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(image.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      
                      {/* Category Selection */}
                      <div className="mt-2">
                        <select
                          value={image.category}
                          onChange={(e) => updateImageCategory(image.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeImage(image.id)}
                      className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={uploadedImages.length === 0}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                uploadedImages.length > 0
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add Images ({uploadedImages.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
