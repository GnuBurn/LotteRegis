'use client'

import { useRouter } from 'next/navigation'
import { setSearch } from '@/redux/features/workshopFilterSlice'
import { useAppDispatch } from '@/redux/hooks'
import { Icon } from './icons'
import { buttonPrimary } from './ui'

// Puts the search term in the Redux store, then opens the workshop list,
// which reads it from there
export default function HomeSearch() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    dispatch(setSearch(String(new FormData(e.currentTarget).get('search') ?? '').trim()))
    router.push('/workshop')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <label className="flex h-12 flex-1 items-center gap-2.5 rounded-[10px] border border-line bg-surface px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 sm:max-w-md">
        <Icon name="search" className="h-[18px] w-[18px] text-muted" />
        <input name="search" placeholder="Search workshops, topics or instructors" aria-label="Search workshops"
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted" />
      </label>
      <button className={buttonPrimary}>Browse workshops</button>
    </form>
  )
}
