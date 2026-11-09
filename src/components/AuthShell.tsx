// Two-panel auth layout: dark brand panel (desktop only) + form panel
export default function AuthShell({ heading, subheading, title, children }: {
  heading: string
  subheading: string
  title: string
  children: React.ReactNode
}) {
  return (
    <main className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[620px_1fr]">
      <section className="hidden flex-col justify-between bg-dark px-[72px] py-14 text-white lg:flex">
        <span />
        <div className="flex flex-col gap-5">
          <h2 className="text-4xl font-bold leading-tight">{heading}</h2>
          <p className="text-[17px] text-line">{subheading}</p>
        </div>
        <p className="text-[13px] font-medium text-muted">Fair seats for every workshop</p>
      </section>

      <section className="flex items-center justify-center bg-surface px-5 py-16">
        <div className="w-full max-w-[400px]">
          <h1 className="mb-6 text-[28px] font-bold tracking-tight">{title}</h1>
          {children}
        </div>
      </section>
    </main>
  )
}
