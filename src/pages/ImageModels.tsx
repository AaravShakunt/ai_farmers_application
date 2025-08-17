import { useState } from 'react'
import type { ImageCategory } from '../types'
import { analyzeImage } from '../services/mlApi'
import { BottomNav } from '../components/ui/BottomNav'
import { Card } from '../components/ui/Card'
import { useI18n } from '../i18n'

type CaptureState = {
  category: ImageCategory | null
  file: File | null
  result: string | null
  loading: boolean
}

export default function ImageModels() {
  const [state, setState] = useState<CaptureState>({ category: null, file: null, result: null, loading: false })

  const chooseCategory = async (category: ImageCategory) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = async () => {
      const file = input.files?.[0] || null
      if (!file) return
      setState({ category, file, result: null, loading: true })
      const res = await analyzeImage(category, file)
      setState({ category, file, result: res.result, loading: false })
    }
    input.click()
  }

  const ModelTile = ({ label, category, img, description }: { 
    label: string; 
    category: ImageCategory; 
    img: string;
    description: string;
  }) => (
    <button onClick={() => chooseCategory(category)} className="rounded-2xl border p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center gap-3">
        <img src={img} alt={label} className="h-20 w-20 rounded-full object-cover" />
        <div className="text-center">
          <div className="font-medium text-lg">{label}</div>
          <div className="text-xs text-gray-500 mt-1">{description}</div>
        </div>
      </div>
    </button>
  )

  return (
    <div className="mx-auto max-w-screen-md px-4 pb-24 pt-4 md:px-6">
      <div className="mb-6">
        <h1 className="py-3 text-2xl font-bold">AI Image Models</h1>
        <p className="text-gray-600 text-sm">Upload images for AI-powered analysis using our specialized models</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ModelTile 
          label="Plant Analysis" 
          category="plant" 
          img="https://images.unsplash.com/photo-1515096788709-a3cf4ce0a4a6?q=80&w=200" 
          description="Disease detection & health assessment"
        />
        <ModelTile 
          label="Soil Analysis" 
          category="soil" 
          img="https://images.unsplash.com/photo-1527582892131-c1a3c1f0f3f4?q=80&w=200" 
          description="Type, pH, nitrogen & moisture analysis"
        />
        <ModelTile 
          label="Leaf Analysis" 
          category="leaf" 
          img="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=200" 
          description="Detailed leaf health & disease detection"
        />
        <ModelTile 
          label="Insect Detection" 
          category="insect" 
          img="https://images.unsplash.com/photo-1582045071449-84f6f0aba293?q=80&w=200" 
          description="Pest identification & classification"
        />
      </div>

      {state.loading && (
        <Card className="mt-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
            <div className="text-sm text-gray-600">Analyzing image with AI model...</div>
          </div>
        </Card>
      )}

      {state.result && (
        <Card className="mt-6">
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-green-600">
                {state.category ? state.category.charAt(0).toUpperCase() + state.category.slice(1) : 'Model'} Result
              </span>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                AI Analysis
              </span>
            </div>
          </div>
          <div className="whitespace-pre-line text-sm font-mono bg-gray-50 p-3 rounded border">
            {state.result}
          </div>
        </Card>
      )}

      <BottomNav />
    </div>
  )
}