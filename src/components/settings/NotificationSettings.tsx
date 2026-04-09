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

        {/* Automaticke emaily klientum */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            {lang === 'en' ? 'Automatic emails to clients' : lang === 'sk' ? 'Automatick\u00e9 emaily klientom' : 'Automatick\u00e9 emaily klient\u016fm'}
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            {lang === 'en' ? 'Sent automatically based on booking events.' : lang === 'sk' ? 'Odosielan\u00e9 automaticky pod\u013ea udalost\u00ed rezerv\u00e1ci\u00ed.' : 'Odes\u00edlan\u00e9 automaticky podle ud\u00e1lost\u00ed rezervac\u00ed.'}
          </p>

          <div className="space-y-3">
            {/* Pripominka */}
            <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <button onClick={() => setS({ ...s, reminder_enabled: !s.reminder_enabled })}
                className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${s.reminder_enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${s.reminder_enabled ? 'left-5' : 'left-1'}`} />
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {'\ud83d\udcc5'} {lang === 'en' ? 'Reminder before appointment' : lang === 'sk' ? 'Pripomienka pred n\u00e1v\u0161tevou' : 'P\u0159ipom\u00ednka p\u0159ed n\u00e1v\u0161t\u011bvou'}
                </p>
                <p className="text-xs text-gray-500">
                  {lang === 'en' ? 'Client receives a reminder email before their appointment.' : lang === 'sk' ? 'Klient dostane pripomienku emailom pred term\u00ednom.' : 'Klient dostane p\u0159ipom\u00ednku emailem p\u0159ed term\u00ednem.'}
                </p>
                {s.reminder_enabled && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {lang === 'en' ? 'Send' : lang === 'sk' ? 'Odosla\u0165' : 'Odeslat'}
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
                      {lang === 'en' ? 'before' : lang === 'sk' ? 'pred term\u00ednom' : 'p\u0159ed term\u00ednem'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Podekovani po navsteve */}
            <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <button onClick={() => setS({ ...s, followup_enabled: !s.followup_enabled })}
                className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${s.followup_enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${s.followup_enabled ? 'left-5' : 'left-1'}`} />
              </button>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {'\ud83d\ude4f'} {lang === 'en' ? 'Thank you after visit' : lang === 'sk' ? 'Po\u010fakovanie po n\u00e1v\u0161teve' : 'Pod\u011bkov\u00e1n\u00ed po n\u00e1v\u0161t\u011bv\u011b'}
                </p>
                <p className="text-xs text-gray-500">
                  {lang === 'en' ? 'Client receives a thank you email after their visit.' : lang === 'sk' ? 'Klient dostane \u010fakovn\u00fd email po n\u00e1v\u0161teve.' : 'Klient dostane d\u011bkovn\u00fd email po n\u00e1v\u0161t\u011bv\u011b.'}
                </p>
              </div>
            </div>

            {/* Zadost o recenzi */}
            <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <button onClick={() => setS({ ...s, review_request_enabled: !s.review_request_enabled })}
                className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 mt-0.5 ${s.review_request_enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${s.review_request_enabled ? 'left-5' : 'left-1'}`} />
              </button>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {'\u2b50'} {lang === 'en' ? 'Google review request' : lang === 'sk' ? '\u017diados\u0165 o Google recenziu' : '\u017d\u00e1dost o Google recenzi'}
                </p>
                <p className="text-xs text-gray-500">
                  {lang === 'en' ? 'Client receives a review request after their visit.' : lang === 'sk' ? 'Klient dostane \u017eiados\u0165 o recenziu po n\u00e1v\u0161teve.' : 'Klient dostane \u017e\u00e1dost o recenzi po n\u00e1v\u0161t\u011bv\u011b.'}
                </p>
                {s.review_request_enabled && (
                  <div className="mt-2">
                    <input type="url" value={s.google_review_url || ''}
                      onChange={e => setS({ ...s, google_review_url: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                      placeholder={lang === 'en' ? 'Google review link (optional)' : 'Odkaz na Google recenze (nepovinn\u00e9)'} />
                    <p className="text-xs text-gray-400 mt-1">
                      {lang === 'en' ? 'Paste your Google Maps review URL' : lang === 'sk' ? 'Vlo\u017ete odkaz na Google Maps recenzie' : 'Vlo\u017ete odkaz na Google Maps recenze'}
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
              <Check className="w-4 h-4" /> {lang === 'en' ? 'Notifications active' : lang === 'sk' ? 'Notifik\u00e1cie akt\u00edvne' : 'Notifikace aktivn\u00ed'} &rarr; {s.notification_email}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
