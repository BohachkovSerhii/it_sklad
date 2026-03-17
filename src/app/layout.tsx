import type { Metadata } from 'next'
import './globals.css'
import Navigation from './Navigation'
import Providers from './Providers'

export const metadata: Metadata = {
  title: 'IT Sklad - Equipment Accounting System',
  description: 'Manage IT assets, departments, employees and transactions seamlessly.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body>
        <Providers>
          <div className="layout-container">
            <Navigation />
            <main className="main-content">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
