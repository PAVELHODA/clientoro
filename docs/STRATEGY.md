# CLIENTORO — Strategie & Rozhodnutí
> Poslední aktualizace: 2026-03-25

---

## 💰 Cenová strategie
- 4 módy: OSVČ, Solo Inspire, Firma, Pro Inspire
- Sleva za vlastní API klíč ve všech módech
- WIN-WIN filozofie — žádné provize, žádné skryté poplatky

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
