'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface WordsPullUpProps {
  text: string
  className?: string
  style?: React.CSSProperties
  showAsterisk?: boolean
  delayStart?: number
}

export function WordsPullUp({
  text, className, style, showAsterisk, delayStart = 0,
}: WordsPullUpProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const words = text.split(' ')

  return (
    <span ref={ref} className={className} style={style}>
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: 28, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.75, delay: delayStart + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
            {showAsterisk && i === words.length - 1 && (
              <sup style={{ position: 'relative', fontSize: '0.28em', top: '0.5em', marginLeft: '0.08em', fontStyle: 'normal' }}>®</sup>
            )}
          </motion.span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </span>
  )
}

export interface Segment {
  text: string
  className?: string
  italic?: boolean
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[]
  className?: string
  delayStart?: number
}

export function WordsPullUpMultiStyle({
  segments, className, delayStart = 0,
}: WordsPullUpMultiStyleProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const allWords: Array<{ word: string; segClass?: string; italic?: boolean }> = []
  segments.forEach(seg => {
    seg.text.split(' ').filter(Boolean).forEach(word => {
      allWords.push({ word, segClass: seg.className, italic: seg.italic })
    })
  })

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 0.26em' }}
    >
      {allWords.map(({ word, segClass, italic }, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden' }}>
          <motion.span
            className={segClass}
            style={{
              display: 'inline-block',
              fontStyle: italic ? 'italic' : undefined,
            }}
            initial={{ y: 22, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.75, delay: delayStart + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
