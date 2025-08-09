import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const location = useLocation()
  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-screen-md items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="text-xl font-extrabold text-emerald-600">AI Farmers</Link>
        <nav className="hidden gap-4 text-sm sm:flex">
          <Link to="/" className={location.pathname === '/' ? 'font-semibold text-emerald-700' : 'text-gray-700'}>Home</Link>
          <Link to="/chat" className={location.pathname.startsWith('/chat') ? 'font-semibold text-emerald-700' : 'text-gray-700'}>Chatbot</Link>
          <Link to="/images" className={location.pathname.startsWith('/images') ? 'font-semibold text-emerald-700' : 'text-gray-700'}>Image Models</Link>
        </nav>
      </div>
    </header>
  )
}

