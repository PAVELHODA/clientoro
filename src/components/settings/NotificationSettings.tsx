// PATH: src/components/settings/NotificationSettings.tsx
'use client'

import { Bell, Mail, Check } from 'lucide-react'

interface OrgSettings {
  notification_email: string; notify_on_booking: boolean; notify_on_cancel: boolean
  reminder_enabled: boolean; reminder_hours_before: number
  followup_enabled: boolean; review_request_enabled: boolean; google_review_url: string
  [key: string]: any
}

interface Props {
  s: OrgSettings
  setS: (s: any) => void
  lang: string
  l: Record<string, any>
  sendTestEmail: () => void
  testingSend: boolean
  modeGradient: string
}

export default function NotificationSettings({ s, setS, lang, l, sendTestEmail, testingSend, modeGradient }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-1">
        <Bell className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">{l.notifications}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">{l.notifDesc}</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{l.notifEmail}</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" value={s.notification_email || ''} onChange={e => setS({ ...s, notification_email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder={l.notifEmailPlaceholder} />
            </div>
            {s.notification_email && (
              <button onClick={sendTestEmail} disabled={testingSend}
                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50 whitespace-nowrap">
                {testingSend ? '...' : l.testEmail}
              </button>
            )}
          </div>
        </div>

        {!s.notification_email && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <Bell className="w-4 h-4" /> {l.notifNotSet}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex items-start gap-3 flex-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
            <button onClick={() => setS({ ...s, notify_on_booking: !s.notify_on_booking })}
              className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${s.notify_on_booking ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${s.notify_on_booking ? 'left-5' : 'left-1'}`} />
            </button>
            <div>
              <p className="text-sm font-medium text-gray-900">{l.notifOnBooking}</p>
              <p className="text-xs text-gray-500">{l.notifOnBookingDesc}</p>
            </div>
          </label>

          <label className="flex items-start gap-3 flex-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
            <button onClick={() => setS({ ...s, notify_on_cancel: !s.notify_on_cancel })}
              className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${s.notify_on_cancel ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${s.notify_on_cancel ? 'left-5' : 'left-1'}`} />
            </button>
            <div>
              <p className="text-sm font-medium text-gray-900">{l.notifOnCancel}</p>
              <p className="text-xs text-gray-500">{l.notifOnCancelDesc}</p>
            </div>
          </label>
        </div>

        {/* === AUTOMATICKÉ EMAILY KLIENTŮM === */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            {lang === 'en' ? 'Automatic emails to clients' : lang === 'sk' ? 'Automatické emaily klientom' : 'Automatické emaily klientům'}
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            {lang === 'en' ? 'Sent automatically based on booking events.' : lang === 'sk' ? 'OdosielanĂ© automaticky podÄľa udalostĂ­ rezervĂˇciĂ­.' : 'OdesĂ­lanĂ© automaticky podle udĂˇlostĂ­ rezervacĂ­.'}
          </p>

          <div className="space-y-3">
            {/* PĹ™ipomĂ­nka */}
            <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <button onClick={() => setS({ ...s, reminder_enabled: !s.reminder_enabled })}
                className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${s.reminder_enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${s.reminder_enabled ? 'left-5' : 'left-1'}`} />
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  đź“… {lang === 'en' ? 'Reminder before appointment' : lang === 'sk' ? 'Pripomienka pred nĂˇvĹˇtevou' : 'PĹ™ipomĂ­nka pĹ™ed nĂˇvĹˇtÄ›vou'}
                </p>
                <p className="text-xs text-gray-500">
                  {lang === 'en' ? 'Client receives a reminder email before their appointment.' : lang === 'sk' ? 'Klient dostane pripomienku emailom pred termĂ­nom.' : 'Klient dostane pĹ™ipomĂ­nku emailem pĹ™ed termĂ­nem.'}
                </p>
                {s.reminder_enabled && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {lang === 'en' ? 'Send' : lang === 'sk' ? 'Odoslať' : 'Odeslat'}
                    </span>
                    <select value={s.reminder_hours_before || 24}
                      onChange={e => setS({ ...s, reminder_hours_before: parseInt(e.target.value) })}
                      className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white">
                      <option value={3}>3h</option>
                      <option value={6}>6h</option>
                      <option value={12}>12h</option>
                      <option value={24}>24h</option>
                      <option value={48}>48h</option>
                    </select>
                    <span className="text-xs text-gray-500">
                      {lang === 'en' ? 'before' : lang === 'sk' ? 'pred termĂ­nom' : 'pĹ™ed termĂ­nem'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* PodÄ›kovĂˇnĂ­ po nĂˇvĹˇtÄ›vÄ› */}
            <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <button onClick={() => setS({ ...s, followup_enabled: !s.followup_enabled })}
                className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${s.followup_enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${s.followup_enabled ? 'left-5' : 'left-1'}`} />
              </button>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  đź™Ź {lang === 'en' ? 'Thank you after visit' : lang === 'sk' ? 'Poďakovanie po návšteve' : 'PodÄ›kovĂˇnĂ­ po nĂˇvĹˇtÄ›vÄ›'}
                </p>
                <p className="text-xs text-gray-500">
                  {lang === 'en' ? 'Client receives a thank you email after their visit.' : lang === 'sk' ? 'Klient dostane ďakovný email po návšteve.' : 'Klient dostane děkovný email po návštěvě.'}
                </p>
              </div>
            </div>

            {/* Žádost o recenzi */}
            <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <button onClick={() => setS({ ...s, review_request_enabled: !s.review_request_enabled })}
                className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${s.review_request_enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${s.review_request_enabled ? 'left-5' : 'left-1'}`} />
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  â­ {lang === 'en' ? 'Google review request' : lang === 'sk' ? 'Žiadosť o Google recenziu' : 'Žádost o Google recenzi'}
                </p>
                <p className="text-xs text-gray-500">
                  {lang === 'en' ? 'Client receives a review request after their visit.' : lang === 'sk' ? 'Klient dostane žiadosť o recenziu po návšteve.' : 'Klient dostane žádost o recenzi po návštěvě.'}
                </p>
                {s.review_request_enabled && (
                  <div className="mt-2">
                    <input type="url" value={s.google_review_url || ''}
                      onChange={e => setS({ ...s, google_review_url: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                      placeholder={lang === 'en' ? 'Google review link (optional)' : 'Odkaz na Google recenze (nepovinnĂ©)'} />
                    <p className="text-xs text-gray-400 mt-1">
                      {lang === 'en' ? 'Paste your Google Maps review URL' : lang === 'sk' ? 'Vložte odkaz na Google Maps recenzie' : 'Vložte odkaz na Google Maps recenze'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {s.notification_email && s.notify_on_booking && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <Check className="w-4 h-4" /> {lang === 'en' ? 'Notifications active' : lang === 'sk' ? 'NotifikĂˇcie aktĂ­vne' : 'Notifikace aktivní­'} &rarr; {s.notification_email}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

