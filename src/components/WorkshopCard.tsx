import Link from 'next/link'
import type { Workshop } from '@/interface'
import { formatWorkshopDate, isLotteryOpen, isPast } from '@/libs/dates'
import { seatBadge, seatSummary } from '@/libs/seats'
import { Icon, type IconName } from './icons'
import { Badge, buttonSecondary } from './ui'

export default function WorkshopCard({ workshop: w }: { workshop: Workshop }) {
  const past = isPast(w.workshopDate)
  const badge = seatBadge(w)
  const lottery = w.registrationMode === 'lottery'

  return (
    <Link
      href={`/workshops/${w._id}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_4px_16px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(15,23,42,0.10)] ${past ? 'opacity-60' : ''}`}
    >
      <div className="flex h-40 flex-col justify-between bg-primary-soft p-6 text-primary">
        <span className="text-xs font-bold uppercase tracking-widest">{lottery ? 'Lottery' : 'First come, first served'}</span>
        <Icon name={lottery ? 'shuffle' : 'users'} className="h-10 w-10" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6 pt-5">
        <Badge tone={badge.tone}>{badge.label}</Badge>
        <h3 className="text-lg font-semibold leading-snug group-hover:text-primary">{w.name}</h3>
        <Meta icon="calendar">{formatWorkshopDate(w.workshopDate, 'short')}</Meta>
        <Meta icon="pin">{w.location}</Meta>
        <Meta icon="users">{seatSummary(w)}</Meta>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="text-[13px] font-medium text-muted">
            {isLotteryOpen(w) ? `Applications close ${formatWorkshopDate(w.lotteryCloseDate!, 'short')}` : `With ${w.instructor}`}
          </span>
          <span className={`${buttonSecondary} px-4! py-2.5! text-sm!`}>View details</span>
        </div>
      </div>
    </Link>
  )
}

function Meta({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-sm text-muted">
      <Icon name={icon} />
      <span className="truncate">{children}</span>
    </p>
  )
}

export function WorkshopGrid({ workshops }: { workshops: Workshop[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
      {workshops.map((w) => <WorkshopCard key={w._id} workshop={w} />)}
    </div>
  )
}
