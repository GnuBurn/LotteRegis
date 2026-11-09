import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { cancelRegistration, changeRegistration } from '@/app/actions'
import ActionForm, { SubmitButton } from '@/components/ActionForm'
import type { IconName } from '@/components/icons'
import { Badge, buttonPrimary, buttonSecondary, container, ErrorPanel, IconCircle, inputClass, PageHeader, Panel, type Tone } from '@/components/ui'
import type { Registration, Workshop } from '@/interface'
import { getRegistrations, getWorkshops } from '@/libs/api'
import { formatWorkshopDate, isLotteryOpen, isPast } from '@/libs/dates'
import { seatsLeft } from '@/libs/seats'
import { getSession } from '@/libs/session'

export const metadata: Metadata = { title: 'Registrations' }

const MAX_ACTIVE = 3

export default function MyRegistrationsPage() {
  return (
    <main className={`${container} py-10 lg:pb-24`}>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface" />}>
        <RegistrationsContent />
      </Suspense>
    </main>
  )
}

async function RegistrationsContent() {
  const session = await getSession()
  if (!session) redirect('/signin?callbackUrl=/myregistrations')
  const isAdmin = session.user.role === 'admin'

  const [regs, workshops] = await Promise.all([getRegistrations(session.user.token), getWorkshops()])

  const header = isAdmin ? (
    <PageHeader eyebrow="Admin" title="All registrations">Every member registration, including past workshops.</PageHeader>
  ) : (
    <PageHeader title="My registrations">
      Track your lottery entries and seats. You can hold up to {MAX_ACTIVE} upcoming workshops at a time.
    </PageHeader>
  )

  if (!regs.ok) return <>{header}<ErrorPanel message={regs.error} /></>

  // Not-selected lottery entries don't hold a seat, so they live in history
  const isUpcoming = (r: Registration) =>
    r.status !== 'not_selected' && !!r.workshop?.isActive && !isPast(r.workshop.workshopDate)
  const upcoming = regs.data.filter(isUpcoming)
  const history = regs.data.filter((r) => !isUpcoming(r))
  // Workshops you can still move into: open lotteries, or ones with free seats
  const openWorkshops = workshops.ok
    ? workshops.data.filter((w) => !isPast(w.workshopDate) && (isLotteryOpen(w) || seatsLeft(w) > 0))
    : []

  if (regs.data.length === 0) {
    return (
      <>
        {header}
        <Panel className="flex flex-col items-center text-center">
          <IconCircle icon="ticket" tone="primary" size="lg" />
          <p className="mt-4 text-xl font-semibold">No registrations yet</p>
          <p className="mt-2 text-muted">{isAdmin ? 'Members have not registered for any workshops.' : 'Find a workshop you like and enter the draw or save your seat.'}</p>
          {!isAdmin && <Link href="/workshops" className={`${buttonPrimary} mt-6`}>Browse workshops</Link>}
        </Panel>
      </>
    )
  }

  const count = (list: Registration[], status: Registration['status']) => list.filter((r) => r.status === status).length
  const stats: [IconName, string, string, Tone][] = isAdmin
    ? [
        ['ticket', String(regs.data.length), 'Total registrations', 'primary'],
        ['clock', String(count(regs.data, 'pending')), 'Awaiting draw', 'warning'],
        ['check', String(count(regs.data, 'confirmed')), 'Seats confirmed', 'success'],
        ['x', String(count(regs.data, 'not_selected')), 'Not selected', 'danger'],
      ]
    : [
        ['ticket', `${upcoming.length}/${MAX_ACTIVE}`, 'Upcoming', 'primary'],
        ['clock', String(count(upcoming, 'pending')), 'Awaiting draw', 'warning'],
        ['check', String(count(upcoming, 'confirmed')), 'Seats confirmed', 'success'],
        ['x', String(count(regs.data, 'not_selected')), 'Not selected', 'danger'],
      ]

  return (
    <>
      {header}
      <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([icon, value, label, tone]) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-6">
            <IconCircle icon={icon} tone={tone} />
            <div>
              <p className="text-2xl font-bold leading-tight">{value}</p>
              <p className="text-sm text-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="mb-4 text-xl font-semibold">Upcoming</h2>
        {upcoming.length === 0 && <p className="text-muted">Nothing upcoming.</p>}
        {upcoming.map((r) => (
          <RegistrationRow key={r._id} registration={r} showUser={isAdmin} editable
            // Offer workshops the member isn't already registered for
            moveOptions={[
              ...(r.workshop ? [r.workshop] : []),
              ...openWorkshops.filter((w) => w._id !== r.workshop?._id && !regs.data.some(
                (o) => o.workshop?._id === w._id && o.user?._id === r.user?._id)),
            ]} />
        ))}
      </section>

      {history.length > 0 && (
        <section className="mt-12 space-y-3">
          <h2 className="mb-4 text-xl font-semibold text-muted">History</h2>
          {history.map((r) => <RegistrationRow key={r._id} registration={r} showUser={isAdmin} />)}
        </section>
      )}
    </>
  )
}

const statusView: Record<Registration['status'], { label: string; tone: Tone }> = {
  pending: { label: 'Pending draw', tone: 'warning' },
  confirmed: { label: 'Seat confirmed', tone: 'success' },
  not_selected: { label: 'Not selected', tone: 'danger' },
}

function statusNote(r: Registration) {
  const w = r.workshop
  if (r.status === 'pending') {
    return w?.lotteryCloseDate ? `Draw after applications close on ${formatWorkshopDate(w.lotteryCloseDate, 'short')}` : 'Waiting for the draw'
  }
  if (r.status === 'not_selected') return 'Not drawn this time. If a seat frees up, you can take it on the workshop page.'
  return w?.registrationMode === 'lottery' ? 'You won a seat in the draw.' : 'Your seat is saved.'
}

function RegistrationRow({ registration: r, showUser, editable = false, moveOptions = [] }: {
  registration: Registration
  showUser: boolean
  editable?: boolean
  moveOptions?: Workshop[]
}) {
  const w = r.workshop
  const status = statusView[r.status]
  const noteColor = r.status === 'confirmed' ? 'text-success' : r.status === 'pending' ? 'text-muted' : 'text-danger'

  return (
    <div className={`rounded-2xl border bg-surface px-7 py-5 ${r.status === 'confirmed' && editable ? 'border-success/60' : 'border-line'} ${editable ? '' : 'opacity-75'}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
        <div className="min-w-0 flex-1">
          {w?.isActive ? (
            <Link href={`/workshops/${w._id}`} className="text-[17px] font-semibold hover:text-primary">{w.name}</Link>
          ) : (
            <span className="text-[17px] font-semibold">{w?.name ?? 'Unknown workshop'}</span>
          )}
          {w && <p className="mt-1 text-sm text-muted">{formatWorkshopDate(w.workshopDate, 'short')} · {w.location} · with {w.instructor}</p>}
          {showUser && r.user && (
            <p className="mt-1 text-sm"><span className="font-medium">{r.user.name}</span> <span className="text-muted">· {r.user.email} · {r.user.tel}</span></p>
          )}
        </div>

        <div className="flex flex-col gap-2 md:w-[340px]">
          <div className="flex flex-wrap gap-2">
            <Badge tone={status.tone}>{status.label}</Badge>
            {w && !w.isActive && <Badge tone="danger">Removed</Badge>}
            {w?.isActive && isPast(w.workshopDate) && <Badge>Finished</Badge>}
          </div>
          <p className={`text-sm font-medium ${noteColor}`}>{statusNote(r)}</p>
        </div>

        <ActionForm action={cancelRegistration} className="md:w-[180px] md:text-right"
          confirmMessage={editable ? 'Cancel this registration? The seat will be released.' : 'Remove this registration from history?'}>
          <input type="hidden" name="registrationId" value={r._id} />
          <SubmitButton className={`${buttonSecondary} px-4! py-2.5! text-sm!`} pendingText="…">
            {!editable ? 'Remove' : r.status === 'pending' ? 'Withdraw entry' : 'Cancel seat'}
          </SubmitButton>
        </ActionForm>
      </div>

      {editable && moveOptions.length > 1 && (
        <details className="group mt-4 border-t border-line pt-4">
          <summary className="cursor-pointer list-none text-sm font-semibold text-primary hover:text-primary-hover">
            Move to another workshop <span className="inline-block transition group-open:rotate-90">›</span>
          </summary>
          <ActionForm action={changeRegistration} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input type="hidden" name="registrationId" value={r._id} />
            <select name="workshopId" defaultValue={w?._id} className={inputClass} aria-label="New workshop">
              {moveOptions.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name} — {formatWorkshopDate(o.workshopDate, 'short')}
                  {o._id !== w?._id && isLotteryOpen(o) ? ' (lottery: you apply, no guaranteed seat)' : ''}
                </option>
              ))}
            </select>
            <SubmitButton className={buttonSecondary} pendingText="Moving…">Move</SubmitButton>
          </ActionForm>
        </details>
      )}
    </div>
  )
}
