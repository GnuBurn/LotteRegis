import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { cancelRegistration, deleteWorkshop, registerForWorkshop } from '@/app/actions'
import ActionForm, { SubmitButton } from '@/components/ActionForm'
import { Icon, type IconName } from '@/components/icons'
import { Avatar, Badge, buttonDanger, buttonPrimary, buttonSecondary, Callout, container, ErrorPanel, Panel } from '@/components/ui'
import type { Workshop } from '@/interface'
import { getRegistrations, getWorkshop } from '@/libs/api'
import { formatWorkshopDate, isLotteryOpen, isPast } from '@/libs/dates'
import { lotteryOdds, modeDescription, seatBadge, seatsLeft } from '@/libs/seats'
import { getSession } from '@/libs/session'

const MAX_ACTIVE = 3

export default function WorkshopPage({ params }: PageProps<'/workshops/[id]'>) {
  return (
    <main>
      <Suspense fallback={<div className={`${container} py-12`}><div className="h-96 animate-pulse rounded-2xl bg-surface" /></div>}>
        <WorkshopDetail params={params} />
      </Suspense>
    </main>
  )
}

async function WorkshopDetail({ params }: { params: PageProps<'/workshops/[id]'>['params'] }) {
  const { id } = await params
  const res = await getWorkshop(id)
  if (!res.ok) {
    if (res.status === 404 || res.status === 400) notFound()
    return <div className={`${container} py-12`}><ErrorPanel message={res.error} /></div>
  }
  const workshop = res.data
  const past = isPast(workshop.workshopDate)
  const badge = seatBadge(workshop)
  const lotteryOpen = isLotteryOpen(workshop)
  const lottery = workshop.registrationMode === 'lottery'

  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className={`${container} flex flex-col gap-4 pb-10 pt-8`}>
          <p className="text-[13px] font-medium text-muted">
            <Link href="/workshops" className="hover:text-ink">Workshops</Link>
            <span className="mx-2">/</span>
            <span>{workshop.name}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge tone={badge.tone}>{badge.label}</Badge>
            {lottery && !lotteryOpen && !past && <Badge>Lottery drawn</Badge>}
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-[44px]">{workshop.name}</h1>
          <div className="flex flex-wrap gap-x-7 gap-y-2 text-[15px] font-medium">
            <MetaItem icon="calendar">{formatWorkshopDate(workshop.workshopDate)}</MetaItem>
            <MetaItem icon="pin">{workshop.location}</MetaItem>
            <MetaItem icon="users">{workshop.capacity} seats</MetaItem>
          </div>
        </div>
      </header>

      <div className={`${container} grid gap-8 py-12 lg:grid-cols-[1fr_440px] lg:gap-12 lg:pb-24`}>
        <div className="flex flex-col gap-6">
          <Panel>
            <h2 className="text-xl font-semibold">About this workshop</h2>
            <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-muted">{workshop.description}</p>
          </Panel>
          <Panel>
            <h2 className="text-xl font-semibold">Instructor</h2>
            <div className="mt-4 flex items-center gap-4">
              <Avatar name={workshop.instructor} size="lg" />
              <p className="font-semibold">{workshop.instructor}</p>
            </div>
          </Panel>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-7 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
            <h2 className="text-xl font-semibold">{lotteryOpen ? 'Lottery entry' : 'Registration'}</h2>

            <div className="grid grid-cols-3 gap-3">
              <Stat value={String(workshop.capacity)} label="seats" />
              {lotteryOpen ? (
                <>
                  <Stat value={String(workshop.pendingCount ?? 0)} label="applied" />
                  <Stat value={lotteryOdds(workshop)} label="chance" />
                </>
              ) : (
                <>
                  <Stat value={String(workshop.confirmedCount ?? 0)} label="taken" />
                  <Stat value={String(seatsLeft(workshop))} label="left" />
                </>
              )}
            </div>

            <dl className="flex flex-col gap-3 text-sm">
              <Row icon="calendar" label="Workshop date" value={formatWorkshopDate(workshop.workshopDate, 'short')} />
              {lottery && workshop.lotteryCloseDate && (
                <Row icon="clock" label="Applications close" value={formatWorkshopDate(workshop.lotteryCloseDate, 'short')} />
              )}
              {lottery && (
                <Row icon="shuffle" label="Random draw"
                  value={workshop.lotteryDrawnAt ? `Drawn ${formatWorkshopDate(workshop.lotteryDrawnAt, 'short')}` : 'Day after close'} />
              )}
              <Row icon="ticket" label="Seats given" value={lottery ? 'By lottery' : 'First come, first served'} />
            </dl>

            <Suspense fallback={<div className="h-12 animate-pulse rounded-[10px] bg-canvas" />}>
              <RegistrationBox workshop={workshop} past={past} />
            </Suspense>

            <Callout tone={lotteryOpen ? 'info' : 'neutral'}>{modeDescription(workshop)}</Callout>
          </div>
        </aside>
      </div>
    </>
  )
}

function MetaItem({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <Icon name={icon} className="h-[18px] w-[18px] text-muted" />
      {children}
    </span>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[10px] bg-canvas px-3.5 py-3">
      <p className="text-xl font-bold leading-tight">{value}</p>
      <p className="text-[13px] text-muted">{label}</p>
    </div>
  )
}

function Row({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon name={icon} className="h-[18px] w-[18px] text-muted" />
      <dt className="flex-1 text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}

// What the visitor can do depends on who they are
async function RegistrationBox({ workshop, past }: { workshop: Workshop; past: boolean }) {
  const session = await getSession()

  if (!session) {
    if (past) return <p className="text-sm text-muted">This workshop has already taken place.</p>
    return (
      <div className="space-y-3">
        <Link href={`/signin?callbackUrl=/workshops/${workshop._id}`} className={`${buttonPrimary} w-full`}>
          {isLotteryOpen(workshop) ? 'Sign in to enter the lottery' : 'Sign in to register'}
        </Link>
        <p className="text-center text-[13px] text-muted">
          New here? <Link href="/register" className="font-semibold text-primary hover:underline">Create an account</Link>
        </p>
      </div>
    )
  }

  if (session.user.role === 'admin') {
    return (
      <div className="space-y-3 border-t border-line pt-5">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Admin</p>
        <div className="flex flex-wrap items-start gap-2">
          <Link href={`/admin/workshops/${workshop._id}/edit`} className={buttonSecondary}>Edit workshop</Link>
          <ActionForm action={deleteWorkshop} confirmMessage={`Delete “${workshop.name}”? Existing registrations stay in history.`}>
            <input type="hidden" name="id" value={workshop._id} />
            <SubmitButton className={buttonDanger} pendingText="Deleting…">Delete</SubmitButton>
          </ActionForm>
        </div>
      </div>
    )
  }

  // Member: check their registration here and how many active ones they hold
  const regs = await getRegistrations(session.user.token)
  const mine = regs.ok ? regs.data.find((r) => r.workshop?._id === workshop._id) : undefined
  const activeCount = regs.ok
    ? regs.data.filter((r) => r.status !== 'not_selected' && r.workshop?.isActive && !isPast(r.workshop.workshopDate)).length
    : 0
  const lotteryOpen = isLotteryOpen(workshop)
  const full = !lotteryOpen && seatsLeft(workshop) === 0

  if (mine && mine.status !== 'not_selected') {
    const pending = mine.status === 'pending'
    return (
      <div className="space-y-3">
        {pending ? (
          <Callout tone="warning" icon="clock">
            You&apos;re in the draw. Results come after applications close on {formatWorkshopDate(workshop.lotteryCloseDate!, 'short')}.
          </Callout>
        ) : (
          <Callout tone="success" icon="check">You have a seat at this workshop.</Callout>
        )}
        <ActionForm action={cancelRegistration}
          confirmMessage={pending ? 'Withdraw your lottery application?' : 'Cancel your registration? Your seat will be released.'}>
          <input type="hidden" name="registrationId" value={mine._id} />
          <SubmitButton className={`${buttonSecondary} w-full`} pendingText="Cancelling…">
            {pending ? 'Withdraw application' : 'Cancel registration'}
          </SubmitButton>
        </ActionForm>
      </div>
    )
  }

  if (past) return <p className="text-sm text-muted">Registration has closed for this workshop.</p>

  const notSelected = mine?.status === 'not_selected'
  const atLimit = activeCount >= MAX_ACTIVE

  return (
    <div className="space-y-3">
      {notSelected && (
        <Callout tone="danger" icon="x">
          You weren&apos;t selected in the draw.{full ? ' If a seat frees up, you can take it here.' : ' A seat has freed up, so you can take it now.'}
        </Callout>
      )}
      {full ? (
        <button disabled className={`${buttonPrimary} w-full`}>Workshop full</button>
      ) : atLimit ? (
        <>
          <button disabled className={`${buttonPrimary} w-full`}>{lotteryOpen ? 'Enter the lottery' : 'Register for this workshop'}</button>
          <p className="text-center text-[13px] text-muted">You already have {MAX_ACTIVE} upcoming workshops. Cancel one to join this.</p>
        </>
      ) : (
        <ActionForm action={registerForWorkshop} className="space-y-3">
          <input type="hidden" name="workshopId" value={workshop._id} />
          <SubmitButton className={`${buttonPrimary} w-full`} pendingText={lotteryOpen ? 'Sending application…' : 'Saving your seat…'}>
            {lotteryOpen ? 'Enter the lottery' : notSelected ? 'Take the free seat' : 'Register for this workshop'}
          </SubmitButton>
          <p className="text-center text-[13px] text-muted">
            Free · You have {activeCount} of {MAX_ACTIVE} upcoming registrations{lotteryOpen ? ' (applications count too)' : ''}.
          </p>
        </ActionForm>
      )}
    </div>
  )
}
