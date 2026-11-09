'use client'

import { useState } from 'react'
import type { RegistrationMode } from '@/interface'
import { inputClass, labelClass } from './ui'

type Props = {
  defaultMode: RegistrationMode
  defaultCloseDate?: string
  minCloseDate: string
  // Mode can't change once members registered; nothing can change after the draw
  modeLocked: boolean
  closeDateLocked: boolean
}

export default function ModeFields({ defaultMode, defaultCloseDate, minCloseDate, modeLocked, closeDateLocked }: Props) {
  const [mode, setMode] = useState<RegistrationMode>(defaultMode)

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-sm font-medium">How are seats given out?</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <ModeOption value="fcfs" current={mode} onPick={setMode} disabled={modeLocked}
          title="First come, first served" hint="The first sign-ups get a seat right away until it's full." />
        <ModeOption value="lottery" current={mode} onPick={setMode} disabled={modeLocked}
          title="Lottery" hint="Anyone can apply until the close date. If more people apply than there are seats, winners are drawn at random." />
      </div>
      {/* Disabled inputs aren't submitted, so send the locked value explicitly */}
      {modeLocked && <input type="hidden" name="registrationMode" value={mode} />}
      {modeLocked && !closeDateLocked && (
        <p className="text-xs text-muted">The mode can&apos;t change after members have registered.</p>
      )}

      {mode === 'lottery' && (
        <label className={labelClass}>
          Applications close on
          <input type="date" name="lotteryCloseDate" required={!closeDateLocked} disabled={closeDateLocked}
            min={closeDateLocked ? undefined : minCloseDate} defaultValue={defaultCloseDate} className={inputClass} />
          <span className="text-xs font-normal text-muted">
            {closeDateLocked
              ? 'The draw has already happened, so this can no longer change.'
              : 'Must be before the workshop date. The draw runs automatically the day after.'}
          </span>
        </label>
      )}
    </fieldset>
  )
}

function ModeOption({ value, current, onPick, disabled, title, hint }: {
  value: RegistrationMode
  current: RegistrationMode
  onPick: (m: RegistrationMode) => void
  disabled: boolean
  title: string
  hint: string
}) {
  return (
    <label className={`rounded-xl border border-line bg-surface p-4 transition has-checked:border-primary has-checked:bg-primary-soft/50 has-focus-visible:ring-4 has-focus-visible:ring-primary/15 ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
      <input type="radio" name="registrationMode" value={value} checked={current === value} disabled={disabled}
        onChange={() => onPick(value)} className="sr-only" />
      <span className="block font-medium">{title}</span>
      <span className="mt-1 block text-xs text-muted">{hint}</span>
    </label>
  )
}
