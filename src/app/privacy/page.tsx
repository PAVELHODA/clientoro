'use client'
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Zasady ochrany osobnich udaju</h1>
        <p className="text-sm text-gray-500 mb-8">Posledni aktualizace: 17. brezna 2026</p>

        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Spravce udaju</h2>
            <p>Spravcem vasich osobnich udaju je provozovatel platformy Clientoro, dostupne na adrese clientoro.pro. Kontakt: info@clientoro.pro</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Jake udaje shromazdujeme</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Registracni udaje: email, nazev firmy, heslo (sifrovane)</li>
              <li>Provozni udaje: adresa, telefon, ICO, kategorie sluzeb</li>
              <li>Data klientu: jmeno, telefon, email, historie navstev</li>
              <li>Rezervacni data: datum, cas, sluzba, stav</li>
              <li>Technicke udaje: IP adresa, typ prohlizece, cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Ucel zpracovani</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Poskytovani sluzeb platformy (rezervace, CRM, kalendar)</li>
              <li>Komunikace s uzivateli (notifikace, pripominky)</li>
              <li>Zlepsovani sluzeb a uzivatelske zkusenosti</li>
              <li>Plneni pravnich povinnosti</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Zabezpeceni dat</h2>
            <p>Veskera data jsou chranena pomoci:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>AES-256 sifrovani</strong> pro data v klidu (at-rest encryption)</li>
              <li><strong>TLS 1.2+</strong> pro data pri prenosu (in-transit encryption)</li>
              <li><strong>Row Level Security (RLS)</strong> v databazi - kazda organizace vidi pouze sve udaje</li>
              <li><strong>Hesla jsou hashovana</strong> pomoci bcrypt algoritmu</li>
              <li>Pravidelne bezpecnostni audity a zalohovani</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Sdileni dat</h2>
            <p>Vase data nesdilime s tretimi stranami s vyjimkou:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Poskytovatele infrastruktury (Supabase, Vercel) - zpracovani v EU/USA s GDPR zarukami</li>
              <li>Pravni povinnosti (na zaklade soudniho rozhodnuti)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Vase prava</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Pravo na pristup k vasum udajum</li>
              <li>Pravo na opravu nepresnych udaju</li>
              <li>Pravo na vymazani (pravo byt zapomenut)</li>
              <li>Pravo na prenositelnost udaju</li>
              <li>Pravo podat stiznost u UOOU (uoou.cz)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Cookies</h2>
            <p>Pouzivame pouze technicke cookies nezbytne pro fungovani aplikace (prihlaseni, session). Nepouzivame reklamni ani sledovaci cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Doba uchovavani</h2>
            <p>Data uchovavame po dobu trvani vasho uctu. Po smazani organizace jsou vsechna data trvale odstranena do 30 dnu.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Kontakt</h2>
            <p>Pro jakekoli dotazy ohledne ochrany osobnich udaju nas kontaktujte na: <a href="mailto:info@clientoro.pro" className="text-blue-600 hover:underline">info@clientoro.pro</a></p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <a href="/" className="text-blue-600 hover:underline text-sm">Zpet na hlavni stranku</a>
        </div>
      </div>
    </div>
  )
}