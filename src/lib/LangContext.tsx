'use client'
import { createContext, useContext } from 'react'

export const LangContext = createContext<{
  lang: string
  setLang: (l: string) => void
  t: (key: string) => string
  modeGradient: string
  modeText: string
}>({ lang: 'cs', setLang: () => {}, t: (k) => k, modeGradient: '', modeText: 'white' })

export const useLang = () => useContext(LangContext)
