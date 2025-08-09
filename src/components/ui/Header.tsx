import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const location = useLocation()
  return (
    <header className="header">
      <Link to="/" className="text-xl font-bold text-brand">AI Farmers</Link>
      <nav className="flex gap-3 text-sm">
        <Link to="/" className={location.pathname === '/' ? 'font-semibold' : ''}>Home</Link>
        <Link to="/chat" className={location.pathname.startsWith('/chat') ? 'font-semibold' : ''}>Chatbot</Link>
        <Link to="/images" className={location.pathname.startsWith('/images') ? 'font-semibold' : ''}>Image Models</Link>
      </nav>
    </header>
  )
}

