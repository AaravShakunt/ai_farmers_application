import { useState } from 'react'
import { useI18n, type Language } from '../i18n'
import { BottomNav } from '../components/ui/BottomNav'
import { APP_CONFIG, USER_CONFIG } from '../config'

export default function Settings() {
  const { lang, setLang, t } = useI18n()
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showUnitsModal, setShowUnitsModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)
  
  // Settings state - initialized from configuration
  const [notifications, setNotifications] = useState({
    weather: true,
    prices: true,
    schemes: false,
    reminders: true,
  })
  const [location, setLocation] = useState<string>(USER_CONFIG.defaultProfile.location)
  const [units, setUnits] = useState({
    temperature: 'celsius' as const,
    area: 'acres' as const,
    weight: 'kg' as const,
  })
  const [privacy, setPrivacy] = useState({
    analytics: true,
    crashReports: true,
    locationSharing: false,
  })

  const getLanguageLabel = (langCode: Language) => {
    switch (langCode) {
      case 'en': return 'English'
      case 'hi': return 'हिंदी (Hindi)'
      case 'kn': return 'ಕನ್ನಡ (Kannada)'
      default: return 'English'
    }
  }

  const SettingItem = ({ 
    title, 
    subtitle, 
    value, 
    onClick, 
    type = 'button',
    checked,
    onChange
  }: {
    title: string
    subtitle?: string
    value?: string
    onClick?: () => void
    type?: 'button' | 'toggle'
    checked?: boolean
    onChange?: (checked: boolean) => void
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{title}</div>
        {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
      </div>
      {type === 'button' ? (
        <button 
          onClick={onClick}
          className="flex items-center text-sm text-gray-600 hover:text-gray-800"
        >
          <span className="mr-2">{value}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ) : (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
        </label>
      )}
    </div>
  )

  const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children 
  }: { 
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode 
  }) => {
    if (!isOpen) return null
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
          <div className="bg-green-500 text-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{title}</h3>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-screen-md px-4 pb-24 pt-4 md:px-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('settings')}</h1>
          <p className="text-sm text-gray-600">Manage your app preferences</p>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 p-4">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {USER_CONFIG.defaultProfile.initials}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-800">{USER_CONFIG.defaultProfile.name}</h3>
              <p className="text-sm text-gray-600">Farmer ID: {USER_CONFIG.defaultProfile.farmerId}</p>
              <p className="text-xs text-gray-500">{location}</p>
            </div>
            <button className="text-green-600 hover:text-green-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">General</h2>
          </div>
          <div className="p-4">
            <SettingItem
              title="Language"
              subtitle="App display language"
              value={getLanguageLabel(lang)}
              onClick={() => setShowLanguageModal(true)}
            />
            <SettingItem
              title="Location"
              subtitle="Your farming location"
              value={location}
              onClick={() => setShowLocationModal(true)}
            />
            <SettingItem
              title="Units"
              subtitle="Temperature, area, weight units"
              value="Metric"
              onClick={() => setShowUnitsModal(true)}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
          </div>
          <div className="p-4">
            <SettingItem
              title="Weather Alerts"
              subtitle="Get notified about weather changes"
              type="toggle"
              checked={notifications.weather}
              onChange={(checked) => setNotifications({...notifications, weather: checked})}
            />
            <SettingItem
              title="Market Prices"
              subtitle="Daily price updates"
              type="toggle"
              checked={notifications.prices}
              onChange={(checked) => setNotifications({...notifications, prices: checked})}
            />
            <SettingItem
              title="Government Schemes"
              subtitle="New scheme announcements"
              type="toggle"
              checked={notifications.schemes}
              onChange={(checked) => setNotifications({...notifications, schemes: checked})}
            />
            <SettingItem
              title="Task Reminders"
              subtitle="Farming task reminders"
              type="toggle"
              checked={notifications.reminders}
              onChange={(checked) => setNotifications({...notifications, reminders: checked})}
            />
          </div>
        </div>

        {/* Privacy & Data */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Privacy & Data</h2>
          </div>
          <div className="p-4">
            <SettingItem
              title="Analytics"
              subtitle="Help improve the app"
              type="toggle"
              checked={privacy.analytics}
              onChange={(checked) => setPrivacy({...privacy, analytics: checked})}
            />
            <SettingItem
              title="Crash Reports"
              subtitle="Send crash reports automatically"
              type="toggle"
              checked={privacy.crashReports}
              onChange={(checked) => setPrivacy({...privacy, crashReports: checked})}
            />
            <SettingItem
              title="Location Sharing"
              subtitle="Share location for better recommendations"
              type="toggle"
              checked={privacy.locationSharing}
              onChange={(checked) => setPrivacy({...privacy, locationSharing: checked})}
            />
          </div>
        </div>

        {/* Support & Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Support & Information</h2>
          </div>
          <div className="p-4">
            <SettingItem
              title="Help Center"
              subtitle="Get help and support"
              value=""
              onClick={() => {}}
            />
            <SettingItem
              title="Contact Us"
              subtitle="Reach out to our team"
              value=""
              onClick={() => {}}
            />
            <SettingItem
              title="Rate App"
              subtitle="Rate us on the app store"
              value=""
              onClick={() => {}}
            />
            <SettingItem
              title="About"
              subtitle="App version and info"
              value="v1.0.0"
              onClick={() => setShowAboutModal(true)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 text-gray-500">
          <div className="text-2xl mb-2">🌾</div>
          <div className="text-sm font-medium">{APP_CONFIG.name}</div>
          <div className="text-xs">{APP_CONFIG.tagline}</div>
          <div className="text-xs mt-2">{APP_CONFIG.copyright}</div>
          <div className="flex justify-center space-x-4 mt-4 text-xs">
            <button className="text-green-600 hover:text-green-700">Privacy Policy</button>
            <button className="text-green-600 hover:text-green-700">Terms of Service</button>
            <button className="text-green-600 hover:text-green-700">Licenses</button>
          </div>
        </div>

        {/* Language Modal */}
        <Modal
          isOpen={showLanguageModal}
          onClose={() => setShowLanguageModal(false)}
          title="Select Language"
        >
          <div className="space-y-3">
            {(['en', 'hi', 'kn'] as Language[]).map((langCode) => (
              <button
                key={langCode}
                onClick={() => {
                  setLang(langCode)
                  setShowLanguageModal(false)
                }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  lang === langCode 
                    ? 'bg-green-50 border-green-500 text-green-700' 
                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900'
                }`}
              >
                <div className="font-medium">{getLanguageLabel(langCode)}</div>
              </button>
            ))}
          </div>
        </Modal>

        {/* Location Modal */}
        <Modal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          title="Select Location"
        >
          <div className="space-y-3">
            {USER_CONFIG.availableLocations.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setLocation(loc)
                  setShowLocationModal(false)
                }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  location === loc 
                    ? 'bg-green-50 border-green-500 text-green-700' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </Modal>

        {/* Units Modal */}
        <Modal
          isOpen={showUnitsModal}
          onClose={() => setShowUnitsModal(false)}
          title="Units Settings"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
              <div className="space-y-2">
                {USER_CONFIG.unitOptions.temperature.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setUnits({...units, temperature: option.value as any})}
                    className={`w-full text-left p-2 rounded border ${
                      units.temperature === option.value 
                        ? 'bg-green-50 border-green-500' 
                        : 'border-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
              <div className="space-y-2">
                {USER_CONFIG.unitOptions.area.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setUnits({...units, area: option.value as any})}
                    className={`w-full text-left p-2 rounded border ${
                      units.area === option.value 
                        ? 'bg-green-50 border-green-500' 
                        : 'border-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>

        {/* About Modal */}
        <Modal
          isOpen={showAboutModal}
          onClose={() => setShowAboutModal(false)}
          title={`About ${APP_CONFIG.name}`}
        >
          <div className="text-center">
            <div className="text-4xl mb-4">🌾</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{APP_CONFIG.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{APP_CONFIG.tagline}</p>
            <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 text-sm">
              <div><strong>Version:</strong> {APP_CONFIG.version}</div>
              <div><strong>Build:</strong> {APP_CONFIG.build}</div>
              <div><strong>Developer:</strong> {APP_CONFIG.developer}</div>
              <div><strong>Support:</strong> {APP_CONFIG.supportEmail}</div>
              <div><strong>Helpline:</strong> {APP_CONFIG.helpline}</div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Empowering farmers with AI-driven insights for better crop management and increased productivity.
            </p>
          </div>
        </Modal>

        <BottomNav />
      </div>
    </div>
  )
}
