import { useState } from 'react'
import { useI18n } from '../../i18n'
import { SCHEMES_CONFIG } from '../../config'

export function GovernmentSchemesCard() {
  const { t } = useI18n()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const schemes = SCHEMES_CONFIG.schemes

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Tricolor Header - Indian Flag Colors */}
        <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 p-1">
          <div className="bg-white mx-1 rounded-sm">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center">
                <div className="text-2xl mr-3">🏛️</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{t('government_schemes')}</h3>
                  <p className="text-xs text-gray-600">{t('financial_support')}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                More →
              </button>
            </div>
          </div>
        </div>

        {/* Urgent Banner - Alert Style */}
        <div className="bg-red-50 border-red-400 border-t px-4 py-1.5">
          <div className="flex items-center">
            <div className="animate-pulse text-red-400 mr-2">🚨</div>
            <div className="text-xs font-bold uppercase tracking-wide text-red-800">
              {SCHEMES_CONFIG.messages.urgentBanner}
            </div>
          </div>
        </div>

        {/* Single Featured Scheme - Enhanced Aesthetic */}
        <div className="p-4 relative">
          <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-xl p-4 border border-blue-200/60 relative overflow-hidden h-20 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">{schemes[0].title}</h4>
                  {schemes[0].isNew && (
                    <span className="ml-2 bg-gradient-to-r from-green-100 to-green-50 text-green-700 text-xs px-2 py-1 rounded-full border border-green-200/50 shadow-sm">New</span>
                  )}
                  {schemes[0].isUrgent && (
                    <span className="ml-2 bg-gradient-to-r from-red-100 to-red-50 text-red-700 text-xs px-2 py-1 rounded-full border border-red-200/50 animate-pulse shadow-sm">Urgent</span>
                  )}
                </div>
                <p className="text-sm text-gray-600/90 mb-2 font-medium">{schemes[0].description}</p>
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">{schemes[0].amount}</div>
                <div className="text-xs text-gray-500/80">
                  <div className="flex items-center"><span className="mr-1">👥</span> {schemes[0].eligibility}</div>
                  <div className="flex items-center"><span className="mr-1">📅</span> Deadline: {schemes[0].deadline}</div>
                </div>
              </div>
              <div className="text-4xl opacity-15 filter drop-shadow-sm">💰</div>
            </div>
            <button className="mt-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md">
              Apply Now
            </button>
            
            {/* Minimal blur overlay with enhanced gradient */}
            <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-white/90 via-white/40 to-transparent backdrop-blur-sm rounded-b-xl"></div>
          </div>

          {/* More schemes indicator with enhanced styling */}
          <div className="mt-2 text-center">
            <div className="text-xs text-gray-400/70 font-medium">••• {schemes.length - 1} more schemes available •••</div>
          </div>
        </div>
      </div>

      {/* Government Schemes Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header with Tricolor */}
            <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 p-1">
              <div className="bg-white mx-1 rounded-sm">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{t('government_schemes')}</h3>
                    <p className="text-sm text-gray-600">{SCHEMES_CONFIG.messages.availableSchemes}</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-600 hover:text-gray-800 text-2xl font-bold transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            {/* Urgent Banner in Modal */}
            <div className="bg-red-600 text-white px-6 py-2">
              <div className="flex items-center">
                <div className="animate-pulse text-yellow-300 mr-2">🚨</div>
                <div className="text-sm font-bold uppercase tracking-wide">
                  {SCHEMES_CONFIG.messages.modalUrgentBanner}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              
              {/* All Schemes */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-800 mb-4">{SCHEMES_CONFIG.messages.allAvailableSchemes}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schemes.map((scheme, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start">
                        <div className="text-3xl mr-4">
                          {SCHEMES_CONFIG.categories[scheme.category]?.icon || '📋'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h5 className="text-lg font-bold text-gray-800">{scheme.title}</h5>
                            {scheme.isNew && (
                              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">New</span>
                            )}
                            {scheme.isUrgent && (
                              <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Urgent</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{scheme.description}</p>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <span className="font-semibold text-green-600 mr-2">💰 Amount:</span>
                              <span className="text-gray-700">{scheme.amount}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="font-semibold text-blue-600 mr-2">👥 Eligibility:</span>
                              <span className="text-gray-700">{scheme.eligibility}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <span className="font-semibold text-purple-600 mr-2">📅 Deadline:</span>
                              <span className="text-gray-700">{scheme.deadline}</span>
                            </div>
                          </div>
                          <button className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">{SCHEMES_CONFIG.messages.needHelp}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">{SCHEMES_CONFIG.messages.helplineNumbers}</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>📞 Kisan Call Center: {SCHEMES_CONFIG.contact.helplines.kisanCallCenter}</div>
                      <div>📞 PM-KISAN Helpline: {SCHEMES_CONFIG.contact.helplines.pmKisanHelpline}</div>
                      <div>📞 Crop Insurance: {SCHEMES_CONFIG.contact.helplines.cropInsurance}</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">{SCHEMES_CONFIG.messages.onlinePortals}</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      {SCHEMES_CONFIG.contact.portals.map((portal, index) => (
                        <div key={index}>🌐 {portal}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
