import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import WorkshopForm from '@/components/WorkshopForm'
import { ErrorPanel, PageHeader, Panel } from '@/components/ui'
import { getWorkshop } from '@/libs/api'
import { requireAdmin } from '@/libs/requireAdmin'

export const metadata: Metadata = { title: 'Edit workshop' }

export default function EditWorkshopPage({ params }: PageProps<'/admin/workshops/[id]/edit'>) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <PageHeader eyebrow="Admin" title="Edit workshop" />
      <Suspense fallback={<Panel><div className="h-96" /></Panel>}>
        <EditContent params={params} />
      </Suspense>
    </main>
  )
}

async function EditContent({ params }: { params: PageProps<'/admin/workshops/[id]/edit'>['params'] }) {
  const { id } = await params
  await requireAdmin(`/admin/workshops/${id}/edit`)

  const res = await getWorkshop(id)
  if (!res.ok) {
    if (res.status === 404 || res.status === 400) notFound()
    return <ErrorPanel message={res.error} />
  }

  return (
    <>
      <Panel><WorkshopForm workshop={res.data} /></Panel>
      <Link href={`/workshops/${id}`} className="mt-6 inline-block text-sm text-muted hover:text-ink">← Back to workshop</Link>
    </>
  )
}
