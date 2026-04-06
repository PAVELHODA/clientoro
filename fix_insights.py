with open('src/app/api/ai/insights/route.ts','r',encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

start_idx = None
for i, line in enumerate(lines):
    if 'Fetch slot_duration' in line:
        start_idx = i
        break

end_idx = None
for i, line in enumerate(lines):
    if i < 130:
        continue
    if 'data: { emptyDays' in line or "data: { emptyDays" in line:
        for j in range(i, min(i+5, len(lines))):
            if '})' in lines[j]:
                end_idx = j + 1
                break
        break

if not start_idx or not end_idx:
    print(f'ERROR: start={start_idx} end={end_idx}')
    exit(1)

print(f'Replacing lines {start_idx+1} to {end_idx}')

new_block = """      // Fetch staff working hours for realistic capacity
      const { data: staffWH } = await supabaseAdmin
        .from('staff_working_hours')
        .select('weekday, start_time, end_time')
        .eq('organization_id', orgId)

      const slotDuration = org?.slot_duration || 30

      const emptyDays: { date: string; dayLabel: string; freeHours: number }[] = []

      for (let d = 0; d < 7; d++) {
        const checkDate = new Date()
        checkDate.setDate(checkDate.getDate() + d)
        const dateStr = checkDate.toISOString().split('T')[0]
        const dayOfWeek = checkDate.getDay()

        const workDay = workDays.find((wd: any) => wd.day === dayOfWeek)
        if (workDay && !workDay.enabled) continue

        const dayStaffHours = (staffWH || []).filter((wh: any) => wh.weekday === dayOfWeek)
        
        let totalAvailableMinutes = 0
        if (dayStaffHours.length > 0) {
          for (const wh of dayStaffHours) {
            const [sh, sm] = wh.start_time.split(':').map(Number)
            const [eh, em] = wh.end_time.split(':').map(Number)
            totalAvailableMinutes += (eh * 60 + em) - (sh * 60 + sm)
          }
        } else {
          const ws = org.work_start || 8
          const we = org.work_end || 18
          totalAvailableMinutes = (we - ws) * 60
        }

        const dayBookings = (upcomingBookings || []).filter((b: any) =>
          b.start_time?.startsWith(dateStr)
        )

        let bookedMinutes = 0
        for (const b of dayBookings) {
          if (b.start_time && b.end_time) {
            const start = new Date(b.start_time).getTime()
            const end = new Date(b.end_time).getTime()
            bookedMinutes += (end - start) / 60000
          } else {
            bookedMinutes += slotDuration
          }
        }

        const freeMinutes = Math.max(0, totalAvailableMinutes - bookedMinutes)
        const freeHours = Math.round(freeMinutes / 60)

        if (totalAvailableMinutes > 0 && freeMinutes >= totalAvailableMinutes * 0.7) {
          const dayNames = ['ned\\u011ble', 'pond\\u011bl\\u00ed', '\\u00fater\\u00fd', 'st\\u0159eda', '\\u010dtvrtek', 'p\\u00e1tek', 'sobota']
          const dd = dateStr.split('-').reverse().join('.')
          emptyDays.push({
            date: dateStr,
            dayLabel: dayNames[dayOfWeek].charAt(0).toUpperCase() + dayNames[dayOfWeek].slice(1) + ' ' + dd,
            freeHours,
          })
        }
      }

      if (emptyDays.length > 0) {
        insights.push({
          id: 'empty_slots_week',
          type: 'empty_slots',
          priority: emptyDays.length >= 3 ? 'high' : 'medium',
          icon: 'calendar',
          title: emptyDays.length + ' ' + (emptyDays.length === 1 ? 'den' : emptyDays.length < 5 ? 'dny' : 'dn\\u00ed') + ' s voln\\u00fdmi term\\u00edny',
          description: emptyDays.map(d => d.dayLabel + ' \\u2014 ' + d.freeHours + 'h voln\\u00fdch').join('|'),
          action: '/calendar',
          actionLabel: 'Zobrazit kalend\\u00e1\\u0159',
          data: { emptyDays, slotDuration },
        })
      }"""

content_new_lines = lines[:start_idx] + new_block.split('\n') + lines[end_idx:]
new_content = '\n'.join(content_new_lines)

new_content = new_content.replace(
    ".select('work_start, work_end, work_days')",
    ".select('work_start, work_end, work_days, slot_duration')"
)

# Remove old orgFull query if still there
old_orgfull = """      // Fetch slot_duration and services for realistic capacity
      const { data: orgFull } = await supabaseAdmin
        .from('organizations')
        .select('slot_duration')
        .eq('id', orgId)
        .single()"""
new_content = new_content.replace(old_orgfull, '')

with open('src/app/api/ai/insights/route.ts','w',encoding='utf-8') as f:
    f.write(new_content)

print('DONE')
vlines = new_content.split('\n')
for i, line in enumerate(vlines):
    if 'staff_working_hours' in line or 'slotDuration' in line or 'freeHours' in line or 'description:' in line and 'emptyDays' in line:
        print(f'{i+1}: {line.rstrip()}')
