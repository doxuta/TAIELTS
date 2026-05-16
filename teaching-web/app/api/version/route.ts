import { NextResponse } from 'next/server'
import { API_VERSION } from '@/lib/contracts'

/**
 * Public version probe. No auth required so mobile clients can detect
 * server compatibility before signing in.
 */
export const dynamic = 'force-static'

export function GET() {
  return NextResponse.json({
    apiVersion: API_VERSION,
    buildTime: process.env.NEXT_PUBLIC_BUILD_TIME ?? null,
    minSupportedClient: 1,
  })
}
