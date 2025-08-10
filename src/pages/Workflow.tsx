import { useState, useEffect } from 'react'
import { useSearchParams, useLocation, Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { BottomNav } from '../components/ui/BottomNav'

interface WorkflowStep {
  id: string
  title: string
  description: string
  priority: 'High' | 'Medium' | 'Low'
  category: 'Irrigation' | 'Fertilization' | 'Pest Control' | 'Harvesting' | 'Soil Management' | 'General'
  estimatedTime: string
  tools: string[]
  completed: boolean
  dueDate?: string
  notes?: string
}

interface PlotWorkflow {
  plotId: string
  plotName: string
  crop: string
  lastUpdated: string
  steps: WorkflowStep[]
}

export default function Workflow() {
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const plotId = searchParams.get('plotId')
  const [workflow, setWorkflow] = useState<PlotWorkflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [chatSummary, setChatSummary] = useState<any>(null)
  const [chatImages, setChatImages] = useState<any[]>([])

  // Check if we have chat data from navigation state
  useEffect(() => {
    if (location.state) {
      const { chatSummary: summary, chatId, images } = location.state as any
      if (summary) {
        setChatSummary(summary)
        setChatImages(images || [])
      }
    }
  }, [location.state])

  // Mock workflow data based on plotId
  useEffect(() => {
    const mockWorkflows: { [key: string]: PlotWorkflow } = {
      '1': {
        plotId: '1',
        plotName: 'North Field',
        crop: 'Rice',
        lastUpdated: '2024-08-10',
        steps: [
          {
            id: '1',
            title: 'Apply Nitrogen Fertilizer',
            description: 'Apply 40kg/acre of Urea fertilizer to boost rice growth during tillering stage.',
            priority: 'High',
            category: 'Fertilization',
            estimatedTime: '2-3 hours',
            tools: ['Fertilizer spreader', 'Urea fertilizer', 'Protective gear'],
            completed: false,
            dueDate: '2024-08-15',
            notes: 'Apply early morning or late evening to avoid heat stress'
          },
          {
            id: '2',
            title: 'Monitor for Brown Plant Hopper',
            description: 'Check rice plants for brown plant hopper infestation, especially lower leaves.',
            priority: 'High',
            category: 'Pest Control',
            estimatedTime: '1 hour',
            tools: ['Magnifying glass', 'Notebook', 'Camera'],
            completed: true,
            dueDate: '2024-08-12'
          },
          {
            id: '3',
            title: 'Adjust Water Level',
            description: 'Maintain 2-3 cm water level in rice field for optimal growth.',
            priority: 'Medium',
            category: 'Irrigation',
            estimatedTime: '30 minutes',
            tools: ['Water level gauge', 'Irrigation controls'],
            completed: false,
            dueDate: '2024-08-16'
          },
          {
            id: '4',
            title: 'Weed Control',
            description: 'Remove weeds manually or apply selective herbicide to prevent competition.',
            priority: 'Medium',
            category: 'General',
            estimatedTime: '4-5 hours',
            tools: ['Hand weeder', 'Herbicide sprayer', 'Gloves'],
            completed: false,
            dueDate: '2024-08-20'
          }
        ]
      },
      '3': {
        plotId: '3',
        plotName: 'East Field',
        crop: 'Cotton',
        lastUpdated: '2024-08-08',
        steps: [
          {
            id: '1',
            title: 'Apply Potash Fertilizer',
            description: 'Apply 30kg/acre of Muriate of Potash for better fiber quality.',
            priority: 'High',
            category: 'Fertilization',
            estimatedTime: '2 hours',
            tools: ['Fertilizer spreader', 'Potash fertilizer'],
            completed: false,
            dueDate: '2024-08-14'
          },
          {
            id: '2',
            title: 'Bollworm Monitoring',
            description: 'Check cotton bolls for bollworm damage and apply treatment if needed.',
            priority: 'High',
            category: 'Pest Control',
            estimatedTime: '2 hours',
            tools: ['Insecticide sprayer', 'Bt spray', 'Protective gear'],
            completed: false,
            dueDate: '2024-08-13'
          },
          {
            id: '3',
            title: 'Soil Moisture Check',
            description: 'Check soil moisture levels and adjust irrigation schedule.',
            priority: 'Medium',
            category: 'Soil Management',
            estimatedTime: '1 hour',
            tools: ['Soil moisture meter', 'Auger'],
            completed: true,
            dueDate: '2024-08-10'
          }
        ]
      }
    }

    setTimeout(() => {
      if (plotId && mockWorkflows[plotId]) {
        setWorkflow(mockWorkflows[plotId])
      }
      setLoading(false)
    }, 1000)
  }, [plotId])

  const toggleStepCompletion = (stepId: string) => {
    if (!workflow) return
    
    const updatedSteps = workflow.steps.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    )
    
    setWorkflow({ ...workflow, steps: updatedSteps })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Irrigation': return '💧'
      case 'Fertilization': return '🌱'
      case 'Pest Control': return '🐛'
      case 'Harvesting': return '🌾'
      case 'Soil Management': return '🌍'
      default: return '📋'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Irrigation': return 'bg-blue-50 border-blue-200'
      case 'Fertilization': return 'bg-green-50 border-green-200'
      case 'Pest Control': return 'bg-red-50 border-red-200'
      case 'Harvesting': return 'bg-yellow-50 border-yellow-200'
      case 'Soil Management': return 'bg-brown-50 border-brown-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-green-100/40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading_workflow')}</p>
        </div>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-green-100/40">
        <div className="mx-auto max-w-screen-md px-4 pb-24 pt-4 md:px-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{t('no_workflow_available')}</h2>
            <p className="text-gray-600 mb-6">{t('no_workflow_description')}</p>
            <Link
              to="/tasks"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {t('back_to_plots')}
            </Link>
          </div>
          <BottomNav />
        </div>
      </div>
    )
  }

  const completedSteps = workflow.steps.filter(step => step.completed).length
  const totalSteps = workflow.steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-green-100/40">
      <div className="mx-auto max-w-screen-md px-4 pb-24 pt-4 md:px-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/tasks"
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('back_to_plots')}
            </Link>
            <Link
              to={`/chat?plotId=${workflow.plotId}`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {t('ask_ai')}
            </Link>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold text-gray-800">{workflow.plotName} - {t('workflow')}</h1>
                <p className="text-sm text-gray-600">{workflow.crop} • {t('last_updated')}: {new Date(workflow.lastUpdated).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{completedSteps}/{totalSteps}</div>
                <div className="text-xs text-gray-600">{t('completed')}</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-1">{Math.round(progressPercentage)}% {t('complete')}</div>
          </div>
        </div>

        {/* Chat Summary Section - Only show if we have chat data */}
        {chatSummary && (
          <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">AI Chat Summary & Recommendations</h2>
              <div className="text-xs text-gray-500">Generated from recent chat session</div>
            </div>
            
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">{chatSummary.summary}</p>
            </div>

            {/* Chat Images Summary */}
            {chatImages.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-2">
                  Images Analyzed: {chatImages.length} images
                </div>
                <div className="flex flex-wrap gap-2">
                  {chatImages.map((image, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {image.category} ({new Date(image.timestamp).toLocaleDateString()})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Recommendations Chart */}
            {chatSummary.points && chatSummary.points.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-3">Key Recommendations Priority</div>
                <div className="space-y-2">
                  {chatSummary.points.map((point: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <div className="w-24 text-xs text-gray-600 truncate">{point.label}</div>
                      <div className="flex-1 mx-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(point.value / Math.max(...chatSummary.points.map((p: any) => p.value))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-gray-700 w-8">{point.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Workflow Steps */}
        <div className="space-y-4">
          {workflow.steps.map((step, index) => (
            <div key={step.id} className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${step.completed ? 'opacity-75' : ''}`}>
              {/* Step Header */}
              <div className={`p-4 border-l-4 ${getCategoryColor(step.category)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center mr-3">
                      <button
                        onClick={() => toggleStepCompletion(step.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          step.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {step.completed && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <div className="ml-2 text-lg">{getCategoryIcon(step.category)}</div>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${step.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(step.priority)}`}>
                      {step.priority}
                    </div>
                    {step.dueDate && (
                      <div className="text-xs text-gray-500">
                        {t('due')}: {new Date(step.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step Details */}
              <div className="p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-600 mb-2">{t('estimated_time')}</div>
                    <div className="text-sm font-semibold text-gray-800">{step.estimatedTime}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-600 mb-2">{t('category')}</div>
                    <div className="text-sm font-semibold text-gray-800">{step.category}</div>
                  </div>
                </div>

                {/* Tools Required */}
                <div className="mt-4">
                  <div className="text-xs text-gray-600 mb-2">{t('tools_required')}</div>
                  <div className="flex flex-wrap gap-2">
                    {step.tools.map((tool, toolIndex) => (
                      <span key={toolIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {step.notes && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-xs text-yellow-700 mb-1">{t('notes')}</div>
                    <div className="text-sm text-yellow-800">{step.notes}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <BottomNav />
      </div>
    </div>
  )
}
