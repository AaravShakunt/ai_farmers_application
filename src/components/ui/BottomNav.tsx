import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n'

export function BottomNav() {
  const { pathname } = useLocation()
  const { t } = useI18n()
  
  const item = (to: string, label: string, icon: string) => {
    const active = pathname === to
    return (
      <Link
        to={to}
        className={`flex flex-1 flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-colors ${
          active 
            ? 'bg-green-50 text-green-600' 
            : 'text-gray-600 hover:text-green-600'
        }`}
      >
        <div className="text-xl mb-1">{icon}</div>
        <span>{label}</span>
      </Link>
    )
  }
  
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 bg-white border-t border-gray-200 shadow-lg">
      <nav className="flex items-center justify-around max-w-lg mx-auto">
        {item('/', t('home'), '🏠')}
        {item('/tasks', t('tasks'), '📋')}
        {item('/image-models', 'Models', '📸')}
        {item('/settings', t('settings'), '⚙️')}
      </nav>
    </div>
  )
}
