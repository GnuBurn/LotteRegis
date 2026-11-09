import type { Tone } from '@/components/ui'
import type { Workshop } from '@/interface'
import { daysUntil, formatWorkshopDate, isLotteryOpen, isPast } from './dates'

export function seatsLeft(w: Workshop) {
  return Math.max(w.capacity - (w.confirmedCount ?? 0), 0)
}

// Lottery applications close within this many days → "Closing soon"
const CLOSING_SOON_DAYS = 2

// Short label + colour for cards and badges
export function seatBadge(w: Workshop): { label: string; tone: Tone } {
  if (isPast(w.workshopDate)) return { label: 'Finished', tone: 'neutral' }
  if (isLotteryOpen(w)) {
    return daysUntil(w.lotteryCloseDate!) < CLOSING_SOON_DAYS
      ? { label: 'Closing soon', tone: 'warning' }
      : { label: 'Lottery open', tone: 'primary' }
  }
  const left = seatsLeft(w)
  if (left === 0) return { label: 'Full', tone: 'neutral' }
  return { label: `${left} of ${w.capacity} seats left`, tone: 'success' }
}

// "40 seats · 312 applied" for open lotteries, otherwise how many seats are taken
export function seatSummary(w: Workshop) {
  return isLotteryOpen(w)
    ? `${w.capacity} seats · ${w.pendingCount ?? 0} applied`
    : `${w.capacity} seats · ${w.confirmedCount ?? 0} taken`
}

// Rough odds for someone applying now: seats ÷ (applicants + you)
export function lotteryOdds(w: Workshop) {
  const applicants = (w.pendingCount ?? 0) + 1
  if (applicants <= w.capacity) return '100%'
  return `~${Math.floor((w.capacity / applicants) * 100)}%`
}

// One-line explanation of how seats are given out
export function modeDescription(w: Workshop) {
  if (w.registrationMode === 'fcfs') return 'First come, first served: you get a seat as soon as you register.'
  if (isLotteryOpen(w)) {
    return `Apply by ${formatWorkshopDate(w.lotteryCloseDate!)}. Applying early does not improve your odds. If more people apply than there are seats, winners are drawn at random; otherwise everyone gets in.`
  }
  return 'The draw has happened. Any seats that free up now go first come, first served.'
}
