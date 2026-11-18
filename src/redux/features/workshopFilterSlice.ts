import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Workshop } from '@/interface'
import { isLotteryOpen, isPast } from '@/libs/dates'
import { seatsLeft } from '@/libs/seats'

export type ModeFilter = 'all' | 'lottery' | 'fcfs'

export interface WorkshopFilterState {
  search: string
  mode: ModeFilter
  // Hide workshops you can no longer join (finished, full, or lottery closed)
  joinableOnly: boolean
}

const initialState: WorkshopFilterState = { search: '', mode: 'all', joinableOnly: false }

const workshopFilterSlice = createSlice({
  name: 'workshopFilter',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
    },
    setMode(state, action: PayloadAction<ModeFilter>) {
      state.mode = action.payload
    },
    setJoinableOnly(state, action: PayloadAction<boolean>) {
      state.joinableOnly = action.payload
    },
    resetFilters() {
      return initialState
    },
  },
})

export const { setSearch, setMode, setJoinableOnly, resetFilters } = workshopFilterSlice.actions
export default workshopFilterSlice.reducer

export function isFiltering(f: WorkshopFilterState) {
  return f.search.trim() !== '' || f.mode !== 'all' || f.joinableOnly
}

export function isJoinable(w: Workshop) {
  return !isPast(w.workshopDate) && (isLotteryOpen(w) || seatsLeft(w) > 0)
}

// Same fields the backend's ?search= matches: name, description, instructor, location
export function filterWorkshops(workshops: Workshop[], f: WorkshopFilterState) {
  const q = f.search.trim().toLowerCase()
  return workshops.filter((w) =>
    (f.mode === 'all' || w.registrationMode === f.mode) &&
    (!f.joinableOnly || isJoinable(w)) &&
    (!q || [w.name, w.description, w.instructor, w.location].some((field) => field.toLowerCase().includes(q))),
  )
}
