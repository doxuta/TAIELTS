import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond, Instrument_Serif, Almarai } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const almarai = Almarai({
  subsets: ['arabic'],
  weight: ['300', '400', '700', '800'],
  variable: '--font-almarai',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Meridian — IELTS Teaching Platform',
    template: '%s | Meridian IELTS',
  },
  description: 'Hệ thống quản lý dạy học IELTS 1-1 chuyên nghiệp. Theo dõi lộ trình, soạn giáo án, chấm bài và tạo báo cáo tiến độ học viên.',
  keywords: ['IELTS', 'teaching', 'education', 'English learning', 'lộ trình IELTS'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${cormorant.variable} ${instrumentSerif.variable} ${almarai.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
