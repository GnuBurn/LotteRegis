'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import type { ActionState } from '@/interface'

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  children: React.ReactNode
  confirmMessage?: string
  className?: string
}

// A form wired to a server action that shows the action's success/error message.
export default function ActionForm({ action, children, confirmMessage, className }: Props) {
  const [state, formAction] = useActionState(action, {})

  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) e.preventDefault()
      }}
    >
      {children}
      <Notice state={state} />
    </form>
  )
}

export function SubmitButton({ children, pendingText, className }: { children: React.ReactNode; pendingText: string; className: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  )
}

export function Notice({ state }: { state: ActionState }) {
  if (state.error) {
    return (
      <p role="alert" className="mt-3 rounded-[10px] bg-danger-soft px-4 py-3 text-sm text-danger">
        {state.error}
      </p>
    )
  }
  if (state.success) {
    return (
      <p role="status" className="mt-3 rounded-[10px] bg-success-soft px-4 py-3 text-sm text-success">
        {state.success}
      </p>
    )
  }
  return null
}
