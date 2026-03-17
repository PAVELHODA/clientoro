// PATH: src/app/api/ares/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const ico = request.nextUrl.searchParams.get('ico')
    if (!ico || !/^\d{8}$/.test(ico)) {
      return NextResponse.json({ error: 'ICO musi mit 8 cislic' }, { status: 400 })
    }

    const res = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`, {
      headers: { 'Accept': 'application/json' },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'ICO nenalezeno v ARES' }, { status: 404 })
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
    return NextResponse.json({ error: 'Chyba pri komunikaci s ARES' }, { status: 500 })
  }
}