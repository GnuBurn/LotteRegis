import type { Metadata } from 'next'
import Form from 'next/form'
import Link from 'next/link'
import { Suspense } from 'react'
import { Icon } from '@/components/icons'
import { WorkshopGrid } from '@/components/WorkshopCard'
import { buttonPrimary, CardSkeleton, container, ErrorPanel, PageHeader } from '@/components/ui'
import type { Workshop } from '@/interface'
import { getWorkshops } from '@/libs/api'
import { isPast } from '@/libs/dates'

export const metadata: Metadata = { title: 'Workshops' }

export default function WorkshopsPage({ searchParams }: PageProps<'/workshops'>) {
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

async function Results({ searchParams }: { searchParams: PageProps<'/workshops'>['searchParams'] }) {
  const { search } = await searchParams
  const query = typeof search === 'string' ? search.trim() : ''
  const res = await getWorkshops(query || undefined)

  return (
    <>
      <Form action="/workshops" className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex h-12 flex-1 items-center gap-2.5 rounded-[10px] border border-line bg-surface px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 sm:max-w-md">
          <Icon name="search" className="h-[18px] w-[18px] text-muted" />
          <input name="search" defaultValue={query} placeholder="Search by name, instructor, location…" aria-label="Search workshops"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted" />
        </label>
        <button className={buttonPrimary}>Search</button>
        {query && (
          <Link href="/workshops" className="text-sm font-medium text-muted underline-offset-4 hover:underline">Clear</Link>
        )}
      </Form>

      {!res.ok ? (
        <ErrorPanel message={res.error} />
      ) : res.data.length === 0 ? (
        <p className="text-muted">{query ? `No workshops match “${query}”.` : 'No workshops have been published yet.'}</p>
      ) : (
        <WorkshopSections workshops={res.data} />
      )}
    </>
  )
}

function WorkshopSections({ workshops }: { workshops: Workshop[] }) {
  const upcoming = workshops.filter((w) => !isPast(w.workshopDate))
  const past = workshops.filter((w) => isPast(w.workshopDate))

  return (
    <div className="space-y-14">
      {upcoming.length > 0 && <WorkshopGrid workshops={upcoming} />}
      {past.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold text-muted">Past workshops</h2>
          <WorkshopGrid workshops={past} />
        </section>
      )}
    </div>
  )
}
