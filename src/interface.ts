export type Role = 'member' | 'admin'
export type RegistrationMode = 'fcfs' | 'lottery'
export type RegistrationStatus = 'confirmed' | 'pending' | 'not_selected'

export interface Workshop {
  _id: string
  name: string
  description: string
  instructor: string
  workshopDate: string
  location: string
  capacity: number
  isActive: boolean
  registrationMode: RegistrationMode
  lotteryCloseDate: string | null
  lotteryDrawnAt: string | null
  // Only on workshop list/detail responses
  confirmedCount?: number
  pendingCount?: number
}

export interface RegistrationUser {
  _id: string
  name: string
  email: string
  tel: string
  role: Role
}

export interface Registration {
  _id: string
  // Populated by the backend; may be null if the workshop document is gone
  workshop: Workshop | null
  user: RegistrationUser | null
  status: RegistrationStatus
  createdAt: string
}

export type ApiResult<T> =
  | { ok: true; data: T; count?: number }
  | { ok: false; status: number; error: string }

// Returned by server actions so forms can show a message
export type ActionState = { error?: string; success?: string }
