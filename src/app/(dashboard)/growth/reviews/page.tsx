// PATH: src/app/(dashboard)/growth/reviews/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useLang } from '@/lib/LangContext'
import { useToast } from '@/components/Toast'
import { Star, Copy, Check, ExternalLink, MessageSquare, Mail, Smartphone, QrCode, Settings, Sparkles, ArrowRight } from 'lucide-react'

export default function ReviewsPage() {
  const { organization } = useAuth()
  const { t, lang, modeGradient, modeText } = useLang()
  const toast = useToast()

  const [googleUrl, setGoogleUrl] = useState((organization as any)?.google_review_url || '')
  const [facebookUrl, setFacebookUrl] = useState((organization as any)?.facebook_review_url || '')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'links' | 'templates' | 'qr'>('links')

  const orgName = organization?.name || 'Salon'
  const slug = (organization as any)?.slug || ''
  const bookingUrl = slug ? `https://clientoro.pro/book/${slug}` : ''

  const l = {
    title: lang === 'en' ? 'Reviews & Reputation' : lang === 'sk' ? 'Recenzie a reputácia' : 'Recenze a reputace',
    subtitle: lang === 'en' ? 'Collect reviews and build trust' : lang === 'sk' ? 'Zbierajte recenzie a budujte dôveru' : 'Sbírejte recenze a budujte důvěru',
    googleReview: lang === 'en' ? 'Google Review Link' : lang === 'sk' ? 'Odkaz na Google recenziu' : 'Odkaz na Google recenzi',
    facebookReview: lang === 'en' ? 'Facebook Review Link' : lang === 'sk' ? 'Odkaz na Facebook recenziu' : 'Odkaz na Facebook recenzi',
    googlePlaceholder: 'https://g.page/r/...',
    facebookPlaceholder: 'https://facebook.com/...',
    copy: lang === 'en' ? 'Copy' : lang === 'sk' ? 'Kopírovať' : 'Kopírovat',
    copied: lang === 'en' ? 'Copied!' : lang === 'sk' ? 'Skopírované!' : 'Zkopírováno!',
    save: lang === 'en' ? 'Save links' : lang === 'sk' ? 'Uložiť odkazy' : 'Uložit odkazy',
    saved: lang === 'en' ? 'Links saved!' : lang === 'sk' ? 'Odkazy uložené!' : 'Odkazy uloženy!',
    saving: lang === 'en' ? 'Saving...' : lang === 'sk' ? 'Ukladám...' : 'Ukládám...',
    linksTab: lang === 'en' ? 'Review links' : lang === 'sk' ? 'Odkazy na recenzie' : 'Odkazy na recenze',
    templatesTab: lang === 'en' ? 'Message templates' : lang === 'sk' ? 'Šablóny správ' : 'Šablony zpráv',
    qrTab: lang === 'en' ? 'QR for reviews' : lang === 'sk' ? 'QR pre recenzie' : 'QR pro recenze',
    smsTemplate: lang === 'en' ? 'SMS template' : lang === 'sk' ? 'SMS šablóna' : 'SMS šablona',
    emailTemplate: lang === 'en' ? 'Email template' : lang === 'sk' ? 'Emailová šablóna' : 'Emailová šablona',
    whatsappTemplate: 'WhatsApp',
    howToGoogle: lang === 'en' ? 'How to get Google Review link' : lang === 'sk' ? 'Ako získať odkaz na Google recenziu' : 'Jak získat odkaz na Google recenzi',
    step1: lang === 'en' ? 'Go to Google Business Profile' : lang === 'sk' ? 'Prejdite na Google Business Profile' : 'Přejděte na Google Business Profile',
    step2: lang === 'en' ? 'Click "Ask for reviews"' : lang === 'sk' ? 'Kliknite na "Požiadať o recenzie"' : 'Klikněte na "Požádat o recenze"',
    step3: lang === 'en' ? 'Copy the link and paste it here' : lang === 'sk' ? 'Skopírujte odkaz a vložte ho sem' : 'Zkopírujte odkaz a vložte ho sem',
    whyReviews: lang === 'en' ? 'Why reviews matter' : lang === 'sk' ? 'Prečo sú recenzie dôležité' : 'Proč jsou recenze důležité',
    stat1: lang === 'en' ? '93% of customers read reviews before booking' : lang === 'sk' ? '93% zákazníkov číta recenzie pred rezerváciou' : '93% zákazníků čte recenze před rezervací',
    stat2: lang === 'en' ? '4.5+ star rating increases bookings by 35%' : lang === 'sk' ? 'Hodnotenie 4.5+ zvyšuje rezervácie o 35%' : 'Hodnocení 4.5+ zvyšuje rezervace o 35%',
    stat3: lang === 'en' ? 'Responding to reviews builds trust' : lang === 'sk' ? 'Odpovedanie na recenzie buduje dôveru' : 'Odpovídání na recenze buduje důvěru',
    stat4: lang === 'en' ? 'Fresh reviews improve Google ranking' : lang === 'sk' ? 'Čerstvé recenzie zlepšujú Google pozíciu' : 'Čerstvé recenze zlepšují Google pozici',
    bestPractices: lang === 'en' ? 'Best practices' : lang === 'sk' ? 'Osvedčené postupy' : 'Osvědčené postupy',
    bp1: lang === 'en' ? 'Ask within 24h after visit' : lang === 'sk' ? 'Požiadajte do 24h po návšteve' : 'Požádejte do 24h po návštěvě',
    bp2: lang === 'en' ? 'Personalize the message' : lang === 'sk' ? 'Personalizujte správu' : 'Personalizujte zprávu',
    bp3: lang === 'en' ? 'Make it easy — one click' : lang === 'sk' ? 'Uľahčite to — jeden klik' : 'Usnadněte to — jeden klik',
    bp4: lang === 'en' ? 'Always respond to reviews' : lang === 'sk' ? 'Vždy odpovedajte na recenzie' : 'Vždy odpovídejte na recenze',
    bp5: lang === 'en' ? 'Never offer incentives for reviews' : lang === 'sk' ? 'Nikdy neponúkajte odmeny za recenzie' : 'Nikdy nenabízejte odměny za recenze',
    noLink: lang === 'en' ? 'Set up your review link above first' : lang === 'sk' ? 'Najprv nastavte odkaz na recenziu vyššie' : 'Nejdříve nastavte odkaz na recenzi výše',
  }

  // SMS/Email templates
  const reviewUrl = googleUrl || facebookUrl || bookingUrl
  const smsText = lang === 'en'
    ? `Hi! Thank you for visiting ${orgName}. We'd love to hear your feedback! Please leave us a review: ${reviewUrl}`
    : lang === 'sk'
    ? `Dobrý deň! Ďakujeme za návštevu ${orgName}. Budeme radi za vašu recenziu: ${reviewUrl}`
    : `Dobrý den! Děkujeme za návštěvu ${orgName}. Budeme rádi za vaši recenzi: ${reviewUrl}`

  const emailSubject = lang === 'en'
    ? `How was your visit at ${orgName}?`
    : lang === 'sk'
    ? `Ako sa vám páčila návšteva v ${orgName}?`
    : `Jak se vám líbila návštěva v ${orgName}?`

  const emailBody = lang === 'en'
    ? `Dear client,\n\nThank you for visiting ${orgName}! We hope you enjoyed your experience.\n\nWe would be grateful if you could share your feedback with a quick review:\n${reviewUrl}\n\nYour review helps other clients find us and helps us improve.\n\nThank you!\n${orgName}`
    : lang === 'sk'
    ? `Vážený klient,\n\nĎakujeme za návštevu ${orgName}! Dúfame, že ste boli spokojný/á.\n\nBudeme veľmi radi, ak nám zanecháte recenziu:\n${reviewUrl}\n\nVaša recenzia pomáha ostatným klientom a nám sa zlepšovať.\n\nĎakujeme!\n${orgName}`
    : `Vážený kliente,\n\nDěkujeme za návštěvu ${orgName}! Doufáme, že jste byl/a spokojený/á.\n\nBudeme velmi rádi, pokud nám zanecháte recenzi:\n${reviewUrl}\n\nVaše recenze pomáhá ostatním klientům a nám se zlepšovat.\n\nDěkujeme!\n${orgName}`

  const whatsappText = encodeURIComponent(smsText)

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success(l.copied)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google_review_url: googleUrl.trim() || null,
          facebook_review_url: facebookUrl.trim() || null,
        }),
      })
      if (res.ok) toast.success(l.saved)
    } catch { toast.error('Error') }
    finally { setSaving(false) }
  }

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button onClick={() => handleCopy(text, field)}
      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all flex-shrink-0 ${copiedField === field ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
      {copiedField === field ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copiedField === field ? l.copied : l.copy}
    </button>
  )

  const qrReviewUrl = googleUrl || facebookUrl
  const qrImageUrl = qrReviewUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrReviewUrl)}&color=0c4a6e&bgcolor=ffffff&margin=1`
    : ''

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-7 h-7 text-amber-500" /> {l.title}
          </h1>
          <p className="mt-1 text-gray-500">{l.subtitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('links')}
          className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'links' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <Settings className="w-4 h-4" /> {l.linksTab}
        </button>
        <button onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'templates' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <MessageSquare className="w-4 h-4" /> {l.templatesTab}
        </button>
        <button onClick={() => setActiveTab('qr')}
          className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'qr' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <QrCode className="w-4 h-4" /> {l.qrTab}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">

          {/* TAB: Links */}
          {activeTab === 'links' && (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" /> {l.googleReview}
                </h3>
                <input type="url" value={googleUrl} onChange={e => setGoogleUrl(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm"
                  placeholder={l.googlePlaceholder} />
                <div className="mt-3 bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-800 mb-2">💡 {l.howToGoogle}</p>
                  <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                    <li>{l.step1}</li>
                    <li>{l.step2}</li>
                    <li>{l.step3}</li>
                  </ol>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 text-lg">f</span> {l.facebookReview}
                </h3>
                <input type="url" value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm"
                  placeholder={l.facebookPlaceholder} />
              </div>

              <button onClick={handleSave} disabled={saving}
                style={{ background: modeGradient, color: modeText }}
                className="px-6 py-3 rounded-xl font-medium text-sm hover:brightness-110 transition-all shadow-sm disabled:opacity-50">
                {saving ? l.saving : l.save}
              </button>
            </>
          )}

          {/* TAB: Templates */}
          {activeTab === 'templates' && (
            <>
              {!reviewUrl ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{l.noLink}</p>
                </div>
              ) : (
                <>
                  {/* SMS */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-green-600" /> {l.smsTemplate}
                      </h3>
                      <CopyButton text={smsText} field="sms" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {smsText}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{smsText.length} {lang === 'en' ? 'characters' : lang === 'sk' ? 'znakov' : 'znaků'}</p>
                  </div>

                  {/* Email */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" /> {l.emailTemplate}
                      </h3>
                      <CopyButton text={`${emailSubject}\n\n${emailBody}`} field="email" />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-2">
                      <p className="text-xs text-gray-500 mb-1">Subject:</p>
                      <p className="text-sm font-medium text-gray-900">{emailSubject}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                      {emailBody}
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-green-500" /> {l.whatsappTemplate}
                      </h3>
                      <div className="flex gap-2">
                        <CopyButton text={smsText} field="whatsapp" />
                        <a href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-green-100">
                          <ExternalLink className="w-3.5 h-3.5" /> {lang === 'en' ? 'Open WhatsApp' : 'Otevřít WhatsApp'}
                        </a>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {smsText}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* TAB: QR */}
          {activeTab === 'qr' && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              {!qrReviewUrl ? (
                <>
                  <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{l.noLink}</p>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider font-medium">
                    {lang === 'en' ? 'Scan to leave a review' : lang === 'sk' ? 'Naskenujte pre zanechanie recenzie' : 'Naskenujte pro zanechání recenze'}
                  </p>
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <img src={qrImageUrl} alt="Review QR" width={300} height={300} className="mx-auto" />
                  </div>
                  <p className="mt-4 text-lg font-bold text-gray-900">{orgName}</p>
                  <p className="text-sm text-gray-500 mt-1">⭐⭐⭐⭐⭐</p>
                  <p className="text-xs text-gray-400 mt-2 font-mono truncate max-w-xs mx-auto">{qrReviewUrl}</p>
                  <div className="flex gap-2 justify-center mt-4">
                    <CopyButton text={qrReviewUrl} field="qr-url" />
                    <a href={qrImageUrl} download={`review-qr-${slug}.png`}
                      className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-amber-100">
                      {lang === 'en' ? 'Download QR' : 'Stáhnout QR'}
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Why reviews matter */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
            <h3 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> {l.whyReviews}
            </h3>
            <ul className="space-y-2.5 text-sm text-amber-800">
              <li className="flex items-start gap-2"><span>📊</span> {l.stat1}</li>
              <li className="flex items-start gap-2"><span>⭐</span> {l.stat2}</li>
              <li className="flex items-start gap-2"><span>💬</span> {l.stat3}</li>
              <li className="flex items-start gap-2"><span>🔍</span> {l.stat4}</li>
            </ul>
          </div>

          {/* Best practices */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> {l.bestPractices}
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-green-500">✓</span> {l.bp1}</li>
              <li className="flex items-start gap-2"><span className="text-green-500">✓</span> {l.bp2}</li>
              <li className="flex items-start gap-2"><span className="text-green-500">✓</span> {l.bp3}</li>
              <li className="flex items-start gap-2"><span className="text-green-500">✓</span> {l.bp4}</li>
              <li className="flex items-start gap-2"><span className="text-red-500">✗</span> {l.bp5}</li>
            </ul>
          </div>

          {/* Quick link to Google Business */}
          <a href="https://business.google.com" target="_blank" rel="noopener noreferrer"
            className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
                <span className="text-sm font-medium text-gray-900">Google Business Profile</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
