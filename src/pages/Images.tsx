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

export default function Images() {
  const [state, setState] = useState<CaptureState>({ category: null, file: null, result: null, loading: false })
  const { t } = useI18n()

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

  const Tile = ({ label, category, img }: { label: string; category: ImageCategory; img: string }) => (
    <button onClick={() => chooseCategory(category)} className="rounded-2xl border p-4 shadow-sm">
      <div className="flex flex-col items-center gap-2">
        <img src={img} alt={label} className="h-24 w-24 rounded-full object-cover" />
        <div className="font-medium">{label}</div>
      </div>
    </button>
  )

  return (
    <div className="mx-auto max-w-screen-md px-4 pb-24 pt-4 md:px-6">
      <h1 className="py-3 text-xl font-bold">{t('images')}</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Tile label="Leaf" category="leaf" img="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=200" />
        <Tile label="Soil" category="soil" img="https://images.unsplash.com/photo-1527582892131-c1a3c1f0f3f4?q=80&w=200" />
        <Tile label="Plant" category="plant" img="https://images.unsplash.com/photo-1515096788709-a3cf4ce0a4a6?q=80&w=200" />
      </div>

      {state.loading && <div className="mt-4 text-sm text-gray-600">{t('analyzing')}</div>}
      {state.result && (
        <Card className="mt-4">
          <div className="text-sm text-gray-500">Category: {state.category}</div>
          <div className="mt-1 font-medium">{state.result}</div>
        </Card>
      )}

      <BottomNav />
    </div>
  )
}

