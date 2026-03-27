// fix-final-position.js
const fs = require('fs')

const files = [
  'src/app/(auth)/login/page.tsx',
  'src/app/(auth)/register/page.tsx'
]

files.forEach(f => {
  let lines = fs.readFileSync(f, 'utf8').split('\n')
  
  // Najdi a smaž wave blok
  let waveStart = -1, waveEnd = -1
  let waveLines = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Vlnky + zlatí lidé')) waveStart = i
    if (waveStart > -1 && waveEnd === -1) {
      waveLines.push(lines[i])
      if (lines[i].trim() === '</div>' && lines[i-1]?.trim()?.includes('</svg>')) {
        waveEnd = i
      }
    }
  }
  
  if (waveStart > -1 && waveEnd > -1) {
    // Smaž wave blok
    lines.splice(waveStart, waveEnd - waveStart + 1)
    
    // Najdi zavírací </div> hero sekce — je to </div> před <div className="flex-1
    let insertAt = -1
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('flex-1 flex items-center')) {
        // Řádek před tímto je </div> — to je konec levé hero sekce
        insertAt = i - 1
        break
      }
    }
    
    // Ale to je špatně — musíme vložit DOVNITŘ hero sekce, před její zavírací </div>
    // Hledáme </div> na řádku insertAt
    if (insertAt > -1) {
      // Vložíme wave blok PŘED tento </div>
      lines.splice(insertAt, 0, ...waveLines)
    }
  }
  
  fs.writeFileSync(f, lines.join('\n'), 'utf8')
  
  // Ověř pozici
  const result = fs.readFileSync(f, 'utf8')
  const waveIdx = result.split('\n').findIndex(l => l.includes('pointer-events-none'))
  const flexIdx = result.split('\n').findIndex(l => l.includes('flex-1 flex items-center'))
  console.log(`✅ ${f} — wave at line ${waveIdx + 1}, form at line ${flexIdx + 1}`)
})

console.log('🎯 del fix-final-position.js → npm run build')
