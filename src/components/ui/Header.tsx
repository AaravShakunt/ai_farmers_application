import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n'

export function Header() {
  const location = useLocation()
  const { t } = useI18n()
  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-screen-md items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="text-xl font-extrabold text-emerald-600">{t('app_title')}</Link>
        <nav className="hidden gap-4 text-sm sm:flex">
          <Link to="/" className={location.pathname === '/' ? 'font-semibold text-emerald-700' : 'text-gray-700'}>{t('home')}</Link>
          <Link to="/chat" className={location.pathname.startsWith('/chat') ? 'font-semibold text-emerald-700' : 'text-gray-700'}>{t('chatbot')}</Link>
          <Link to="/images" className={location.pathname.startsWith('/images') ? 'font-semibold text-emerald-700' : 'text-gray-700'}>{t('images')}</Link>
          <Link to="/settings" className={location.pathname.startsWith('/settings') ? 'font-semibold text-emerald-700' : 'text-gray-700'}>{t('settings')}</Link>
        </nav>
      </div>
    </header>
  )
}

