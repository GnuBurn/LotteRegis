import type { Metadata } from 'next'
import { Suspense } from 'react'
import WorkshopForm from '@/components/WorkshopForm'
import { PageHeader, Panel } from '@/components/ui'
import { requireAdmin } from '@/libs/requireAdmin'

export const metadata: Metadata = { title: 'New workshop' }

export default function NewWorkshopPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <PageHeader eyebrow="Admin" title="New workshop">Publish a session members can register for.</PageHeader>
      <Panel>
        <Suspense fallback={<div className="h-96" />}>
          <AdminOnlyForm />
        </Suspense>
      </Panel>
    </main>
  )
}

async function AdminOnlyForm() {
  await requireAdmin('/admin/workshops/new')
  return <WorkshopForm />
}
