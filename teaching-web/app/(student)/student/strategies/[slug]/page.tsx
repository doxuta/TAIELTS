import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ArrowLeft, Clock } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import StrategyReadTracker from './StrategyReadTracker'

export default async function StudentStrategyPage({ params }: { params: { slug: string } }) {
  const article = await db.strategyArticle.findUnique({ where: { slug: params.slug } })
  if (!article) notFound()

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-5">
      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2">
        <Link href="/student/strategies">
          <ArrowLeft className="w-3 h-3 mr-1" /> Chiến lược 4 kỹ năng
        </Link>
      </Button>

      <header>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="secondary">{article.skill}</Badge>
          <BandPill band={article.band} size="sm" />
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> {article.readingTimeMin} phút
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{article.title}</h1>
        <p className="text-base text-muted-foreground">{article.summary}</p>
      </header>

      <Card>
        <CardContent className="p-6">
          <article className="leading-relaxed whitespace-pre-wrap text-sm">{article.content}</article>
        </CardContent>
      </Card>

      <StrategyReadTracker slug={article.slug} />
    </div>
  )
}
