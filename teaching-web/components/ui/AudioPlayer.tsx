'use client'

import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react'

interface AudioPlayerProps {
  src: string
  /** Listening sections: usually 1.0 plays only once */
  allowReplay?: boolean
}

export function AudioPlayer({ src, allowReplay = true }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => setProgress(a.currentTime)
    const onMeta = () => setDuration(a.duration)
    const onEnd = () => setPlaying(false)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('ended', onEnd)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('ended', onEnd)
    }
  }, [])

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (playing) a.pause()
    else a.play()
    setPlaying(!playing)
  }

  const restart = () => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = 0
    setProgress(0)
  }

  const changeSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5]
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length]
    setSpeed(next)
    if (audioRef.current) audioRef.current.playbackRate = next
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  return (
    <div className="card p-4 flex items-center gap-3">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={toggle} className="w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-all active:scale-95">
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex-1">
        <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 transition-all" style={{ width: `${(progress / duration) * 100 || 0}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-ink-tertiary font-mono mt-1">
          <span>{fmt(progress)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>
      <button onClick={changeSpeed} className="text-xs font-mono font-bold text-ink-secondary hover:text-brand-600 px-2 py-1 rounded-md hover:bg-surface-tertiary transition-all">
        {speed}×
      </button>
      {allowReplay && (
        <button onClick={restart} className="btn-icon" title="Phát lại từ đầu">
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
