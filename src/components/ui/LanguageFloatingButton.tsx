import { useNavigate } from 'react-router-dom'

export function LanguageFloatingButton() {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/language')}
      className="fixed bottom-6 left-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center text-xl border-2 border-white"
      title="Change Language"
    >
      🌐
    </button>
  )
}
