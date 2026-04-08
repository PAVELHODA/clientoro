import pathlib

# FIX: Settings page - null-safe break_duration loading
sp = pathlib.Path('src/app/(dashboard)/settings/page.tsx')
sc = sp.read_text(encoding='utf-8')

# Fix the setS line to handle null break values from API
old_load = "if (d && !d.error) setS({ ...EMPTY, ...d, work_days: d.work_days || DEFAULT_WORK_DAYS })"
new_load = "if (d && !d.error) setS({ ...EMPTY, ...d, work_days: d.work_days || DEFAULT_WORK_DAYS, break_duration: d.break_duration ?? 0, break_start: d.break_start || '12:00' })"
sc = sc.replace(old_load, new_load, 1)

sp.write_text(sc, encoding='utf-8')
print('OK: settings/page.tsx - null-safe break loading')


# FIX: AI page - add fallback when emptyDays not in data
# The issue is the ternary works but description still shows pipe format
# Let's check if the data.emptyDays is actually being sent
aip = pathlib.Path('src/app/(dashboard)/ai/page.tsx')
apc = aip.read_text(encoding='utf-8')

# The bullet list code is correct (lines 163-174)
# But we need a SECOND fallback: parse description pipe format into bullets
old_bullet = "insight.type === 'empty_slots' && insight.data?.emptyDays ? ("
new_bullet = "insight.type === 'empty_slots' && (insight.data?.emptyDays || insight.description?.includes('|')) ? ("

apc = apc.replace(old_bullet, new_bullet, 1)

# Also need to handle when emptyDays doesn't exist but description has pipes
old_map = "insight.data.emptyDays.map((d: any, idx: number) => ("
new_map = "(insight.data?.emptyDays || insight.description.split('|').map((s: string) => ({ dayLabel: s.split(' \\u2014 ')[0]?.trim(), freeHours: s.split(' \\u2014 ')[1]?.replace(/h.*/, '')?.trim() }))).map((d: any, idx: number) => ("

apc = apc.replace(old_map, new_map, 1)

aip.write_text(apc, encoding='utf-8')
print('OK: ai/page.tsx - fallback pipe parsing for bullet list')

print()
print('Now run: npm run build')
