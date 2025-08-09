import { type PropsWithChildren } from 'react'

type Props = PropsWithChildren<{ className?: string; title?: string; right?: React.ReactNode }>

export function Card({ children, className = '', title, right }: Props) {
  return (
    <div className={["rounded-2xl border border-gray-200 bg-white p-4 shadow-sm", className].join(' ')}>
      {(title || right) && (
        <div className="mb-2 flex items-center justify-between">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {right}
        </div>
      )}
      {children}
    </div>
  )
}

