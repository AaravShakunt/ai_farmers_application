import { useState } from 'react'
import { ALERTS_CONFIG, type Alert } from '../../config'

interface AlertBannerProps {
  alerts: Alert[]
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!alerts || alerts.length === 0) return null

  // Sort alerts by priority (urgent first)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priorityA = ALERTS_CONFIG.alertTypes[a.type]?.priority || 999
    const priorityB = ALERTS_CONFIG.alertTypes[b.type]?.priority || 999
    return priorityA - priorityB
  })

  const currentAlert = sortedAlerts[currentIndex]

  const getAlertStyles = (type: Alert['type']) => {
    const config = ALERTS_CONFIG.alertTypes[type]
    if (config) {
      return {
        bgColor: config.bgColor,
        borderColor: config.borderColor,
        textColor: config.textColor,
        iconColor: config.iconColor,
        icon: config.icon
      }
    }
    
    // Fallback for unknown types
    return {
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-400',
      textColor: 'text-gray-800',
      iconColor: 'text-gray-400',
      icon: 'ℹ️'
    }
  }

  const styles = getAlertStyles(currentAlert.type)

  const handleClick = () => {
    setSelectedAlert(currentAlert)
    setShowModal(true)
  }

  const nextAlert = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedAlerts.length)
  }

  const prevAlert = () => {
    setCurrentIndex((prev) => (prev - 1 + sortedAlerts.length) % sortedAlerts.length)
  }

  return (
    <>
      {/* Alert Banner */}
      <div className={`${styles.bgColor} ${styles.borderColor} border-l-4 rounded-r-xl px-3 py-1 mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className={`${styles.iconColor} text-sm mr-2 ${currentAlert.type === 'urgent' ? 'animate-pulse' : ''}`}>
              {styles.icon}
            </div>
            <div className="flex-1">
              <button
                onClick={handleClick}
                className={`text-left ${styles.textColor} hover:underline`}
              >
                <span className="text-xs font-medium">
                  {currentAlert.type === 'urgent' ? 'URGENT: ' : 
                   currentAlert.type === 'moderate' ? 'NOTICE: ' : 'STATUS: '}
                  {currentAlert.message}
                </span>
              </button>
            </div>
          </div>
          
          {/* Navigation for multiple alerts */}
          {sortedAlerts.length > 1 && (
            <div className="flex items-center space-x-1 ml-3">
              <button
                onClick={prevAlert}
                className={`${styles.iconColor} hover:opacity-70 text-xs`}
              >
                ←
              </button>
              <span className={`${styles.textColor} text-xs`}>
                {currentIndex + 1}/{sortedAlerts.length}
              </span>
              <button
                onClick={nextAlert}
                className={`${styles.iconColor} hover:opacity-70 text-xs`}
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alert Modal */}
      {showModal && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className={`${styles.bgColor} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{styles.icon}</span>
                  <h3 className={`text-lg font-bold ${styles.textColor}`}>
                    {selectedAlert.type === 'urgent' ? 'URGENT ALERT' :
                     selectedAlert.type === 'moderate' ? 'MODERATE PRIORITY' :
                     'ALL HEALTHY'}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className={`${styles.textColor} hover:opacity-70 text-2xl font-bold`}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-gray-800 leading-relaxed">
                {selectedAlert.fullMessage}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-6 py-2 ${styles.bgColor} ${styles.textColor} rounded-lg hover:opacity-90 transition-colors`}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
