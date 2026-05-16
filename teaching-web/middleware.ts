import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = (req.nextauth.token as { role?: string } | null)?.role

    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      const url = req.nextUrl.clone()
      url.pathname = '/dashboard'
      url.search = ''
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/builder') && role !== 'ADMIN' && role !== 'TEACHER') {
      const url = req.nextUrl.clone()
      url.pathname = '/dashboard'
      url.search = ''
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
  }
)

export const config = {
  matcher: [
    '/teacher/:path*',
    '/student/:path*',
    '/dashboard',
    '/admin/:path*',
    '/builder/:path*',
  ],
}
