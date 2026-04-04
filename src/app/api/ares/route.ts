export const dynamic = 'force-dynamic'

// PATH: src/app/api/ares/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const ico = request.nextUrl.searchParams.get('ico')
    if (!ico || !/^\d{8}$/.test(ico)) {
      return NextResponse.json({ error: 'IČO musí mít 8 číslic' }, { status: 400 })
    }

    // Testovací IČO pro vývoj
    const testIcos: Record<string, any> = {
      '00000000': { ico: '00000000', name: 'Test Freelancer s.r.o.', address: 'Testovací 123, Praha 1', dic: 'CZ00000000' },
      '11111111': { ico: '11111111', name: 'Demo Salon Krása', address: 'Květinová 456, Brno', dic: '' },
      '22222222': { ico: '22222222', name: 'Fyzio Centrum Test', address: 'Zdravotní 789, Ostrava', dic: 'CZ22222222' },
      '99999999': { ico: '99999999', name: 'Clientoro Dev Company', address: 'Vývojářská 1, Praha 1', dic: '' },
    }
    if (testIcos[ico]) {
      return NextResponse.json(testIcos[ico])
    }

    const res = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`, {
      headers: { 'Accept': 'application/json' },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'IČO nenalezeno v ARES' }, { status: 404 })
    }

    const data = await res.json()
    return NextResponse.json({
      ico: data.ico,
      name: data.obchodniJmeno || '',
      address: data.sidlo ? [data.sidlo.nazevUlice, data.sidlo.cisloDomovni, data.sidlo.nazevObce].filter(Boolean).join(' ') : '',
      dic: data.dic || '',
    })
  } catch (err) {
    console.error('ARES error:', err)
    return NextResponse.json({ error: 'Chyba při komunikaci s ARES' }, { status: 500 })
  }
}