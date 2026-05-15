import { readFile } from 'fs/promises'
import { NextResponse } from 'next/server'
import path from 'path'

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'landing-v2.html')
  const html = await readFile(filePath, 'utf-8')

  // Inject "Sign in" link into navbar
  const patched = html.replace(
    '<a href="#contact" class="nav-link">Inquiries</a>',
    '<a href="#contact" class="nav-link">Inquiries</a>' +
    '<a href="/login" class="nav-link" style="background:rgba(225,224,204,.12);padding:6px 14px;border-radius:999px;font-weight:700;margin-left:4px">Sign in</a>'
  )

  return new NextResponse(patched, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
