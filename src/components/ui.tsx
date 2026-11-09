// Small shared building blocks so pages look consistent (mirrors the Figma components).
import { Icon, type IconName } from './icons'

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-3 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60'

export const buttonPrimary = `${buttonBase} bg-primary text-white hover:bg-primary-hover`
export const buttonSecondary = `${buttonBase} border border-line bg-surface text-ink hover:bg-canvas`
export const buttonGhost = `${buttonBase} text-primary hover:bg-primary-soft`
export const buttonDanger = `${buttonBase} bg-danger-soft text-danger hover:bg-danger/15`

export const inputClass =
  'w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/25'

export const labelClass = 'flex flex-col gap-1.5 text-[13px] font-medium text-ink'

export const container = 'mx-auto w-full max-w-7xl px-5 sm:px-8'

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="mb-8">
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p>}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {children && <div className="mt-2 max-w-2xl text-base text-muted">{children}</div>}
    </header>
  )
}

export function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface p-6 sm:p-8 ${className}`}>{children}</div>
}

export function ErrorPanel({ message }: { message: string }) {
  return (
    <Panel className="text-center">
      <p className="text-lg font-semibold">Something went wrong</p>
      <p className="mt-2 text-muted">{message}</p>
    </Panel>
  )
}

export type Tone = 'primary' | 'warning' | 'neutral' | 'success' | 'info' | 'danger'

const toneClasses: Record<Tone, string> = {
  primary: 'bg-primary-soft text-primary',
  warning: 'bg-warning-soft text-warning',
  neutral: 'bg-canvas text-muted ring-1 ring-inset ring-line',
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-info',
  danger: 'bg-danger-soft text-danger',
}

// Status pill with a dot, e.g. "Lottery open", "Pending draw", "Not selected"
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full py-1 pl-2.5 pr-3 text-xs font-semibold ${toneClasses[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}

// Tinted message box with an icon (fairness notes, warnings, results)
export function Callout({ tone = 'info', icon = 'info', children }: { tone?: Tone; icon?: IconName; children: React.ReactNode }) {
  return (
    <div className={`flex gap-3 rounded-[10px] px-4 py-3.5 text-sm ${toneClasses[tone]}`}>
      <Icon name={icon} className="mt-0.5 h-[18px] w-[18px]" />
      <div>{children}</div>
    </div>
  )
}

export function IconCircle({ icon, tone, size = 'md' }: { icon: IconName; tone: Tone; size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'h-16 w-16' : 'h-11 w-11'
  const glyph = size === 'lg' ? 'h-7 w-7' : 'h-5 w-5'
  return (
    <span className={`grid shrink-0 place-items-center rounded-full ${box} ${toneClasses[tone]}`}>
      <Icon name={icon} className={glyph} />
    </span>
  )
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('')
  const cls = size === 'lg' ? 'h-14 w-14 text-lg' : 'h-9 w-9 text-[13px]'
  return <span className={`grid shrink-0 place-items-center rounded-full bg-primary-soft font-semibold text-primary ${cls}`}>{initials || '?'}</span>
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-[420px] animate-pulse rounded-2xl border border-line bg-surface" />
      ))}
    </div>
  )
}
