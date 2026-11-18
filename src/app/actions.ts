'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiFetch } from '@/libs/api'
import { getSession } from '@/libs/session'
import type { ActionState, Registration, Role, Workshop } from '@/interface'

const SIGN_IN_ERROR = 'Please sign in first.'

// Mirrors the backend's upload limits so admins get the message before uploading
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

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
  const image = formData.get('image')
  const hasImage = image instanceof File && image.size > 0
  if (hasImage && !IMAGE_TYPES.includes(image.type)) return { error: 'Image must be a JPEG, PNG, WebP or GIF file.' }
  if (hasImage && image.size > MAX_IMAGE_BYTES) return { error: 'Image must be 5 MB or smaller.' }

  // Sent as multipart so the image can travel with the other fields
  const body = new FormData()
  body.set('name', text(formData, 'name'))
  body.set('description', text(formData, 'description'))
  body.set('instructor', text(formData, 'instructor'))
  body.set('workshopDate', text(formData, 'workshopDate'))
  body.set('location', text(formData, 'location'))
  body.set('capacity', text(formData, 'capacity'))
  body.set('registrationMode', text(formData, 'registrationMode') === 'lottery' ? 'lottery' : 'fcfs')
  // Omitted when the field is locked (disabled) so the backend keeps its value
  if (formData.has('lotteryCloseDate')) body.set('lotteryCloseDate', text(formData, 'lotteryCloseDate'))
  if (hasImage) body.set('image', image)
  else if (id && formData.get('removeImage') === 'on') body.set('removeImage', 'true')

  const res = await apiFetch<Workshop>(id ? `/workshops/${encodeURIComponent(id)}` : '/workshops', {
    method: id ? 'PUT' : 'POST',
    token: session.user.token,
    body,
  })
  if (!res.ok) return { error: res.error }

  revalidatePath('/', 'layout')
  redirect(`/workshop/${res.data._id}`)
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
  redirect('/workshop')
}
