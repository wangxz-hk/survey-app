import './globals.css'

export const metadata = {
  title: 'Survey App - Create & Analyze Surveys',
  description: 'A simple yet powerful survey creation and analysis tool',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}