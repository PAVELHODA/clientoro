# CLIENTORO — AI Context & Knowledge Base
> Poslední aktualizace: 2026-03-28
> Tento soubor obsahuje VŠE potřebné pro pokračování vývoje v novém chatu.

---

## 🎯 MISE

Clientoro = AI Booking, CRM, Retention & Growth OS pro služby.
NE "další kalendář". Platforma, která firmám pomáhá získávat nové klienty, proměňovat poptávky v rezervace, udržet je a růst.

**Cílové segmenty:** masáže, fyzioterapie, beauty salony, estetické kliniky, kadeřnictví, fitness, psychologie, vzdělávání, péče o zvířata.

**Strategická ambice:** Být lepší než české rezervační systémy (Reservio, MYFOX, Reenio, Bookio). Být výrazně silnější v AI, growth, lead conversion, retenci a revenue intelligence.

---

## 👤 TÝM

- **Pavel Hoda** — superadmin, solo vývojář, vlastník
- **AI spoluzakladatel** — principal PM, architect, UX designer, full-stack engineer, GTM stratég
- **Superadmin email:** atom369@centrum.cz
- **Test salon:** test@clientoro.pro / Test2026!Clientoro
- **Booking:** clientoro.pro/book/test-salon-clientoro

---

## 🛠️ TECH STACK

| Vrstva | Technologie |
|--------|-------------|
| Frontend | Next.js 14.2.35 (App Router) |
| Jazyk | TypeScript |
| Styling | Tailwind CSS |
| Backend/DB | Supabase (PostgreSQL) — projekt crktiezdemlvfxaaeega |
| Auth | Supabase Auth |
| Email | Resend |
| Hosting | Vercel |
| CDN/DNS | Cloudflare |
| Repo | github.com/PAVELHODA/clientoro (privátní) |
| IDE | VS Code |

---

## 🌐 INFRASTRUKTURA

| Služba | Detail |
|--------|--------|
| Doména hlavní | clientoro.pro (Wedos → Cloudflare DNS) |
| Doména CZ | clientoro.cz (redirect 301 → clientoro.pro) |
| Email routing | Cloudflare → clientoro.app@gmail.com |
| Adresy | admin@clientoro.pro, info@clientoro.pro, noreply@clientoro.pro |
| Supabase HLAVNÍ | crktiezdemlvfxaaeega — AKTIVNÍ |
| Supabase STARÝ | fllyvnelgkusisaxrmet — NEPOUŽÍVAT, NESAHAT |
| GitHub | pavelhoda@gmail.com |
| Vercel | pavelhoda@gmail.com |
| Cloudflare | pavelhoda@gmail.com |

---

## 📏 PRAVIDLA (DODRŽOVAT VŽDY)

### Workflow
- Fix skripty: `node fix-xxx.js` → smazat fix soubor → `npm run build` → `git push`
- Celé soubory posílat jen když řeknu. Jinak posílat fix soubory.
- PowerShell: git příkazy po jednom (ne `&&`)
- CRLF/LF: Windows CRLF, Git auto-converts

### Design
- Žádné dětské emoji v UI — pouze Lucide ikony (SVG, monochromatické)
- Žádné osobní oslovení jménem v dashboardu
- Pozdrav podle denní doby: Coffee (6-12), Sun (12-18), Moon (18-23), Lamp (23-6)
- Poppins font na booking stránce
- Booking page max-width 540px
- Profesionální, čistý, důvěryhodný — Stripe/Linear úroveň
- Mobile-first

### Dark mode
- Pozadí: nikdy čistě černá — vždy s nádechem modré (#0f1419)
- Text: nikdy čistě bílý — vždy #e5e7eb
- Kontrast min 4.5:1 (WCAG AA)
- Sidebar: hlubší oceánový gradient (#0a1628 → #0c2235)
- Karty: #1a2332, Accent: #14b8a6, Stíny → jemné bordery (#2d3748)
- Implementace: Tailwind dark: prefix

### Cenový model (FINÁLNÍ)
| Mód | Cena/měs | S vlastním API | EUR |
|-----|----------|---------------|-----|
| OSVČ | 199 Kč | N/A | 8 € |
| Solo Inspire | 499 Kč | 349 Kč | 20/14 € |
| Firma | 999 Kč | N/A | 40 € |
| Pro Inspire | 1 799 Kč | 1 299 Kč | 72/52 € |

- Žádné provize z rezervací (NIKDY)
- 14 dní trial zdarma
- Roční platba = 2 měsíce zdarma
- Měna: CZK primární, EUR pro SK (pevné ceny, ne kurz)

### Soutěž
- 6 výherců/rok, každé 2 měsíce
- 1 výherce + 3 náhradníci per kolo
- 48h na přijetí, pak další náhradník
- Podmínky: jméno, email, telefon, obor, město, IČO (ověření ARES)

### Multi-firma
- Každá 5. firma zdarma (platíš 4, 5. gratis)

### Booking UX
- Dual entry point: služba NEBO specialista (dva rovnocenné vstupy)
- Klikatelné step kroky (vrátit se zpět)
- Konfetti animace na thank you stránce
- Skeleton loading místo spinnerů
- GDPR badge + "Zabezpečeno" text

---

## 🗄️ DATABÁZE — TABULKY

| Tabulka | Klíčové sloupce |
|---------|----------------|
| organizations | id, name, mode, category, slug, work_start(6), work_end(22), address, phone, email, website, ico, dic, owner_user_id, reminder_enabled, followup_enabled, weekly_report_enabled, currency |
| profiles | id, email, role, organization_id, is_superadmin |
| memberships | id, user_id, organization_id, role |
| staff | id, organization_id, full_name, email, phone, role, color, position, is_active, app_role, permissions (JSONB) |
| services | id, organization_id, name, duration, price, color, category, is_active |
| clients | id, organization_id, full_name, phone, email, note, total_visits, total_spent, last_visit_at, tags, birthday, source |
| bookings | id, organization_id, client_id, service_id, staff_id, start_at, end_at, status, customer_name, customer_phone, customer_email, note, internal_note, source, price, is_backfill, backfill_note, manage_token, reminder_sent, followup_sent, gcal_event_id, created_by |
| staff_working_hours | id, staff_id, weekday, start_time, end_time |
| staff_time_off | id, staff_id, start_date, end_date, reason |
| notifications | id, organization_id, type, title, body, read, created_at |
| golden_thoughts | id, text, author, modes[], active, created_at |
| service_categories | id, name, slug, icon, service_templates[] |
| waitlist | id, organization_id, client_name, phone, service_id, preferred_date |
| manager_pins | id, staff_id, pin |
| google_calendar_tokens | id, organization_id, access_token, refresh_token, token_expires_at, google_email, calendar_id |

**4 role:** superadmin > owner > manager > staff

---

## 📁 FRONTEND STRUKTURA


---

## SESSION NOTES 2026-03-28 (mega session)

### HOTOVÉ DNES (30+ commitů):
- Google Calendar OAuth (propojení, sync, disconnect)
- Org switcher (5 organizací, sidebar dropdown)
- Kompaktní karty služeb + barevné kategorie (18 barev + hash fallback)
- Skeleton loading (Dashboard, Services, Clients, Bookings)
- Změna hesla v Settings (s auto-logout)
- Date range pill tlačítka na rezervacích
- Solo booking (3 kroky, bez staff výběru, bez "Zpět")
- DB data pro Janu Novákovou (staff, služby, working hours, staff_services)
- Step labels viditelné na mobilu
- Thank you stránka — voucher tlačítko + opravené překlepy (CLIENTORO, Rezervovat)
- Email potvrzení funguje (Resend API key opraven na Vercelu)
- PWA manifest opravený (diakritika, ikony 192/512, theme oceán)
- Mobile overflow-x-hidden na layout a landing
- Register mobile fix (freelancer/company flex-shrink)
- Landing text bez duplicitního "kalendář" → "plánovač" a "systém"
- Opravené rozbité emoji v layout
- Notifikační emaily sjednoceny na clientoro.app@gmail.com
- Force light mode (zabránit systémovému dark mode)
- Kalendář — silnější linky, sticky časy, mobile responsive statistiky
- Admin stats klikatelné (vedou na příslušné stránky)
- Postavičky odstraněny (vlnky zachovány)
- Toast duration 6s
- Vercel cron ověřen + CRON_SECRET na Vercelu
- Security headers ověřeny (už byly v next.config.mjs)

### STRATEGICKÉ ROZHODNUTÍ:
1. **3 vrstvy informací (zapnout/vypnout):**
   - Motivační věty — inspirace na dashboardu
   - Průvodce — vysvětlivky co co dělá (tooltip na hover)
   - Růstový rádce — AI/smart bannery pro podnikání a růst
   - OSVČ/Firma dostane základní tipy, Inspire dostane AI tipy
   - Taste & Upgrade pro nižší plány (náhled AI tipu + "Zjistit víc")

2. **Booking flow logika:**
   - OSVČ (solo/solo_inspire): služba → datum → kontakt (3 kroky)
   - Firma (team/pro_inspire): služba/specialista → datum → kontakt (4 kroky)
   - Staff přiřazení služeb funguje v booking flow

3. **Emaily:**
   - FROM: noreply@clientoro.pro
   - Notifikace všech 5 org: clientoro.app@gmail.com
   - Resend API key opraven na Vercelu
   - Potvrzení klientovi + notifikace adminovi fungují

4. **Cenová filozofie:**
   - Žádná urgence ("prvních 100" atd.)
   - Žádné řazení od nejlevnějšího/nejdražšího
   - Cena nemá být hodnotící kritérium

5. **Reaktivace spících zákazníků:**
   - Pozitivní tón, ne smutný ("Chybíte nám" → NE)
   - Konkrétní čísla: "Za poslední 2 týdny: 24 rezervací, 18 400 Kč"
   - Věcné, bez emocí, čísla mluví sama

6. **Sezónní barvy módů (Q marketing):**
   - Q1 zelená (OSVČ), Q2 amber (Solo Inspire), Q3 modrá (Firma), Q4 vínová (Pro Inspire)

7. **Firmy.cz + Seznam SEO:**
   - Seznam = 20% CZ trhu, neignorovat
   - Firmy.cz podporuje booking tlačítko → Clientoro URL
   - Návod pro zákazníky kde všude dát booking link
   - Google Business Profile, Instagram bio, Facebook, QR kód, email podpis

8. **Workflow nový obor:**
   - Majitel požádá superadmina → doloží oprávnění → schválení do 3 dnů

9. **Voucher systém:**
   - Majitel si vytvoří vlastní NEBO vybere z 3 šablon Clientoro
   - Zapnout/vypnout v admin

10. **Landing page redesign (PŘÍŠTÍ CHAT):**
    - Oceánový container (zúžený, ne full-width, jako app)
    - Procesní linka: Booking 24/7 → Klienti & historie → Přehledy tržeb → AI růst s vámi
    - Hero text: "Interaktivní rezervační systém zaměřený na získávání klientů"
    - Kategorie → klik → modal s příklady služeb (velký křížek na zavření)

### OTEVŘENÉ PROBLÉMY PRO PŘÍŠTÍ CHAT:
1. Landing kategorie — proklik → modal s příklady služeb
2. Admin organizace tabulka — useklá na mobilu (overflow-x-auto)
3. Landing page redesign — oceánový container + procesní linka
4. Thank you stránka — ověřit voucher tlačítko na production
5. Motivační věty — motto, pomalejší rotace (15-20s), oceánový styl
6. PWA ikona na plochu mobilu — ověřit manifest
7. Dark mode — zatím force light, dark mode Fáze 2
8. Kalendář — další vylepšení linek a struktury

### TESTOVACÍ ÚČTY:
- Superadmin: admin@clientoro.pro (vidí všech 5 org)
- Test majitel: test@clientoro.pro / Test2026!Clientoro (Test Salon Clientoro)
- Booking test (anonymní): clientoro.pro/book/[slug]
- Notifikace: clientoro.app@gmail.com
- Google Calendar: clientoro.app@gmail.com (propojeno)

### ORGANIZACE V DB:
| Název | Mód | Slug | Služby | Staff |
|-------|-----|------|--------|-------|
| Salon Vlasy | team | salon-vlasy | 19 | ano |
| Massage by Tereza | solo_inspire | massage-by-tereza | ? | ? |
| INK Masters Studio | pro_inspire | ink-masters-studio | ? | ? |
| Mgr. Jana Nováková | solo | jana-novakova-fyzio | 5 | 1 |
| Test Salon Clientoro | team | test-salon-clientoro | ? | ? |

### VERCEL ENV VARS:
- NEXT_PUBLIC_SUPABASE_URL ✅
- NEXT_PUBLIC_SUPABASE_ANON_KEY ✅
- SUPABASE_SERVICE_ROLE_KEY ✅
- RESEND_API_KEY ✅ (opraven 2026-03-28)
- EMAIL_FROM ✅
- NEXT_PUBLIC_APP_URL ✅
- GOOGLE_CLIENT_ID ✅
- GOOGLE_CLIENT_SECRET ✅
- GOOGLE_REDIRECT_URI ✅
- CRON_SECRET ✅

### GOOGLE CLOUD:
- Projekt: My First Project
- OAuth Client: Clientoro Web (986231512925-lbe8...)
- Calendar API: enabled
- Test users: clientoro.app@gmail.com
- Redirect URIs: localhost:3000 + clientoro.pro
