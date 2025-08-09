import { type PropsWithChildren } from 'react'

export function Section({ children, title, subtitle }: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <section>
      <div className="mb-2">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

