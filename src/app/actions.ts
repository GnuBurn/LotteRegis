'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiFetch } from '@/libs/api'
import { getSession } from '@/libs/session'
import type { ActionState, Registration, Role, Workshop } from '@/interface'

const SIGN_IN_ERROR = 'Please sign in first.'

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

// ---------- Accounts ----------

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const role: Role = text(formData, 'role') === 'admin' ? 'admin' : 'member'
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: {
      name: text(formData, 'name'),
      email: text(formData, 'email'),
      tel: text(formData, 'tel'),
      password: String(formData.get('password') ?? ''),
      role,
    },
  })
  if (!res.ok) {
    if (res.error.includes('duplicate key')) return { error: 'An account with this email already exists.' }
    return { error: res.error }
  }
  return { success: 'Account created.' }
}

// ---------- Registrations (members register; owners and admins edit/cancel) ----------

export async function registerForWorkshop(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { error: SIGN_IN_ERROR }
  if (session.user.role !== 'member') return { error: 'Only members can register for workshops.' }

  const res = await apiFetch<Registration>('/registrations', {
    method: 'POST',
    token: session.user.token,
    body: { workshop: text(formData, 'workshopId') },
  })
  if (!res.ok) return { error: res.error }

  revalidatePath('/', 'layout')
  return res.data.status === 'pending'
    ? { success: "Application received! You'll find out after the draw." }
    : { success: "You're registered! See you there." }
}

export async function changeRegistration(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { error: SIGN_IN_ERROR }

  const res = await apiFetch<Registration>(`/registrations/${encodeURIComponent(text(formData, 'registrationId'))}`, {
    method: 'PUT',
    token: session.user.token,
    body: { workshop: text(formData, 'workshopId') },
  })
  if (!res.ok) return { error: res.error }

  revalidatePath('/', 'layout')
  return { success: 'Registration moved.' }
}

export async function cancelRegistration(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { error: SIGN_IN_ERROR }

  const res = await apiFetch(`/registrations/${encodeURIComponent(text(formData, 'registrationId'))}`, {
    method: 'DELETE',
    token: session.user.token,
  })
  if (!res.ok) return { error: res.error }

  revalidatePath('/', 'layout')
  return { success: 'Registration cancelled.' }
}

// ---------- Workshops (admin only) ----------

export async function saveWorkshop(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.user.role !== 'admin') return { error: 'Only admins can manage workshops.' }

  const id = text(formData, 'id')
  const body = {
    name: text(formData, 'name'),
    description: text(formData, 'description'),
    instructor: text(formData, 'instructor'),
    workshopDate: text(formData, 'workshopDate'),
    location: text(formData, 'location'),
    capacity: Number(text(formData, 'capacity')),
    registrationMode: text(formData, 'registrationMode') === 'lottery' ? 'lottery' : 'fcfs',
    // Omitted when the field is locked (disabled) so the backend keeps its value
    lotteryCloseDate: formData.has('lotteryCloseDate') ? text(formData, 'lotteryCloseDate') : undefined,
  }

  const res = await apiFetch<Workshop>(id ? `/workshops/${encodeURIComponent(id)}` : '/workshops', {
    method: id ? 'PUT' : 'POST',
    token: session.user.token,
    body,
  })
  if (!res.ok) return { error: res.error }

  revalidatePath('/', 'layout')
  redirect(`/workshops/${res.data._id}`)
}

export async function deleteWorkshop(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.user.role !== 'admin') return { error: 'Only admins can manage workshops.' }

  const res = await apiFetch(`/workshops/${encodeURIComponent(text(formData, 'id'))}`, {
    method: 'DELETE',
    token: session.user.token,
  })
  if (!res.ok) return { error: res.error }

  revalidatePath('/', 'layout')
  redirect('/workshops')
}
