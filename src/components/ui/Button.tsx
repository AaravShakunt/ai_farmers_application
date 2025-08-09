import { type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  full?: boolean
}

export function Button({ variant = 'primary', full, className = '', ...rest }: Props) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed transition'
  const styles: Record<Variant, string> = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
    secondary: 'bg-gray-900 text-white hover:bg-gray-800',
    ghost: 'bg-transparent text-gray-900 hover:bg-gray-100',
  }
  const width = full ? 'w-full' : ''
  return <button className={[base, styles[variant], width, className].filter(Boolean).join(' ')} {...rest} />
}

