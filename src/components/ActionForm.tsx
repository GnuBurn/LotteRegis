'use client'

import { createContext, startTransition, useActionState, useContext } from 'react'
import { useFormStatus } from 'react-dom'
import type { ActionState } from '@/interface'

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  children: React.ReactNode
  confirmMessage?: string
  className?: string
}

const PendingContext = createContext(false)

// A form wired to a server action that shows the action's success/error message.
// React resets <form action> forms after every submission, even failed ones, so we
// submit from onSubmit instead to keep what the user typed (and picked files) on error.
// `action` stays on the form so it still works before JavaScript loads.
export default function ActionForm({ action, children, confirmMessage, className }: Props) {
  const [state, formAction, isPending] = useActionState(action, {})

  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(e) => {
        e.preventDefault()
        if (confirmMessage && !window.confirm(confirmMessage)) return
        const formData = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter)
        startTransition(() => formAction(formData))
      }}
    >
      <PendingContext.Provider value={isPending}>{children}</PendingContext.Provider>
      <Notice state={state} />
    </form>
  )
}

export function SubmitButton({ children, pendingText, className }: { children: React.ReactNode; pendingText: string; className: string }) {
  // useFormStatus only sees native form submissions, so also read ActionForm's pending flag
  const actionPending = useContext(PendingContext)
  const { pending: nativePending } = useFormStatus()
  const pending = actionPending || nativePending
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
