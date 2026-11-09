import type { Metadata } from 'next'
import AuthShell from '@/components/AuthShell'
import RegisterForm from '@/components/RegisterForm'

export const metadata: Metadata = { title: 'Create account' }

export default function RegisterPage() {
  return (
    <AuthShell
      heading="One account for every workshop."
      subheading="Apply for lottery seats, book first-come workshops and manage everything in one place."
      title="Create your account"
    >
      <RegisterForm />
    </AuthShell>
  )
}
