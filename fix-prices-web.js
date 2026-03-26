// fix-prices-web.js
const fs = require('fs')
const p = 'src/app/(dashboard)/settings/page.tsx'
let c = fs.readFileSync(p, 'utf8')

// OSVČ — 199 Kč, jeden tier (bez AI)
c = c.replace(
  `tiers: [
        { label: lang === 'en' ? 'Without AI' : 'Bez AI', price: '49', year: '39', rec: false },
        { label: lang === 'en' ? 'With AI statistics' : lang === 'sk' ? 'S AI statistikami' : 'S AI statistikami', price: '99', year: '79', rec: true },
      ],
      trial: l.trial, free: l.freeAfter, up: 'solo_inspire',`,
  `tiers: [
        { label: lang === 'en' ? 'Standard' : 'Standard', price: '199', year: '166', rec: true },
      ],
      trial: l.trial, free: l.freeAfter, up: 'solo_inspire',`
)

// Firma — 999 Kč, jeden tier (bez AI)
c = c.replace(
  `tiers: [
        { label: lang === 'en' ? 'Without AI' : 'Bez AI', price: '299', year: '239', rec: false },
        { label: lang === 'en' ? 'With AI statistics' : lang === 'sk' ? 'S AI statistikami' : 'S AI statistikami', price: '499', year: '399', rec: true },
      ],
      trial: null, free: null, up: 'pro_inspire',`,
  `tiers: [
        { label: lang === 'en' ? 'Standard' : 'Standard', price: '999', year: '833', rec: true },
      ],
      trial: null, free: null, up: 'pro_inspire',`
)

// Solo Inspire — 499 Kč s naším AI / 349 Kč s vlastním API
c = c.replace(
  `tiers: [
        { label: lang === 'en' ? 'With our AI' : 'S nasim AI', price: '799', year: '639', rec: false },
        { label: lang === 'en' ? 'With your own API key' : lang === 'sk' ? 'S vlastnym API klucom' : 'S vlastnim API klicem', price: '499', year: '399', rec: true, save: '300' },
      ],
      trial: null, free: null, up: 'pro_inspire',`,
  `tiers: [
        { label: lang === 'en' ? 'With our AI' : lang === 'sk' ? 'S nasim AI' : 'S nasim AI', price: '499', year: '416', rec: false },
        { label: lang === 'en' ? 'With your own API key' : lang === 'sk' ? 'S vlastnym API klucom' : 'S vlastnim API klicem', price: '349', year: '291', rec: true, save: '150' },
      ],
      trial: null, free: null, up: 'pro_inspire',`
)

// Pro Inspire — 1 799 Kč s naším AI / 1 299 Kč s vlastním API
c = c.replace(
  `tiers: [
        { label: lang === 'en' ? 'With our AI' : 'S nasim AI', price: '1 999', year: '1 599', rec: false },
        { label: lang === 'en' ? 'With your own API key' : lang === 'sk' ? 'S vlastnym API klucom' : 'S vlastnim API klicem', price: '1 299', year: '1 039', rec: true, save: '700' },
      ],`,
  `tiers: [
        { label: lang === 'en' ? 'With our AI' : lang === 'sk' ? 'S nasim AI' : 'S nasim AI', price: '1 799', year: '1 499', rec: false },
        { label: lang === 'en' ? 'With your own API key' : lang === 'sk' ? 'S vlastnym API klucom' : 'S vlastnim API klicem', price: '1 299', year: '1 083', rec: true, save: '500' },
      ],`
)

// Fix typo: "Inspirre" → "Inspire"
c = c.replaceAll('Solo Inspirre', 'Solo Inspire')
c = c.replaceAll('Pro Inspirre', 'Pro Inspire')

fs.writeFileSync(p, c, 'utf8')
console.log('Done - prices updated to new model!')
