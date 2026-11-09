import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import TopMenu from '@/components/TopMenu'
import { container } from '@/components/ui'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Lotte Workshops', template: '%s · Lotte Workshops' },
  description: 'Find a workshop and get a fair shot at a seat.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <TopMenu />
        <div className="flex-1">{children}</div>
        <footer className="bg-dark py-8 text-sm">
          <div className={`${container} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
            <p className="text-line">© Lotte Workshops · Fair seats for every workshop</p>
            <nav className="flex gap-6 font-medium text-white">
              <Link href="/workshops" className="hover:underline">Workshops</Link>
              <Link href="/#how-it-works" className="hover:underline">How the lottery works</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  )
}
