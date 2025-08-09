import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n'

export function BottomNav() {
  const { pathname } = useLocation()
  const { t } = useI18n()
  const item = (to: string, label: string) => {
    const active = pathname === to
    return (
      <Link
        to={to}
        className={`flex flex-1 items-center justify-center gap-1 rounded-full px-3 py-2 text-xs font-medium ${
          active ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {label}
      </Link>
    )
  }
  return (
    <div className="fixed inset-x-0 bottom-2 z-20 px-4">
      <nav className="mx-auto flex max-w-screen-md items-center gap-2 rounded-full border bg-white p-2 shadow-md">
        {item('/', t('home'))}
        {item('/chat', t('chatbot'))}
        {item('/images', t('images'))}
        {item('/settings', t('settings'))}
      </nav>
    </div>
  )}

