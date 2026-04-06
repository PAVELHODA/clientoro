'use client'
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Obchodni podminky</h1>
        <p className="text-sm text-gray-500 mb-8">Posledni aktualizace: 17. brezna 2026</p>

        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Zakladni ustanoveni</h2>
            <p>Tyto obchodni podminky upravuji prava a povinnosti uzivatelu platformy Clientoro (dale jen "Platforma"), dostupne na adrese clientoro.pro.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Registrace a ucet</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Pro pouzivani Platformy je nutna registrace s platnym emailem</li>
              <li>Uzivatel je povinen uvest pravdive udaje</li>
              <li>Uzivatel je zodpovedny za bezpecnost sveho hesla</li>
              <li>Jeden ucet = jedna organizace</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Sluzby platformy</h2>
            <p>Platforma poskytuje nastroje pro:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Online rezervacni system</li>
              <li>Spravu klientu (CRM)</li>
              <li>Spravu zamestnancu a sluzeb</li>
              <li>Kalendar a planovani</li>
              <li>Notifikace a pripominky</li>
              <li>Verejnou rezervacni stranku</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Cenove plany</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Solo</strong> - pro jednotlivce (OSVC)</li>
              <li><strong>Team</strong> - pro firmy s vice zamestnanci</li>
              <li><strong>Solo Inspire</strong> - rozsireny plan pro jednotlivce</li>
              <li><strong>Enterprise</strong> - individualni reseni</li>
            </ul>
            <p className="mt-2">Aktualni ceny jsou uvedeny na strance Nastaveni v aplikaci.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Ochrana dat</h2>
            <p>Podrobnosti o zpracovani osobnich udaju naleznete v nasich <a href="/privacy" className="text-blue-600 hover:underline">Zasadach ochrany osobnich udaju</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Zodpovednost</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Platforma je poskytovana "tak jak je" (as-is)</li>
              <li>Provozovatel nenese zodpovednost za ztracene trzby zpusobene vypadkem sluzby</li>
              <li>Provozovatel se zavazuje k maximalni dostupnosti sluzby (99.9% SLA)</li>
              <li>Uzivatel je zodpovedny za obsah, ktery do Platformy vklada</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Ukonceni sluzby</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Uzivatel muze svuj ucet kdykoliv zrusit v Nastaveni</li>
              <li>Provozovatel si vyhrazuje pravo zrusit ucet pri poruseni podminek</li>
              <li>Po zruseni uctu jsou data trvale smazana do 30 dnu</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Zaverecna ustanoveni</h2>
            <p>Tyto podminky se ridi pravnim radem Ceske republiky. Pro reseni sporu je prislusny soud v Ceske republice. Provozovatel si vyhrazuje pravo tyto podminky zmenit s predchozim upozornenim uzivatelu.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Kontakt</h2>
            <p>Pro jakekoli dotazy nas kontaktujte na: <a href="mailto:info@clientoro.pro" className="text-blue-600 hover:underline">info@clientoro.pro</a></p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <a href="/" className="text-blue-600 hover:underline text-sm">Zpet na hlavni stranku</a>
        </div>
      </div>
    </div>
  )
}