import type { Metadata } from 'next'
import { Suspense } from 'react'
import WorkshopBrowser from '@/components/WorkshopBrowser'
import { CardSkeleton, container, ErrorPanel, PageHeader } from '@/components/ui'
import { getWorkshops } from '@/libs/api'

export const metadata: Metadata = { title: 'Workshops' }

export default function WorkshopsPage({ searchParams }: PageProps<'/workshop'>) {
  return (
    <main className={`${container} py-12 lg:pb-24`}>
      <PageHeader title="Workshops">
        Lottery workshops accept applications until their close date. Others give seats first come, first served.
      </PageHeader>

      <Suspense fallback={<CardSkeleton count={6} />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

// Fetches every workshop once; searching and filtering happen in the browser
// through the Redux store (see WorkshopBrowser).
async function Results({ searchParams }: { searchParams: PageProps<'/workshop'>['searchParams'] }) {
  const { search } = await searchParams
  const res = await getWorkshops()
  if (!res.ok) return <ErrorPanel message={res.error} />

  return <WorkshopBrowser workshops={res.data} initialSearch={typeof search === 'string' ? search.trim() : undefined} />
}
