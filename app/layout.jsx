import './globals.css'

export const metadata = {
  title: 'Club Basketball Rosters',
  description: 'Weekly team rosters and tournament schedule',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}
