import pathlib

# ============================================================
# FIX 1: SETTINGS API - add break_duration, break_start to allowedFields
# ============================================================
route = pathlib.Path('src/app/api/settings/route.ts')
rc = route.read_text(encoding='utf-8')

# Find 'work_days', and add break fields after it
old_wd = "'work_days',"
new_wd = "'work_days',\n      'break_duration', 'break_start',"
rc = rc.replace(old_wd, new_wd, 1)

route.write_text(rc, encoding='utf-8')
print('[1/4] OK: api/settings/route.ts - break fields in allowedFields')


# ============================================================
# FIX 2: SETTINGS PAGE - add break dropdowns + state
# ============================================================
sp = pathlib.Path('src/app/(dashboard)/settings/page.tsx')
sc = sp.read_text(encoding='utf-8')

# 2a. Type - add break fields
sc = sc.replace(
    'slot_duration: number; booking_link: string; timezone: string',
    'slot_duration: number; break_duration: number; break_start: string; booking_link: string; timezone: string',
    1
)

# 2b. Empty state defaults
sc = sc.replace(
    "booking_link: '', timezone: 'Europe/Prague',",
    "booking_link: '', timezone: 'Europe/Prague',\n  break_duration: 30, break_start: '12:00',",
    1
)

# 2c. Labels - insert before slotDuration label
marker = "slotDuration: lang === 'en'"
idx = sc.find(marker)
if idx > 0:
    line_start = sc.rfind('\n', 0, idx) + 1
    labels = (
        "    breakDuration: lang === 'en' ? 'Break duration' : lang === 'sk' ? 'D\u013a\u017eka prest\u00e1vky' : 'D\u00e9lka pauzy',\n"
        "    breakStart: lang === 'en' ? 'Break start' : lang === 'sk' ? 'Za\u010diatok prest\u00e1vky' : 'Za\u010d\u00e1tek pauzy',\n"
        "    noBreak: lang === 'en' ? 'No break' : lang === 'sk' ? '\u017diadna' : '\u017d\u00e1dn\u00e1',\n"
    )
    sc = sc[:line_start] + labels + sc[line_start:]
    print('  - break labels added')

# 2d. Add break dropdowns - find amber box and insert before it
amber_marker = '<div className="flex-1 bg-amber-50 rounded-xl p-3 border border-amber-200">'
amber_idx = sc.find(amber_marker)
if amber_idx > 0:
    # Find the line start
    line_start = sc.rfind('\n', 0, amber_idx) + 1
    indent = '            '
    break_html = (
        indent + '<div className="flex-1 w-full sm:w-auto">\n'
        + indent + '  <label className="block text-sm font-medium text-gray-700 mb-1">{l.breakDuration}</label>\n'
        + indent + '  <select value={s.break_duration} onChange={e => setS({ ...s, break_duration: parseInt(e.target.value) })}\n'
        + indent + '    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">\n'
        + indent + '    <option value={0}>{l.noBreak}</option>\n'
        + indent + '    <option value={15}>15 {l.minutes}</option>\n'
        + indent + '    <option value={30}>30 {l.minutes}</option>\n'
        + indent + '    <option value={45}>45 {l.minutes}</option>\n'
        + indent + '    <option value={60}>60 {l.minutes}</option>\n'
        + indent + '  </select>\n'
        + indent + '</div>\n'
        + indent + '{s.break_duration > 0 && (\n'
        + indent + '  <div className="flex-1 w-full sm:w-auto">\n'
        + indent + '    <label className="block text-sm font-medium text-gray-700 mb-1">{l.breakStart}</label>\n'
        + indent + '    <select value={s.break_start} onChange={e => setS({ ...s, break_start: e.target.value })}\n'
        + indent + '      className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">\n'
        + indent + '      <option value="11:00">11:00</option>\n'
        + indent + '      <option value="11:30">11:30</option>\n'
        + indent + '      <option value="12:00">12:00</option>\n'
        + indent + '      <option value="12:30">12:30</option>\n'
        + indent + '      <option value="13:00">13:00</option>\n'
        + indent + '      <option value="13:30">13:30</option>\n'
        + indent + '    </select>\n'
        + indent + '  </div>\n'
        + indent + ')}\n'
    )
    sc = sc[:line_start] + break_html + sc[line_start:]
    print('  - break dropdowns added')

sp.write_text(sc, encoding='utf-8')
print('[2/4] OK: settings/page.tsx - break dropdowns added')


# ============================================================
# FIX 3: AI INSIGHTS ROUTE - subtract org break from capacity
# ============================================================
ai = pathlib.Path('src/app/api/ai/insights/route.ts')
ac = ai.read_text(encoding='utf-8')

# 3a. Add break fields to org SELECT
ac = ac.replace(
    "'work_start, work_end, work_days, slot_duration'",
    "'work_start, work_end, work_days, slot_duration, break_duration, break_start'",
    1
)

# 3b. Subtract break from capacity - replace the 3-line calc
old_calc = "            totalAvailableMinutes += (eh * 60 + em) - (sh * 60 + sm)"
new_calc = """            let staffMinutes = (eh * 60 + em) - (sh * 60 + sm)
            // Subtract org-level break
            const breakMins = org?.break_duration || 0
            if (breakMins > 0) {
              staffMinutes = Math.max(0, staffMinutes - breakMins)
            }
            totalAvailableMinutes += staffMinutes"""
ac = ac.replace(old_calc, new_calc, 1)

ai.write_text(ac, encoding='utf-8')
print('[3/4] OK: ai/insights/route.ts - break subtracted from capacity')


# ============================================================
# FIX 4: AI PAGE - empty_slots days as bullet list
# ============================================================
aip = pathlib.Path('src/app/(dashboard)/ai/page.tsx')
apc = aip.read_text(encoding='utf-8')

old_desc = '{insight.description}</p>'
if old_desc in apc:
    tag_start = apc.rfind('<p', 0, apc.find(old_desc))
    tag_end = apc.find(old_desc) + len(old_desc)
    full_old = apc[tag_start:tag_end]

    new_desc = (
        "{insight.type === 'empty_slots' && insight.data?.emptyDays ? (\n"
        '                      <ul className="text-sm text-gray-600 leading-relaxed mt-1 space-y-1">\n'
        "                        {insight.data.emptyDays.map((d: any, idx: number) => (\n"
        '                          <li key={idx} className="flex items-center gap-2">\n'
        '                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />\n'
        '                            <span><span className="font-medium">{d.dayLabel}</span> \u2014 {d.freeHours}h</span>\n'
        "                          </li>\n"
        "                        ))}\n"
        "                      </ul>\n"
        "                    ) : (\n"
        "                      " + full_old + "\n"
        "                    )}"
    )

    apc = apc.replace(full_old, new_desc, 1)
    aip.write_text(apc, encoding='utf-8')
    print('[4/4] OK: ai/page.tsx - empty_slots as bullet list')
else:
    print('[4/4] SKIP: description tag not found')

print()
print('=== ALL 4 FIXES DONE ===')
print('Next: npm run build')
