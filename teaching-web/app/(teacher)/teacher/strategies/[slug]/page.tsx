import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ArrowLeft, Clock } from 'lucide-react'
import { BandPill } from '@/components/ui/BandPill'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function StrategyDetailPage({ params }: { params: { slug: string } }) {
  const article = await db.strategyArticle.findUnique({ where: { slug: params.slug } })
  if (!article) notFound()

  const examples = article.examples ? JSON.parse(article.examples) : null

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-5">
      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground -ml-2">
        <Link href="/teacher/strategies">
          <ArrowLeft className="w-3 h-3 mr-1" /> Strategy Library
        </Link>
      </Button>

      <header>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="secondary">{article.skill}</Badge>
          <BandPill band={article.band} size="sm" />
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> {article.readingTimeMin} phút đọc
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{article.title}</h1>
        <p className="text-base text-muted-foreground">{article.summary}</p>
      </header>

      <Card>
        <CardContent className="p-6">
          <article className="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap">
            {article.content}
          </article>
        </CardContent>
      </Card>

      {examples && (
        <Card className="bg-primary/5 border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-primary">Ví dụ áp dụng</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
              {JSON.stringify(examples, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
