'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

function AnimatedChar({
  char,
  progress,
  index,
  total,
}: {
  char: string
  progress: ReturnType<typeof useScroll>['scrollYProgress']
  index: number
  total: number
}) {
  const charProgress = index / total
  const opacity = useTransform(progress, [charProgress - 0.1, charProgress + 0.05], [0.15, 1])

  if (char === ' ') return <span style={{ display: 'inline-block', width: '0.3em' }}>&nbsp;</span>

  return (
    <motion.span style={{ opacity, display: 'inline-block' }}>
      {char}
    </motion.span>
  )
}

interface ScrollTextProps {
  text: string
  className?: string
}

export function ScrollText({ text, className }: ScrollTextProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  })

  const chars = text.split('')

  return (
    <p ref={ref} className={className} style={{ lineHeight: 1.6 }}>
      {chars.map((char, i) => (
        <AnimatedChar key={i} char={char} progress={scrollYProgress} index={i} total={chars.length} />
      ))}
    </p>
  )
}
