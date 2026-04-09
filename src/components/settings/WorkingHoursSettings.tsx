// PATH: src/components/settings/WorkingHoursSettings.tsx
'use client'

const DEFAULT_WORK_DAYS = [
  { day: 0, enabled: true, start: '06:00', end: '22:00' },
  { day: 1, enabled: true, start: '06:00', end: '22:00' },
  { day: 2, enabled: true, start: '06:00', end: '22:00' },
  { day: 3, enabled: true, start: '06:00', end: '22:00' },
  { day: 4, enabled: true, start: '06:00', end: '22:00' },
  { day: 5, enabled: false, start: '06:00', end: '22:00' },
  { day: 6, enabled: false, start: '06:00', end: '22:00' },
]

interface Props {
  s: { work_days: any[]; slot_duration: number; break_duration: number; break_start: string; [key: string]: any }
  setS: (s: any) => void
  lang: string
  l: Record<string, any>
}

export default function WorkingHoursSettings({ s, setS, lang, l }: Props) {
  const dayNames = lang === 'en' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : lang === 'sk' ? ['Po','Ut','St','Št','Pi','So','Ne'] : ['Po','Út','St','Čt','Pá','So','Ne']

  const hours: string[] = []
  for (let h = 5; h <= 23; h++) {
    hours.push(`${h.toString().padStart(2, '0')}:00`)
    hours.push(`${h.toString().padStart(2, '0')}:30`)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{l.workingHours}</h2>
      <p className="text-sm text-gray-500 mb-4">{lang === 'en' ? <>Schedule applies to every week. <strong>Each day can be disabled or set to custom hours.</strong> <em>Set up odd/even weeks and vacation periods — coming soon on Clientoro.pro.</em></> : lang === 'sk' ? <>Rozvrh platí pre každý týždeň. <strong>Každý deň možno vypnúť alebo nastaviť vlastné hodiny.</strong> <em>Nastaviť si lichý/sudý týždeň a obdobie voľna — už čoskoro na Clientoro.pro.</em></> : <>Rozvrh platí pro každý týden. <strong>Každý den lze vypnout nebo nastavit vlastní hodiny.</strong> <em>Nastavit si lichý/sudý týden a období volna — již brzy na Clientoro.pro.</em></>}</p>

      <div className="space-y-2 mb-4">
        {dayNames.map((dayName, i) => {
          const wd = (s.work_days || DEFAULT_WORK_DAYS)[i] || DEFAULT_WORK_DAYS[i]
          return (
            <div key={i} className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border transition-all ${wd.enabled ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200 bg-gray-50'}`}>
              <button
                onClick={() => {
                  const newDays = [...(s.work_days || DEFAULT_WORK_DAYS)]
                  newDays[i] = { ...newDays[i], enabled: !newDays[i].enabled }
                  setS({ ...s, work_days: newDays })
                }}
                className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${wd.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${wd.enabled ? 'left-5' : 'left-1'}`} />
              </button>
              <span className={`w-8 text-sm font-bold flex-shrink-0 ${wd.enabled ? 'text-gray-900' : 'text-gray-400'}`}>{dayName}</span>
              {wd.enabled ? (
                <div className="flex items-center gap-1 sm:gap-2 flex-1">
                  <select value={wd.start} onChange={e => {
                    const newDays = [...(s.work_days || DEFAULT_WORK_DAYS)]
                    newDays[i] = { ...newDays[i], start: e.target.value }
                    setS({ ...s, work_days: newDays })
                  }} className="px-1.5 sm:px-2 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm bg-white">
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-gray-400 text-xs">—</span>
                  <select value={wd.end} onChange={e => {
                    const newDays = [...(s.work_days || DEFAULT_WORK_DAYS)]
                    newDays[i] = { ...newDays[i], end: e.target.value }
                    setS({ ...s, work_days: newDays })
                  }} className="px-1.5 sm:px-2 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm bg-white">
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <div className="hidden sm:block flex-1 mx-2">
                    <div className="h-2 bg-gray-100 rounded-full relative">
                      <div className="h-2 bg-emerald-300 rounded-full absolute" style={{
                        left: `${((parseInt(wd.start) - 5) / 18) * 100}%`,
                        width: `${Math.max(((parseInt(wd.end) - parseInt(wd.start)) / 18) * 100, 5)}%`
                      }} />
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-400 italic">{lang === 'en' ? 'Closed' : lang === 'sk' ? 'Zatvorené' : 'Zavřeno'}</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
        <div className="flex-1 w-full sm:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">{l.slotDuration}</label>
          <select value={s.slot_duration} onChange={e => setS({ ...s, slot_duration: parseInt(e.target.value) })}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value={15}>15 {l.minutes}</option>
            <option value={30}>30 {l.minutes}</option>
            <option value={45}>45 {l.minutes}</option>
            <option value={60}>60 {l.minutes}</option>
          </select>
        </div>
        <div className="flex-1 w-full sm:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">{l.breakDuration}</label>
          <select value={s.break_duration} onChange={e => setS({ ...s, break_duration: parseInt(e.target.value) })}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value={0}>{l.noBreak}</option>
            <option value={15}>15 {l.minutes}</option>
            <option value={30}>30 {l.minutes}</option>
            <option value={45}>45 {l.minutes}</option>
            <option value={60}>60 {l.minutes}</option>
          </select>
        </div>
        {s.break_duration > 0 && (
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">{l.breakStart}</label>
            <select value={s.break_start} onChange={e => setS({ ...s, break_start: e.target.value })}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="11:00">11:00</option>
              <option value="11:30">11:30</option>
              <option value="12:00">12:00</option>
              <option value="12:30">12:30</option>
              <option value="13:00">13:00</option>
              <option value="13:30">13:30</option>
            </select>
          </div>
        )}
        <div className="flex-1 bg-amber-50 rounded-xl p-3 border border-amber-200">
          <p className="text-xs text-amber-700">💡 {lang === 'en' ? 'Odd/even week — coming soon' : lang === 'sk' ? 'Lichý/sudý týždeň — čoskoro' : 'Lichý/sudý týden — brzy'}</p>
        </div>
      </div>
    </div>
  )
}
