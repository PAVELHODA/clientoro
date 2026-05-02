'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const quotes = [
  { text: 'Každý nový klient je příležitost růstu.', author: 'Clientoro' },
  { text: 'Dobré service znamená spokojené zákazníky.', author: 'Clientoro' },
  { text: 'Automatizace šetří čas, kvalita vítězí.', author: 'Clientoro' },
  { text: 'Váš úspěch je náš úspěch.', author: 'Clientoro' },
]

export default function MotivationalBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % quotes.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlay])

  const goToPrev = () => {
    setCurrentIndex(prev => (prev - 1 + quotes.length) % quotes.length)
    setIsAutoPlay(false)
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % quotes.length)
    setIsAutoPlay(false)
  }

  return (
    <div className={`mt-8 rounded-xl p-6 h-20 flex items-center justify-between gap-4 shadow-lg`} style={{ background: 'linear-gradient(135deg, #0c2d48, #0f6b7a)' }}>
      {/* Prev Button */}
      <button
        onClick={goToPrev}
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
        className={`flex-shrink-0 p-2 rounded-lg transition-all hover:bg-white/20 text-white`}
        aria-label="Previous quote"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Quote */}
      <div className={`flex-1 text-center`}>
        <p className={`text-white text-lg font-medium leading-relaxed`}>
          "{quotes[currentIndex].text}"
        </p>
        <p className={`text-white/60 text-sm mt-2`}>
          — {quotes[currentIndex].author}
        </p>
      </div>

      {/* Next Button */}
      <button
        onClick={goToNext}
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
        className={`flex-shrink-0 p-2 rounded-lg transition-all hover:bg-white/20 text-white`}
        aria-label="Next quote"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className={`flex gap-2 ml-4`}>
        {quotes.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentIndex(i)
              setIsAutoPlay(false)
            }}
            className={`${currentIndex === i ? 'bg-white' : 'bg-white/40'} rounded-full transition-all w-2 h-2`}
            aria-label={`Go to quote ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
