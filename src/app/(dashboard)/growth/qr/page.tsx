// PATH: src/app/(dashboard)/growth/qr/page.tsx
'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useLang } from '@/lib/LangContext'
import { useToast } from '@/components/Toast'
import { QrCode, Download, Copy, Printer, Palette, Check, ExternalLink, Smartphone, CreditCard } from 'lucide-react'

// QR Code generator - pure JS, no dependencies
function generateQRMatrix(text: string): boolean[][] {
  // Simple QR encoding using canvas API fallback
  // We'll use a Google Charts API URL for the actual QR image
  return []
}

const QR_STYLES = [
  { id: 'classic', label: 'Classic', fg: '#000000', bg: '#ffffff', radius: 0 },
  { id: 'rounded', label: 'Rounded', fg: '#1e293b', bg: '#ffffff', radius: 8 },
  { id: 'blue', label: 'Ocean', fg: '#0c4a6e', bg: '#f0f9ff', radius: 4 },
  { id: 'green', label: 'Nature', fg: '#064e3b', bg: '#ecfdf5', radius: 4 },
  { id: 'purple', label: 'Royal', fg: '#4c1d95', bg: '#f5f3ff', radius: 4 },
  { id: 'red', label: 'Bold', fg: '#991b1b', bg: '#fef2f2', radius: 4 },
  { id: 'amber', label: 'Warm', fg: '#78350f', bg: '#fffbeb', radius: 4 },
  { id: 'dark', label: 'Dark', fg: '#ffffff', bg: '#0f172a', radius: 4 },
]

const QR_SIZES = [
  { value: 200, label: 'S (200px)' },
  { value: 300, label: 'M (300px)' },
  { value: 400, label: 'L (400px)' },
  { value: 600, label: 'XL (600px)' },
]

export default function QRPage() {
  const { organization } = useAuth()
  const { t, lang, modeGradient, modeText } = useLang()
  const toast = useToast()
  const [style, setStyle] = useState('classic')
  const [size, setSize] = useState(300)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'qr' | 'card'>('qr')
  const printRef = useRef<HTMLDivElement>(null)

  const slug = (organization as any)?.slug || ''
  const orgName = organization?.name || 'Salon'
  const orgPhone = organization?.phone || ''
  const orgAddress = organization?.address || ''
  const bookingUrl = slug ? `https://clientoro.pro/book/${slug}` : ''

  const currentStyle = QR_STYLES.find(s => s.id === style) || QR_STYLES[0]

  // Google Charts QR API (reliable, no dependencies)
  const qrImageUrl = bookingUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(bookingUrl)}&color=${currentStyle.fg.replace('#', '')}&bgcolor=${currentStyle.bg.replace('#', '')}&margin=1`
    : ''

  const l = {
    title: lang === 'en' ? 'QR Codes' : lang === 'sk' ? 'QR kódy' : 'QR kódy',
    subtitle: lang === 'en' ? 'Generate QR codes for your booking page' : lang === 'sk' ? 'Generujte QR kódy pre vašu booking stránku' : 'Generujte QR kódy pro vaši booking stránku',
    bookingUrl: lang === 'en' ? 'Booking URL' : 'Booking URL',
    copyUrl: lang === 'en' ? 'Copy URL' : lang === 'sk' ? 'Kopírovať URL' : 'Kopírovat URL',
    copied: lang === 'en' ? 'Copied!' : lang === 'sk' ? 'Skopírované!' : 'Zkopírováno!',
    download: lang === 'en' ? 'Download PNG' : lang === 'sk' ? 'Stiahnuť PNG' : 'Stáhnout PNG',
    print: lang === 'en' ? 'Print' : lang === 'sk' ? 'Tlačiť' : 'Tisknout',
    style: lang === 'en' ? 'Style' : 'Styl',
    size: lang === 'en' ? 'Size' : lang === 'sk' ? 'Veľkosť' : 'Velikost',
    preview: lang === 'en' ? 'Preview' : 'Náhled',
    noSlug: lang === 'en' ? 'Set up your booking link in Settings first' : lang === 'sk' ? 'Najprv nastavte booking odkaz v Nastaveniach' : 'Nejdříve nastavte booking odkaz v Nastavení',
    qrTab: 'QR kód',
    cardTab: lang === 'en' ? 'Business card' : lang === 'sk' ? 'Vizitka' : 'Vizitka',
    scanToBook: lang === 'en' ? 'Scan to book' : lang === 'sk' ? 'Naskenujte pre rezerváciu' : 'Naskenujte pro rezervaci',
    bookOnline: lang === 'en' ? 'Book online 24/7' : lang === 'sk' ? 'Rezervujte online 24/7' : 'Rezervujte online 24/7',
    tips: lang === 'en' ? 'Where to use QR codes' : lang === 'sk' ? 'Kde použiť QR kódy' : 'Kde použít QR kódy',
    tip1: lang === 'en' ? 'Print on business cards' : lang === 'sk' ? 'Vytlačte na vizitky' : 'Vytiskněte na vizitky',
    tip2: lang === 'en' ? 'Place at reception desk' : lang === 'sk' ? 'Umiestnite na recepciu' : 'Umístěte na recepci',
    tip3: lang === 'en' ? 'Add to flyers & posters' : lang === 'sk' ? 'Pridajte na letáky a plagáty' : 'Přidejte na letáky a plakáty',
    tip4: lang === 'en' ? 'Share on social media' : lang === 'sk' ? 'Zdieľajte na sociálnych sieťach' : 'Sdílejte na sociálních sítích',
    tip5: lang === 'en' ? 'Put in shop window' : lang === 'sk' ? 'Umiestnite do výkladu' : 'Umístěte do výlohy',
    tip6: lang === 'en' ? 'Add to email signature' : lang === 'sk' ? 'Pridajte do emailového podpisu' : 'Přidejte do emailového podpisu',
    openBooking: lang === 'en' ? 'Open booking page' : lang === 'sk' ? 'Otvoriť booking stránku' : 'Otevřít booking stránku',
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    toast.success(l.copied)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    if (!qrImageUrl) return
    try {
      const res = await fetch(qrImageUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-${slug}-${size}px.png`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(l.download + ' ✓')
    } catch { toast.error('Download failed') }
  }

  const handlePrint = () => {
    if (!printRef.current) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <html><head><title>QR - ${orgName}</title>
      <style>
        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: system-ui, sans-serif; }
        .card { text-align: center; padding: 40px; }
        .card img { margin: 0 auto 16px; }
        .card h2 { font-size: 24px; margin: 0 0 4px; }
        .card p { color: #666; font-size: 14px; margin: 4px 0; }
        .card .url { font-size: 12px; color: #999; margin-top: 12px; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>
      <div class="card">
        <h2>${orgName}</h2>
        ${orgPhone ? `<p>📞 ${orgPhone}</p>` : ''}
        ${orgAddress ? `<p>📍 ${orgAddress}</p>` : ''}
        <img src="${qrImageUrl}" width="300" height="300" style="margin-top:20px;" />
        <p style="font-weight:bold;font-size:16px;margin-top:12px;">${l.scanToBook}</p>
        <p class="url">${bookingUrl}</p>
      </div>
      </body></html>
    `)
    printWindow.document.close()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
  }

  if (!slug) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <QrCode className="w-7 h-7 text-blue-600" /> {l.title}
        </h1>
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{l.noSlug}</h3>
          <a href="/settings" style={{ background: modeGradient, color: modeText }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm hover:brightness-110">
            ⚙️ {lang === 'en' ? 'Go to Settings' : 'Přejít do Nastavení'}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="w-7 h-7 text-blue-600" /> {l.title}
          </h1>
          <p className="mt-1 text-gray-500">{l.subtitle}</p>
        </div>
        <a href={bookingUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm transition-colors">
          <ExternalLink className="w-4 h-4" /> {l.openBooking}
        </a>
      </div>

      {/* Booking URL bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 min-w-0 w-full">
          <p className="text-xs text-gray-500 mb-1">{l.bookingUrl}</p>
          <p className="text-sm font-mono text-blue-600 truncate">{bookingUrl}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={handleCopy}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${copied ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'}`}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? l.copied : l.copyUrl}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('qr')}
          className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${tab === 'qr' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <Smartphone className="w-4 h-4" /> {l.qrTab}
        </button>
        <button onClick={() => setTab('card')}
          className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${tab === 'card' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          <CreditCard className="w-4 h-4" /> {l.cardTab}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Controls */}
        <div className="space-y-4">
          {/* Style picker */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-500" /> {l.style}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {QR_STYLES.map(s => (
                <button key={s.id} onClick={() => setStyle(s.id)}
                  className={`p-2 rounded-lg border-2 transition-all text-center ${style === s.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="w-8 h-8 rounded mx-auto mb-1 border border-gray-100"
                    style={{ backgroundColor: s.bg }}>
                    <div className="w-4 h-4 rounded-sm m-2" style={{ backgroundColor: s.fg, borderRadius: s.radius / 2 }} />
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size picker */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{l.size}</h3>
            <div className="flex gap-2">
              {QR_SIZES.map(s => (
                <button key={s.value} onClick={() => setSize(s.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${size === s.value ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <button onClick={handleDownload}
              style={{ background: modeGradient, color: modeText }}
              className="w-full px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-sm">
              <Download className="w-4 h-4" /> {l.download}
            </button>
            <button onClick={handlePrint}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
              <Printer className="w-4 h-4" /> {l.print}
            </button>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <h3 className="text-sm font-semibold text-amber-900 mb-3">💡 {l.tips}</h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2"><span>💳</span> {l.tip1}</li>
              <li className="flex items-start gap-2"><span>🏪</span> {l.tip2}</li>
              <li className="flex items-start gap-2"><span>📄</span> {l.tip3}</li>
              <li className="flex items-start gap-2"><span>📱</span> {l.tip4}</li>
              <li className="flex items-start gap-2"><span>🪟</span> {l.tip5}</li>
              <li className="flex items-start gap-2"><span>✉️</span> {l.tip6}</li>
            </ul>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-2">
          <div ref={printRef} className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col items-center justify-center min-h-[500px]"
            style={{ backgroundColor: tab === 'card' ? currentStyle.bg : '#ffffff' }}>

            {tab === 'qr' ? (
              <>
                <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider font-medium">{l.preview}</p>
                <div className="p-4 rounded-2xl shadow-lg" style={{ backgroundColor: currentStyle.bg }}>
                  {qrImageUrl && (
                    <img src={qrImageUrl} alt="QR Code" width={size > 400 ? 400 : size} height={size > 400 ? 400 : size}
                      className="mx-auto" style={{ borderRadius: currentStyle.radius }} />
                  )}
                </div>
                <p className="mt-4 text-sm font-semibold text-gray-700">{l.scanToBook}</p>
                <p className="text-xs text-gray-400 mt-1 font-mono">{bookingUrl}</p>
              </>
            ) : (
              <div className="w-full max-w-md mx-auto text-center p-8 rounded-2xl shadow-xl border"
                style={{ backgroundColor: currentStyle.bg, borderColor: currentStyle.fg + '20' }}>
                <h2 className="text-2xl font-bold mb-1" style={{ color: currentStyle.fg }}>{orgName}</h2>
                {orgPhone && <p className="text-sm mb-0.5" style={{ color: currentStyle.fg + 'cc' }}>📞 {orgPhone}</p>}
                {orgAddress && <p className="text-sm mb-4" style={{ color: currentStyle.fg + 'cc' }}>📍 {orgAddress}</p>}
                <div className="my-4">
                  {qrImageUrl && (
                    <img src={qrImageUrl} alt="QR Code" width={200} height={200}
                      className="mx-auto rounded-lg" />
                  )}
                </div>
                <p className="text-base font-bold mt-3" style={{ color: currentStyle.fg }}>{l.bookOnline}</p>
                <p className="text-xs mt-1 font-mono" style={{ color: currentStyle.fg + '99' }}>{bookingUrl}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
