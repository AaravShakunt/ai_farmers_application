import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useLocation, Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { BottomNav } from '../components/ui/BottomNav'
import { workflowApi, type WorkflowTask } from '../services/workflowApi'
import { CacheManager } from '../lib/cache'


interface PlotWorkflow {
  plotId: string
  plotName: string
  crop: string
  lastUpdated: string
  tasks: WorkflowTask[]
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
  const isLoadingRef = useRef(false)
  const hasLoadedChatWorkflow = useRef(false)

  // Check if we have chat data from navigation state
  useEffect(() => {
    if (location.state) {
      const { chatSummary: summary, images } = location.state as any
      if (summary) {
        setChatSummary(summary)
        setChatImages(images || [])
      }
    }
  }, [location.state])

  // Load workflows - either from chat data or default for the plot
  useEffect(() => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      return
    }
    
    // If we have chat data and already loaded chat workflow, don't reload
    if (chatSummary && hasLoadedChatWorkflow.current) {
      return
    }

    const loadWorkflows = async () => {
      isLoadingRef.current = true
      try {
        let tasks: WorkflowTask[] = []
        let workflowData: PlotWorkflow
        
        const crop = plotId === '1' ? 'rice' : plotId === '3' ? 'cotton' : 'general'

        // First, check if we have cached workflows from the recent chat
        const cachedWorkflow = CacheManager.loadWorkflow(plotId || '1', chatSummary?.chatId)
        
        if (cachedWorkflow && cachedWorkflow.generated_from_chat) {
          // Use cached workflows (includes completion status and all tasks)
          tasks = cachedWorkflow.tasks
          hasLoadedChatWorkflow.current = true
          
          console.log('Loaded workflows from cache:', { 
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.completed).length,
            cacheAge: Math.floor((Date.now() - cachedWorkflow.timestamp) / (1000 * 60))
          })
          
        } else if (chatSummary && chatSummary.summary && !hasLoadedChatWorkflow.current) {
          // No cache found but we have chat data - try to generate fresh workflows
          try {
            // Extract chat messages for workflow generation
            const chatMessages = [
              { role: 'user', content: 'Agricultural consultation' },
              { role: 'assistant', content: chatSummary.summary }
            ]
            
            const workflowResponse = await workflowApi.generateWorkflowsFromChat({
              chat_messages: chatMessages,
              plot_id: plotId || undefined,
              crop_type: crop
            })
            
            // If chat generation was successful, add default tasks + generated tasks
            if (workflowResponse.generated_from_chat && workflowResponse.tasks.length > 0) {
              // First get default tasks
              try {
                const defaultResponse = await workflowApi.getDefaultWorkflows(crop)
                tasks = [...defaultResponse.tasks]
              } catch (defaultError) {
                // Fallback defaults if API fails
                tasks = [
                  { id: 'default_1', title: 'Daily field inspection', estimated_time: '1 hour', completed: false },
                  { id: 'default_2', title: 'Check weather forecast', estimated_time: '15 min', completed: false },
                  { id: 'default_3', title: 'Plan next day activities', estimated_time: '30 min', completed: false }
                ]
              }
              
              // Then add generated tasks with unique IDs
              const generatedTasks = workflowResponse.tasks.map((task, index) => ({
                ...task,
                id: `chat_${index + 1}`
              }))
              tasks = [...tasks, ...generatedTasks]
              hasLoadedChatWorkflow.current = true
              
              // Cache the generated workflows for future use
              CacheManager.saveWorkflow(
                workflowResponse.tasks, 
                plotId || '1', 
                chatSummary.chatId || 'unknown', 
                true
              )
            } else {
              // If generation failed or returned no tasks, use defaults only
              const defaultResponse = await workflowApi.getDefaultWorkflows(crop)
              tasks = defaultResponse.tasks
            }
          } catch (error) {
            console.error('Failed to generate workflows from chat:', error)
            // Fallback to defaults only
            try {
              const defaultResponse = await workflowApi.getDefaultWorkflows(crop)
              tasks = defaultResponse.tasks
            } catch (defaultError) {
              tasks = [
                { id: 'default_1', title: 'Daily field inspection', estimated_time: '1 hour', completed: false },
                { id: 'default_2', title: 'Check weather forecast', estimated_time: '15 min', completed: false },
                { id: 'default_3', title: 'Plan next day activities', estimated_time: '30 min', completed: false }
              ]
            }
          }
        } else {
          // No chat data and no cache, just load default workflows
          try {
            const defaultResponse = await workflowApi.getDefaultWorkflows(crop)
            tasks = defaultResponse.tasks
          } catch (apiError) {
            console.error('API call failed, using fallback tasks:', apiError)
            tasks = [
              { id: 'default_1', title: 'Daily field inspection', estimated_time: '1 hour', completed: false },
              { id: 'default_2', title: 'Check weather forecast', estimated_time: '15 min', completed: false },
              { id: 'default_3', title: 'Plan next day activities', estimated_time: '30 min', completed: false }
            ]
          }
        }
        
        // Create workflow data structure
        workflowData = {
          plotId: plotId || '1',
          plotName: plotId === '1' ? 'North Field' : plotId === '3' ? 'East Field' : 'Default Plot',
          crop: plotId === '1' ? 'Rice' : plotId === '3' ? 'Cotton' : 'General',
          lastUpdated: new Date().toISOString().split('T')[0],
          tasks: tasks
        }
        
        setWorkflow(workflowData)
      } catch (error) {
        console.error('Failed to load workflows:', error)
        // Create minimal workflow structure with fallback tasks on error
        const fallbackWorkflow = {
          plotId: plotId || '1',
          plotName: 'Default Plot',
          crop: 'General',
          lastUpdated: new Date().toISOString().split('T')[0],
          tasks: [
            { id: 'fallback_1', title: 'Daily field inspection', estimated_time: '1 hour', completed: false },
            { id: 'fallback_2', title: 'Check weather forecast', estimated_time: '15 min', completed: false },
            { id: 'fallback_3', title: 'Plan next day activities', estimated_time: '30 min', completed: false }
          ]
        }
        setWorkflow(fallbackWorkflow)
      } finally {
        setLoading(false)
        isLoadingRef.current = false
      }
    }
    
    loadWorkflows()
  }, [plotId, chatSummary?.summary])

  const toggleTaskCompletion = (taskId: string) => {
    if (!workflow) return
    
    const updatedTasks = workflow.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    
    const updatedWorkflow = { ...workflow, tasks: updatedTasks }
    setWorkflow(updatedWorkflow)
    
    // Save updated tasks to cache
    CacheManager.updateWorkflowTasks(updatedTasks, workflow.plotId)
  }

  const deleteTask = (taskId: string) => {
    if (!workflow) return
    
    const updatedTasks = workflow.tasks.filter(task => task.id !== taskId)
    
    const updatedWorkflow = { ...workflow, tasks: updatedTasks }
    setWorkflow(updatedWorkflow)
    
    // Save updated tasks to cache
    CacheManager.updateWorkflowTasks(updatedTasks, workflow.plotId)
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

  const completedTasks = workflow.tasks.filter(task => task.completed).length
  const totalTasks = workflow.tasks.length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

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
                <div className="text-2xl font-bold text-green-600">{completedTasks}/{totalTasks}</div>
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

        {/* Workflow Tasks */}
        <div className="space-y-3">
          {workflow.tasks.map((task) => (
            <div key={task.id} className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 ${task.completed ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      task.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {task.completed && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </h3>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {task.estimated_time}
                  </div>
                </div>
                
                {task.completed && (
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="ml-3 text-red-500 hover:text-red-700 transition-colors"
                    title="Delete completed task"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
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
