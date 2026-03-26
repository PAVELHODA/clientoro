# CLIENTORO — Strategie & Rozhodnutí
> Poslední aktualizace: 2026-03-25

---

## 💰 Cenová strategie
→ **Detailní rozpis viz [PRICING.md](./PRICING.md)**
- 4 módy: OSVČ (299), Solo Inspire (799/499), Firma (1499), Pro Inspire (2499/1799)
- Sleva za vlastní API klíč v AI módech (Solo Inspire, Pro Inspire)
- WIN-WIN filozofie — žádné provize, žádné skryté poplatky
- 14 dní trial zdarma, roční platba = 2 měsíce zdarma

---

## 🎁 Soutěžní strategie (akvizice)
- **Cíl:** Přitáhnout nové lidi, NE odměňovat stávající
- **Stránka:** clientoro.pro/soutez
- 6 kol za rok (každé 2 měsíce)
- Lichý měsíc (Leden, Květen, Září) = výhra s naším API klíčem
- Sudý měsíc (Březen, Červenec, Listopad) = výhra s vlastním API klíčem
- 1 výherce per kolo + 3 náhradníci
- Výherce přijme do 48h → konec kola
- Nepřijme → náhradník #1 (48h) → #2 → #3 → propadá
- Jakmile někdo přijme, kolo končí. Další za 2 měsíce.
- Max 6 výherců/rok
- Max náklad: ~6 000 Kč/rok (reálně méně)
- Výherce s vlastním API co nemá klíč → dostane OSVČ plán zdarma
- Nevýherci dostanou nabídku 14denního trialu
- Účast: jméno, email, telefon, obor, město (= lead databáze)

---

## 📚 Katalog (fáze 2)
### Dva katalogy:
1. **Specialisté** (OSVČ + Solo Inspire) — clientoro.pro/katalog/specialiste
2. **Firmy** (Firma + Pro Inspire) — clientoro.pro/katalog/firmy

### Vyhledávání:
- Jedno pole hledá: jméno, obor i službu najednou
- Filtry: lokalita, dostupnost, cena, jazyk (CZ/SK/EN/DE/ES/UA)
- Každá kombinace obor + město = SEO stránka

### Karta specialisty:
- Fotka, jméno, obor, služby, lokalita

### Karta firmy:
- Logo, název, obor, počet specialistů, lokalita

---

## 🎯 Booking UX
- **Dual entry point:** Služba NEBO Specialista (dva rovnocenné vstupy)
- Specialista karta: fotka + jméno + na klik jeho služby
- Max-width 540px (tablet karta, ne full-width)
- Poppins font
- Klikatelné step kroky (vrátit se zpět)
- Konfetti animace na thank you stránce
- Skeleton loading místo spinnerů
- GDPR badge + "Zabezpečeno" text

---

## 🏠 Landing page
- "Neregistrujte se naslepo" banner na registrační stránce
- Stránka /jak-to-funguje — interaktivní slideshow (ne video)
- Kalkulačka úspor — "Kolik ztratíte bez online rezervací?"
- Srovnávací tabulka Clientoro vs konkurence
- Live demo booking bez registrace (later)
- Development banner (aktuálně aktivní)

---

## 📊 Dashboard UX
### Pozdrav:
- Podle denní doby s Lucide ikonami
- 6-12: "Dobré ráno" + Coffee ikona
- 12-18: "Dobré odpoledne" + Sun ikona
- 18-23: "Dobrý večer" + Moon ikona
- 23-6: "Ještě vzhůru?" + Lamp ikona
- ŽÁDNÉ osobní oslovení jménem

### Dnešní přehled:
- "Dnes: 5 rezervací, první v 9:00"

### Motivační věty:
- Zapnout/vypnout (uživatel si řídí)
- Kategorie po rozbalení: Podnikání, Produktivita, Růst, Tým, Klienti, Finance
- Příklady: "Každý spokojený klient je vaše nejlepší reklama."

### Clientoro banner:
- Naše reklamní plocha — vždy viditelný
- Novinky, nabídky, tipy, upgrade nabídky
- Oddělený od motivačních vět

---

## 🔐 Superadmin
### Delegáti:
- Plný přístup — vidí vše, spravuje uživatele, řeší support
- Omezený přístup — jen přiřazené organizace, základní operace
- Nemůže: smazat platformu, měnit superadmina, měnit billing

### Správa delegátů:
- Pozastavit (nemůže se přihlásit, účet existuje)
- Zablokovat (trvalé)
- Omezit (snížit práva)

### Promo kódy:
- Superadmin generuje: název, typ, hodnota, max použití, platnost
- Typy: trial prodloužení, sleva na plán, upgrade zdarma, beta přístup
- Audit log — kdo použil, kdy
- Statistiky použití

### Easter egg:
- 6x klik na "Kalendář" = odemkne zpětnou rezervaci

---

## ⏳ Waitlist & kolize
### Kolize (funguje):
- OSVČ: jeden specialista → jen volné sloty
- Firma: per staff_id → různí lidé ve stejný čas OK
- Real-time DB check při vytvoření

### Smart alternativa (TODO):
- "Petr nemá volno v 9:00, ale Jana ano" — nabídnout

### Čekací listina (TODO):
- Klient chce obsazený termín → "Zařadit do čekací listiny?"
- Při zrušení → email prvnímu ve frontě
- 30 min limit na potvrzení → pak další → pak propadá

---

## 📧 Email
- Logo salonu v hlavičce (nebo fallback Clientoro logo)
- Booking ID — #CLT-2026-0042
- Personalizovaný subject (bez jména klienta)
- "Přidat do kalendáře" — Google/Apple/Outlook linky
- Manage link — "Spravovat rezervaci" tlačítko
- Připomínka den předem (cron job)

---

## 🎨 Design principy
- Žádné dětské emoji — Lucide ikony (SVG, monochromatické)
- Profesionální, čistý, důvěryhodný
- World-class UX — Stripe/Linear úroveň
- Mobile-first


// update-strategy-contest.js
const fs = require('fs')
const p = 'docs/STRATEGY.md'
let c = fs.readFileSync(p, 'utf8')

c = c.replace(
  '- Účast: jméno, email, telefon, obor, město (= lead databáze)',
  `- Podmínky účasti:
  - Jméno a příjmení (povinné)
  - Email (povinné)
  - Telefon (povinné)
  - Obor / činnost (povinné, dropdown)
  - Město (povinné)
  - IČO — povinné pro hlavní výherce (ověření přes ARES)
  - Bez IČO "plánuji podnikat" = může být náhradník
  - Bez IČO a neplánuje = nemůže soutěžit
  - Souhlas se zpracováním osobních údajů (GDPR)
  - Souhlas se zasíláním novinek (marketing)
- Výsledek: kvalitní lead databáze reálných podnikatelů`
)

fs.writeFileSync(p, c, 'utf8')
console.log('Done - contest conditions updated')

// update-dark-mode-docs.js
const fs = require('fs')
const p = 'docs/STRATEGY.md'
let c = fs.readFileSync(p, 'utf8')

c = c.replace(
  '## 🎨 Design principy',
  `## 🌙 Dark mode
- Přepínač v Settings nebo sidebaru (Sun/Moon Lucide ikona)
- Pozadí: nikdy čistě černá — vždy s nádechem modré (#0f1419)
- Text: nikdy čistě bílý — vždy #e5e7eb (šetří oči)
- Kontrast min 4.5:1 (WCAG AA) — texty MUSÍ být čitelné
- Sidebar: hlubší oceánový gradient (#0a1628 → #0c2235)
- Karty: #1a2332 (tmavě šedá s modrou)
- Accent: #14b8a6 (světlejší teal — svítí v tmavém)
- Stíny nahradit jemnými bordery (#2d3748)
- Oceánový brand v dark modu = premium noční dashboard
- Implementace: Tailwind dark: prefix

---

## 🎨 Design principy`
)

fs.writeFileSync(p, c, 'utf8')
console.log('Done - dark mode strategy added')



---

## 🔄 Migrace
- Import z: Google Calendar (.ics), Reservio (CSV), Fresha (CSV), MYFOX, Reenio, Bookio, Anolla, Excel, Apple/Outlook Calendar
- Co migrovat: klienti, rezervace (historie), služby, zaměstnanci, kalendář, permanentky, věrnostní body
- Formáty: CSV, JSON, .ics
- UI: Settings → Import dat → výběr zdroje → upload → mapování sloupců → náhled → import
- Musí být SNADNÉ — jeden upload, automatické mapování, žádné technické znalosti

---

## 🤖 AI Chat
- NIKDY nevyskakuje — diskrétní ikonka v rohu
- Klient/majitel klikne sám když chce
- Inspire módy = zapnutý by default
- OSVČ/Firma = vypnutý by default
- Umí: tržby, volné sloty, doporučení, kampaně, odpovědi klientům

---

## 🇨🇿🇸🇰🇪🇺 Právní a legislativní
- GDPR: souhlas, výmaz, export, DPO kontakt
- Cookie consent: nutné přidat cookie lištu
- VOP: CZ + SK verze
- DPH: CZ 21%, SK 23%
- Hosting dat v EU (Supabase AWS eu-central)
- Later: DSA, ePrivacy, PSD2 pro EU expanzi

---

## 🇸🇰 Slovenský trh
- Konkurence: Reservio, Bookio, Anolla, Fresha
- Naše výhoda: AI, žádné provize, fér ceny, CRM, growth nástroje
- Kulturně: plná slovenčina (ne překlad), vřelejší tón, "vy" forma
- Měna: EUR (přepínání CZK/EUR v nastavení)
- Reference: slovenské case studies
- Instagram dominuje v SK beauty segmentu

---

## 💰 Podpora CZK
- Ceník primárně v CZK, sekundárně EUR pro SK
- Fakturace v měně organizace
- DB: currency pole v organizations ('CZK' | 'EUR')
- Stripe: nativní podpora CZK i EUR

---

## 🧲 Magnetický generátor — přívod klientů
### Pro klienty našich klientů (9-12 nových/měsíc):
- SEO: JSON-LD, katalog, booking stránky jako microsites
- Social: Instagram booking, QR kódy, sdílení volných slotů, AI generátor postů
- Referral: přiveď kamaráda, dárkové poukazy
- Reaktivace: AI detekce neaktivních, follow-up, narozeniny
- Smart Slot Filler: last minute, happy hours

### Pro registrace na Clientoro (20-40/měsíc):
- Soutěže (6x ročně) → 5-10 registrací/soutěž
- SEO blog + katalog → 3-5/měsíc
- Word of mouth → 2-5/měsíc
- Google Ads (later) → 5-10/měsíc
- Partnerství (dodavatelé, školení) → 2-5/měsíc
