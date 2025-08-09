import { useState } from 'react'
import type { ImageCategory } from '../types'
import { analyzeImage } from '../services/mockApi'

type CaptureState = {
  category: ImageCategory | null
  file: File | null
  result: string | null
  loading: boolean
}

export default function Images() {
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

  const Button = ({ label, category, img }: { label: string; category: ImageCategory; img: string }) => (
    <button onClick={() => chooseCategory(category)} className="card flex flex-col items-center gap-2">
      <img src={img} alt={label} className="h-24 w-24 rounded-full object-cover" />
      <div className="font-medium">{label}</div>
    </button>
  )

  return (
    <div className="container-app pb-8">
      <h1 className="py-3 text-xl font-bold">Image Models</h1>
      <div className="grid-2">
        <Button label="Leaf" category="leaf" img="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=200" />
        <Button label="Soil" category="soil" img="https://images.unsplash.com/photo-1527582892131-c1a3c1f0f3f4?q=80&w=200" />
        <Button label="Plant" category="plant" img="https://images.unsplash.com/photo-1515096788709-a3cf4ce0a4a6?q=80&w=200" />
      </div>

      {state.loading && <div className="mt-4 text-sm text-gray-600">Analyzing…</div>}
      {state.result && (
        <div className="card mt-4">
          <div className="text-sm text-gray-500">Category: {state.category}</div>
          <div className="mt-1 font-medium">{state.result}</div>
        </div>
      )}
    </div>
  )
}

