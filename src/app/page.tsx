import Form from 'next/form'
import Link from 'next/link'
import { Suspense } from 'react'
import { Icon, type IconName } from '@/components/icons'
import { WorkshopGrid } from '@/components/WorkshopCard'
import { buttonPrimary, CardSkeleton, container, ErrorPanel } from '@/components/ui'
import { getWorkshops } from '@/libs/api'
import { isPast } from '@/libs/dates'

export default function Home() {
  return (
    <main>
      <section className="bg-primary-soft">
        <div className={`${container} grid items-center gap-12 py-16 lg:grid-cols-[1fr_480px] lg:gap-20 lg:py-[72px]`}>
          <div className="flex flex-col gap-5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[13px] font-semibold text-primary">
              <Icon name="shuffle" className="h-3.5 w-3.5" />
              Workshop registration by fair lottery
            </span>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-[52px]">Every seat, drawn fairly.</h1>
            <p className="max-w-xl text-lg text-muted">
              Popular workshops fill in seconds. Here, everyone who applies before the deadline gets the same chance — no refreshing, no racing.
            </p>
            <Form action="/workshops" className="flex flex-col gap-3 sm:flex-row">
              <label className="flex h-12 flex-1 items-center gap-2.5 rounded-[10px] border border-line bg-surface px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 sm:max-w-md">
                <Icon name="search" className="h-[18px] w-[18px] text-muted" />
                <input name="search" placeholder="Search workshops, topics or instructors" aria-label="Search workshops"
                  className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted" />
              </label>
              <button className={buttonPrimary}>Browse workshops</button>
            </Form>
          </div>

          <div id="how-it-works" className="scroll-mt-24 rounded-2xl border border-line bg-surface p-8">
            <h2 className="text-lg font-semibold">How the lottery works</h2>
            <ol className="mt-5 space-y-5">
              <Step n={1} icon="ticket" title="Apply before the close date">
                Lottery workshops accept applications until their close date. Others give seats first come, first served.
              </Step>
              <Step n={2} icon="shuffle" title="Random draw after it closes">
                Seats are drawn at random. If everyone fits, everyone gets in.
              </Step>
              <Step n={3} icon="check" title="Check your result">
                Winning seats are confirmed automatically. See them under My registrations.
              </Step>
            </ol>
          </div>
        </div>
      </section>

      <section className={`${container} py-16 lg:pb-24`}>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-[28px] font-bold tracking-tight">Open for entries</h2>
            <p className="mt-1.5 text-[15px] text-muted">Upcoming workshops you can still join.</p>
          </div>
          <Link href="/workshops" className="text-sm font-semibold text-primary hover:text-primary-hover">See all workshops →</Link>
        </div>
        <Suspense fallback={<CardSkeleton count={6} />}>
          <UpcomingWorkshops />
        </Suspense>
      </section>
    </main>
  )
}

function Step({ n, icon, title, children }: { n: number; icon: IconName; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-primary-soft text-primary">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div>
        <p className="text-[15px] font-semibold">{n}. {title}</p>
        <p className="mt-1 text-sm text-muted">{children}</p>
      </div>
    </li>
  )
}

async function UpcomingWorkshops() {
  const res = await getWorkshops()
  if (!res.ok) return <ErrorPanel message={res.error} />

  const upcoming = res.data.filter((w) => !isPast(w.workshopDate)).slice(0, 6)
  if (upcoming.length === 0) {
    return <p className="text-muted">No upcoming workshops yet. Check back soon.</p>
  }
  return <WorkshopGrid workshops={upcoming} />
}
