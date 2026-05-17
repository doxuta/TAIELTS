import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NewSourceForm } from './NewSourceForm'

export default function NewSourcePage() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/sources"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Sources
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-2">New source</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Khai báo metadata. Source khởi tạo ở trạng thái <strong>DRAFT</strong> cho đến khi
          được approve.
        </p>
      </div>
      <NewSourceForm />
    </div>
  )
}
