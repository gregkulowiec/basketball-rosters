import './globals.css'

export const metadata = {
  title: 'MCW Starz Basketball Rosters',
  description: 'Weekly tournament rosters and schedules',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}
