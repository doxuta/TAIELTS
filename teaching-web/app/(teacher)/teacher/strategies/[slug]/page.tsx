import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ArrowLeft, Clock } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'

export default async function StrategyDetailPage({ params }: { params: { slug: string } }) {
  const article = await db.strategyArticle.findUnique({ where: { slug: params.slug } })
  if (!article) notFound()

  const examples = article.examples ? JSON.parse(article.examples) : null

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/teacher/strategies" className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Strategy Library
      </Link>

      <div className="mb-6 animate-fade-up">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge badge-slate">{article.skill}</span>
          <BandPill band={article.band} size="sm" />
          <span className="text-xs text-ink-tertiary inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> {article.readingTimeMin} phút đọc
          </span>
        </div>
        <h1 className="text-2xl font-display font-bold text-ink mb-2">{article.title}</h1>
        <p className="text-base text-ink-secondary">{article.summary}</p>
      </div>

      <div className="card p-6 mb-5 animate-fade-up stagger-1">
        <article className="prose prose-sm max-w-none text-ink leading-relaxed whitespace-pre-wrap">
          {article.content}
        </article>
      </div>

      {examples && (
        <div className="card p-5 animate-fade-up stagger-2 bg-brand-50/30 border-brand-200">
          <h2 className="text-sm font-semibold text-brand-700 uppercase tracking-wider mb-3">Ví dụ áp dụng</h2>
          <pre className="text-sm text-ink whitespace-pre-wrap font-sans leading-relaxed">{JSON.stringify(examples, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
