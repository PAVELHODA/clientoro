'use client'
import { createContext, useContext } from 'react'

export type ContentTheme = {
  key: string
  bg: string
  cardBg: string
  cardBorder: string
  cardShadow: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  headerBg: string
  headerBorder: string
  mainBorder: string
  inputBg: string
  inputBorder: string
  hoverBg: string
  badgeBg: string
  outerBg: string
  outerBorder: string
  wrapperPadding: boolean
}

const defaultContentTheme: ContentTheme = {
  key: 'light', bg: '#f8fafc', cardBg: '#ffffff', cardBorder: '1px solid #e2e8f0',
  cardShadow: '0 1px 3px rgba(0,0,0,0.06)', textPrimary: '#0f172a', textSecondary: '#475569',
  textMuted: '#94a3b8', headerBg: '#ffffff', headerBorder: '#f1f5f9',
  mainBorder: '1px solid #e2e8f0', inputBg: '#ffffff', inputBorder: '#e2e8f0',
  hoverBg: '#f1f5f9', badgeBg: '#f1f5f9', outerBg: '#f1f5f9', outerBorder: '1px solid #e2e8f0',
  wrapperPadding: false,
}

export const LangContext = createContext<{
  lang: string
  setLang: (l: string) => void
  t: (key: string) => string
  modeGradient: string
  modeText: string
  contentTheme: ContentTheme
}>({ lang: 'cs', setLang: () => {}, t: (k) => k, modeGradient: '', modeText: 'white', contentTheme: defaultContentTheme })

export const useLang = () => useContext(LangContext)