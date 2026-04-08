# fix-encoding.py v3 — presne Unicode sekvence z diagnostiky
import os

# Presne multi-char patterny z diagnostiky U+xxxx
R = {
    # ř = Ĺ™
    '\u0139\u2122': '\u0159',
    # á = Ăˇ  
    '\u0102\u02C7': '\u00E1',
    # í = Ă\u00AD
    '\u0102\u00AD': '\u00ED',
    # é = Ă©
    '\u0102\u00A9': '\u00E9',
    # ý = Ă˝
    '\u0102\u02DD': '\u00FD',
    # ú = Ăş
    '\u0102\u015F': '\u00FA',
    # ů = Ĺů — Ĺ + Ż
    '\u0139\u017B': '\u016F',
    # š = Ĺˇ
    '\u0139\u02C7': '\u0161',
    # ž = Ĺľ
    '\u0139\u013E': '\u017E',
    # č (uz spravne v nekterych, ale overime)
    # ň = Ĺˆ  
    '\u0139\u0088': '\u0148',
    # ť = Ĺť
    '\u0139\u0165': '\u0165',
    # Č = ÄŚ
    '\u00C4\u015A': '\u010C',
    # ó = Ă³ (pokud je triple)
    '\u0102\u00B3': '\u00F3',
    # Ž = Ĺ˝
    '\u0139\u02DD': '\u017D',
    # ł (fake) — Ă + ł = ó  
    '\u0102\u0142': '\u00F3',
    # — (em dash) = â€"
    '\u00E2\u20AC\u201D': '\u2014',
    # – (en dash) = â€"
    '\u00E2\u20AC\u201C': '\u2013',
}

FILES = [
    r'src\components\SubscriptionSettings.tsx',
    r'src\app\api\auth\me\route.ts',
    r'src\app\api\bookings\[id]\route.ts',
    r'src\app\api\clients\[id]\route.ts',
    r'src\app\api\clients\route.ts',
    r'src\app\api\public\booking\manage\route.ts',
    r'src\app\api\public\booking\route.ts',
    r'src\app\api\services\[id]\route.ts',
    r'src\app\api\services\route.ts',
    r'src\app\api\settings\delete-account\route.ts',
    r'src\app\api\staff\[id]\route.ts',
    r'src\app\api\staff\route.ts',
    r'src\app\api\stripe\webhook\route.ts',
    r'src\lib\publicI18n.ts',
]

# SKIP settings/page.tsx - ten je CISTY UTF-8

fixed = 0
for fp in FILES:
    if not os.path.exists(fp):
        print(f'  SKIP: {fp}')
        continue
    with open(fp, 'r', encoding='utf-8') as f:
        text = f.read()
    original = text
    
    # Nahrad vsechny zname patterny
    for bad, good in R.items():
        text = text.replace(bad, good)
    
    # Taky odstran dvojity BOM
    text = text.replace('\uFEFF\uFEFF', '\uFEFF')
    
    if text != original:
        with open(fp, 'w', encoding='utf-8', newline='') as f:
            f.write(text)
        print(f'  FIXED: {fp}')
        fixed += 1
    else:
        print(f'  OK: {fp}')

print(f'\nDone! Fixed {fixed}/{len(FILES)} files.')
