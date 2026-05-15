import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ArrowLeft, Clock } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'
import StrategyReadTracker from './StrategyReadTracker'

export default async function StudentStrategyPage({ params }: { params: { slug: string } }) {
  const article = await db.strategyArticle.findUnique({ where: { slug: params.slug } })
  if (!article) notFound()

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/student/strategies" className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-ink mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Chiến lược 4 kỹ năng
      </Link>

      <div className="mb-6 animate-fade-up">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge badge-slate">{article.skill}</span>
          <BandPill band={article.band} size="sm" />
          <span className="text-xs text-ink-tertiary inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> {article.readingTimeMin} phút
          </span>
        </div>
        <h1 className="text-2xl font-display font-bold text-ink mb-2">{article.title}</h1>
        <p className="text-base text-ink-secondary">{article.summary}</p>
      </div>

      <div className="card p-6 mb-5 animate-fade-up stagger-1">
        <article className="text-ink leading-relaxed whitespace-pre-wrap text-sm">{article.content}</article>
      </div>

      <StrategyReadTracker slug={article.slug} />
    </div>
  )
}
