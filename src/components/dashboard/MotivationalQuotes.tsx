'use client'
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { useLang } from '@/lib/LangContext'

const quotes = [
  "Každý volný termín je příležitost, ne problém.",
  "Za každým termínem je člověk, který vám důvěřuje.",
  "Vaše služba změní jejich den k lepšímu.",
  "Čím déle čekáš, tím více ztrácíš.",
  "Nová rezervace = nový příjem. Udělej si čas."
]

export function MotivationalQuotes() {
  const { lang } = useLang()

  return (
    <div className="mt-10">
      <Carousel
        plugins={[Autoplay({ delay: 3500, stopOnInteraction: true })]}
        className="w-full"
        opts={{ loop: true }}
      >
        <CarouselContent>
          {quotes.map((quote, i) => (
            <CarouselItem key={i}>
              <div className="bg-gradient-to-r from-blue-600 via-emerald-600 to-amber-600 text-white rounded-3xl p-8 md:p-12 text-center">
                <p className="text-xl md:text-2xl font-medium leading-tight italic max-w-3xl mx-auto">
                  „{quote}“
                </p>
                <div className="h-1 w-12 bg-white/30 mx-auto mt-8 rounded-full" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
