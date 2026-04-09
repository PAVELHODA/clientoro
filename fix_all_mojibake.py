import pathlib, re

# Exhaustive mojibake->correct mapping (UTF-8 bytes misread as CP1252/Latin-1 then re-encoded as UTF-8)
R = {
    '\u00c3\u00a1': '\u00e1',  # a acute
    '\u00c3\u00a9': '\u00e9',  # e acute
    '\u00c3\u00ad': '\u00ed',  # i acute
    '\u00c3\u00b3': '\u00f3',  # o acute
    '\u00c3\u00ba': '\u00fa',  # u acute
    '\u00c3\u00bd': '\u00fd',  # y acute
    '\u00c4\u008d': '\u010d',  # c caron
    '\u00c4\u008f': '\u010f',  # d caron
    '\u00c4\u009b': '\u011b',  # e caron
    '\u00c5\u0088': '\u0148',  # n caron
    '\u00c5\u0099': '\u0159',  # r caron
    '\u00c5\u00a1': '\u0161',  # s caron
    '\u00c5\u00a5': '\u0165',  # t caron
    '\u00c5\u00be': '\u017e',  # z caron
    '\u00c5\u00af': '\u016f',  # u ring
    '\u00c3\u0081': '\u00c1',  # A acute
    '\u00c3\u0089': '\u00c9',  # E acute
    '\u00c3\u008d': '\u00cd',  # I acute
    '\u00c3\u0093': '\u00d3',  # O acute
    '\u00c3\u009a': '\u00da',  # U acute
    '\u00c3\u009d': '\u00dd',  # Y acute
    '\u00c4\u008c': '\u010c',  # C caron
    '\u00c4\u008e': '\u010e',  # D caron
    '\u00c4\u009a': '\u011a',  # E caron
    '\u00c5\u0087': '\u0147',  # N caron
    '\u00c5\u0098': '\u0158',  # R caron
    '\u00c5\u00a0': '\u0160',  # S caron
    '\u00c5\u00a4': '\u0164',  # T caron
    '\u00c5\u00bd': '\u017d',  # Z caron
    '\u00c5\u00ae': '\u016e',  # U ring
    '\u00e2\u0080\u0094': '\u2014',  # em dash
    '\u00e2\u0080\u0093': '\u2013',  # en dash
    '\u00e2\u0080\u009e': '\u201e',  # lower quote
    '\u00e2\u0080\u009c': '\u201c',  # left double quote
    '\u00e2\u0080\u009d': '\u201d',  # right double quote  
    '\u00e2\u0080\u0098': '\u2018',  # left single quote
    '\u00e2\u0080\u0099': '\u2019',  # right single quote
    '\u00e2\u0080\u00a6': '\u2026',  # ellipsis
}

# Sort by length descending
replacements = sorted(R.items(), key=lambda x: len(x[0]), reverse=True)

files = []
for pattern in ['src/**/*.ts', 'src/**/*.tsx']:
    files.extend(pathlib.Path('.').glob(pattern))

total_fixed = 0
for f in files:
    try:
        text = f.read_text(encoding='utf-8')
    except:
        continue
    original = text
    for bad, good in replacements:
        text = text.replace(bad, good)
    if text != original:
        f.write_text(text, encoding='utf-8')
        total_fixed += 1
        print(f'FIXED: {f}')

print(f'\nTotal files fixed: {total_fixed}')
