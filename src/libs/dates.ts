// The backend stores workshop dates as UTC midnight and compares them in UTC,
// so all formatting and "is it past?" checks here use UTC as well.

export function formatWorkshopDate(iso: string, style: 'long' | 'short' = 'long') {
  return new Date(iso).toLocaleDateString('en-GB', {
    timeZone: 'UTC',
    weekday: style === 'long' ? 'long' : undefined,
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
  })
}

export function dateParts(iso: string) {
  const d = new Date(iso)
  return {
    day: d.toLocaleDateString('en-GB', { timeZone: 'UTC', day: '2-digit' }),
    month: d.toLocaleDateString('en-GB', { timeZone: 'UTC', month: 'short' }),
  }
}

export function todayUtc() {
  return new Date().toISOString().slice(0, 10)
}

// True when the workshop date is before today (UTC); registration closes after the date
export function isPast(iso: string) {
  return iso.slice(0, 10) < todayUtc()
}

// Whole days from today (UTC) to the given date; 0 = today, negative = past
export function daysUntil(iso: string) {
  return Math.round((Date.parse(iso.slice(0, 10)) - Date.parse(todayUtc())) / 86_400_000)
}

export function toInputDate(iso: string) {
  return iso.slice(0, 10)
}

// Lottery applications are accepted through the close date (UTC), then drawn
export function isLotteryOpen(w: { registrationMode: string; lotteryDrawnAt: string | null; lotteryCloseDate: string | null }) {
  return w.registrationMode === 'lottery' && !w.lotteryDrawnAt && !!w.lotteryCloseDate && !isPast(w.lotteryCloseDate)
}
