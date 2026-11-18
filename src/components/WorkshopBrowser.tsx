'use client'

import { useEffect } from 'react'
import type { Workshop } from '@/interface'
import { isPast } from '@/libs/dates'
import {
  filterWorkshops, isFiltering, resetFilters, setJoinableOnly, setMode, setSearch, type ModeFilter,
} from '@/redux/features/workshopFilterSlice'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { Icon } from './icons'
import { WorkshopGrid } from './WorkshopCard'

const modes: { value: ModeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'lottery', label: 'Lottery' },
  { value: 'fcfs', label: 'First come' },
]

// Filters the workshop list as you type. The filters live in the Redux store,
// so they are still set when you open a workshop and come back.
export default function WorkshopBrowser({ workshops, initialSearch }: { workshops: Workshop[]; initialSearch?: string }) {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((s) => s.workshopFilter)

  // Support links like /workshop?search=python: copy the term into the store,
  // then drop it from the URL so the store stays the single source of truth
  useEffect(() => {
    if (initialSearch === undefined) return
    dispatch(setSearch(initialSearch))
    window.history.replaceState(null, '', window.location.pathname)
  }, [dispatch, initialSearch])

  const results = filterWorkshops(workshops, filters)
  const upcoming = results.filter((w) => !isPast(w.workshopDate))
  const past = results.filter((w) => isPast(w.workshopDate))
  const filtering = isFiltering(filters)

  return (
    <>
      <div className="mb-10 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex h-12 flex-1 items-center gap-2.5 rounded-[10px] border border-line bg-surface px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 sm:max-w-md">
            <Icon name="search" className="h-[18px] w-[18px] text-muted" />
            <input type="search" value={filters.search} onChange={(e) => dispatch(setSearch(e.target.value))}
              placeholder="Search by name, instructor, location…" aria-label="Search workshops"
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted" />
          </label>

          <div role="radiogroup" aria-label="Registration type" className="flex rounded-[10px] border border-line bg-surface p-1">
            {modes.map((m) => (
              <button key={m.value} type="button" role="radio" aria-checked={filters.mode === m.value}
                onClick={() => dispatch(setMode(m.value))}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${filters.mode === m.value ? 'bg-primary text-white' : 'text-muted hover:text-ink'}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <label className="flex cursor-pointer items-center gap-2 font-medium">
            <input type="checkbox" checked={filters.joinableOnly} onChange={(e) => dispatch(setJoinableOnly(e.target.checked))}
              className="h-4 w-4 accent-primary" />
            Only workshops I can still join
          </label>
          <span className="text-muted" aria-live="polite">
            {results.length} of {workshops.length} workshops
          </span>
          {filtering && (
            <button type="button" onClick={() => dispatch(resetFilters())}
              className="font-medium text-muted underline-offset-4 hover:text-ink hover:underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {workshops.length === 0 ? (
        <p className="text-muted">No workshops have been published yet.</p>
      ) : results.length === 0 ? (
        <p className="text-muted">
          {filters.search.trim() ? `No workshops match “${filters.search.trim()}”` : 'No workshops match these filters'}.
        </p>
      ) : (
        <div className="space-y-14">
          {upcoming.length > 0 && <WorkshopGrid workshops={upcoming} />}
          {past.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-bold text-muted">Past workshops</h2>
              <WorkshopGrid workshops={past} />
            </section>
          )}
        </div>
      )}
    </>
  )
}
