'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react'
import { useLang } from '@/lib/LangContext'

export function MotivationalBanner() {
  const { t } = useLang()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const tips = [
    t('mot_tip_1'),
    t('mot_tip_2'),
    t('mot_tip_3'),
    t('mot_tip_4'),
    t('mot_tip_5'),
    t('mot_tip_6'),
    t('mot_tip_7'),
    t('mot_tip_8'),
  ]

  useEffect(() => {
    if (!isAutoPlay) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % tips.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [isAutoPlay, tips.length])

  const goToPrev = () => {
    setIsAutoPlay(false)
    setCurrentIndex(prev => (prev - 1 + tips.length) % tips.length)
  }

  const goToNext = () => {
    setIsAutoPlay(false)
    setCurrentIndex(prev => (prev + 1) % tips.length)
  }

  return (
    <div className="mt-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl p-6 h-20 flex items-center justify-between gap-4 shadow-lg">
      <button
        onClick={goToPrev}
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
        className="flex-shrink-0 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex-1 flex items-center gap-3 min-w-0">
        <Lightbulb className="w-6 h-6 text-white flex-shrink-0" />
        <p className="text-white font-semibold text-lg truncate">
          {tips[currentIndex]}
        </p>
      </div>

      <button
        onClick={goToNext}
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
        className="flex-shrink-0 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="flex-shrink-0 flex gap-1">
        {tips.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIsAutoPlay(false)
              setCurrentIndex(i)
            }}
            className={w-2 h-2 rounded-full transition-all \}
          />
        ))}
      </div>
    </div>
  )
}
