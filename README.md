# 🎯 Clientoro — AI Booking & CRM OS

[![Demo](https://img.shields.io/badge/Demo-Live-green)](https://clientoro.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Public-black)](https://github.com/PAVELHODA/clientoro)

Moderní booking systém + CRM pro služby (kadeřnictví, wellness, estetika, fyzioterapie).

## 🎬 DEMO MODE

Toto je **demo verze** pro portfoliový účel.

### Přihlášení
- **Email:** `admin@clientoro.pro`
- Heslo: viz Supabase

### Co je dostupné v demo
✅ Landing page  
✅ Login  
✅ Superadmin dashboard (4 testovací organizace)  

### Co není dostupné
❌ Registrace (demo mode)  

---

## 🛠️ TECH STACK

- **Framework:** Next.js 14 (App Router)
- **Auth:** Supabase (JWT + session)
- **DB:** PostgreSQL (Supabase)
- **UI:** Tailwind CSS + Shadcn/ui
- **AI:** OpenAI API
- **Payment:** Stripe (integrace připravena)

---

## 🚀 LOCAL SETUP

`bash
git clone https://github.com/PAVELHODA/clientoro.git
cd clientoro
npm install
npm run dev
`

Pak jdi na `http://localhost:3000`

---

## 📊 STRUKTURA PROJEKTU

`
src/
├── app/                 # Next.js pages & API routes
├── components/          # React komponenty
├── lib/                 # Utilities, Supabase
├── types/               # TypeScript types
└── styles/              # Global CSS
`

---

**Status:** 🚧 Demo verze pro portfolium
