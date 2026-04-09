// PATH: src/lib/email/booking.ts
import { sendEmail, emailTemplate, infoBox } from './core'

// ===== 1. POTVRZENÍ REZERVACE — klientovi =====
export async function sendBookingConfirmation({
  to, customerName, serviceName, staffName, date, time, price, orgName, orgPhone, manageUrl, logoUrl, bookingId, startAt, duration, address,
}: {
  to: string; customerName: string; serviceName: string; staffName?: string
  date: string; time: string; price?: number; orgName: string; orgPhone?: string; manageUrl?: string; logoUrl?: string; bookingId?: string; startAt?: string; duration?: number; address?: string
}) {
  const items = [
    { label: 'Služba', value: serviceName },
    { label: 'Datum', value: `${date} v ${time}` },
    ...(staffName ? [{ label: 'Specialista', value: staffName }] : []),
    ...(price ? [{ label: 'Cena', value: `${price} Kč` }] : []),
  ]

  return sendEmail({
    to,
    subject: `Potvrzení rezervace — ${orgName}`,
    html: emailTemplate({
      orgName, logoUrl, bookingId,
      title: 'Vaše rezervace je potvrzena ✓',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Dobrý den <strong>${customerName}</strong>, vaše rezervace byla úspěšně vytvořena.
        </p>
        ${infoBox(items, 'green')}
        <p style="color:#6b7280;font-size:13px;margin:16px 0 0;">
          Provozovatel: <strong>${orgName}</strong>${orgPhone ? ` · ${orgPhone}` : ''}
        </p>
      `,
      footer: `<p style="color:#6b7280;font-size:12px;margin:0 0 12px;">Těšíme se na Vás!</p>
        ${startAt ? (() => {
          const start = new Date(startAt)
          const end = new Date(start.getTime() + (duration || 60) * 60000)
          const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
          const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(serviceName + ' — ' + orgName)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(address || '')}&details=${encodeURIComponent('Rezervace přes Clientoro')}`
          return `<div style="margin:12px 0;padding:12px 0;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:11px;margin:0 0 8px;font-weight:600;">PŘIDAT DO KALENDÁŘE</p>
            <a href="${gcalUrl}" target="_blank" style="display:inline-block;padding:8px 16px;background:#f3f4f6;color:#374151;text-decoration:none;border-radius:8px;font-size:12px;font-weight:500;margin-right:8px;">📅 Google Calendar</a>
          </div>`
        })() : ''}
        ${manageUrl ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb;">
        <a href="${manageUrl}" style="display:inline-block;padding:10px 24px;background-color:#0e3a5c;color:#ffffff;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">Spravovat rezervaci</a>
          <p style="color:#9ca3af;font-size:11px;margin:8px 0 0;">Změnit nebo zrušit rezervaci</p>
        </div>` : ''}`,
    }),
  })
}

// ===== 3. ZRUŠENÍ REZERVACE — klientovi =====
export async function sendBookingCancellation({
  to, customerName, serviceName, date, time, orgName, orgPhone, bookingUrl,
}: {
  to: string; customerName: string; serviceName: string
  date: string; time: string; orgName: string; orgPhone?: string; bookingUrl?: string
}) {
  const items = [
    { label: 'Služba', value: serviceName },
    { label: 'Datum', value: `${date} v ${time}` },
  ]

  return sendEmail({
    to,
    subject: `Rezervace zrušena — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: 'Rezervace byla zrušena',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Dobrý den <strong>${customerName}</strong>, vaše rezervace byla zrušena.
        </p>
        ${infoBox(items, 'red')}
        <p style="color:#6b7280;font-size:13px;margin:16px 0 0;">
          Provozovatel: <strong>${orgName}</strong>${orgPhone ? ` · ${orgPhone}` : ''}
        </p>
        ${bookingUrl ? `
        <div style="margin:20px 0;text-align:center;">
          <p style="color:#6b7280;font-size:13px;margin:0 0 12px;">Chcete nový termín?</p>
          <a href="${bookingUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:12px;font-size:14px;font-weight:600;">Rezervovat nový termín</a>
        </div>` : ''}
      `,
    }),
  })
}

// ===== 5. PŘIPOMÍNKA — klientovi =====
export async function sendBookingReminder({
  to, customerName, serviceName, staffName, date, time, orgName, orgPhone, orgAddress,
}: {
  to: string; customerName: string; serviceName: string; staffName?: string
  date: string; time: string; orgName: string; orgPhone?: string; orgAddress?: string
}) {
  const items = [
    { label: 'Služba', value: serviceName },
    { label: 'Datum', value: `${date} v ${time}` },
    ...(staffName ? [{ label: 'Specialista', value: staffName }] : []),
    ...(orgAddress ? [{ label: 'Adresa', value: orgAddress }] : []),
  ]

  return sendEmail({
    to,
    subject: `Připomínka: zítra ${serviceName} — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: 'Připomínka na zítřek 📅',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Dobrý den <strong>${customerName}</strong>, připomínáme Vám zítřejší rezervaci.
        </p>
        ${infoBox(items, 'blue')}
        <p style="color:#6b7280;font-size:13px;margin:16px 0 0;">
          ${orgName}${orgPhone ? ` · ${orgPhone}` : ''}
        </p>
      `,
      footer: `
        <p style="color:#6b7280;font-size:12px;margin:0 0 12px;">Těšíme se na Vás!</p>
        <div style="margin:8px 0;padding:8px 0;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">Nemůžete dorazit? Kontaktujte nás prosím co nejdříve${orgPhone ? ` na <strong>${orgPhone}</strong>` : ''}.</p>
        </div>
      `,
    }),
  })
}

// ===== 12. PŘESUNUTÍ REZERVACE =====
export async function sendBookingRescheduled({
  to, customerName, serviceName, staffName, oldDate, oldTime, newDate, newTime, orgName, orgPhone, bookingUrl, logoUrl, bookingId,
}: {
  to: string; customerName: string; serviceName: string; staffName?: string
  oldDate: string; oldTime: string; newDate: string; newTime: string
  orgName: string; orgPhone?: string; bookingUrl?: string; logoUrl?: string; bookingId?: string
}) {
  return sendEmail({
    to,
    subject: `Změna termínu — ${orgName}`,
    html: emailTemplate({
      orgName, logoUrl, bookingId,
      title: 'Termín byl změněn',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Dobrý den <strong>${customerName}</strong>, vaše rezervace byla přesunuta na nový termín.
        </p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 16px;margin:16px 0;">
          <p style="margin:0;color:#dc2626;font-size:13px;"><strong>Původní termín:</strong> ${oldDate} v ${oldTime} <span style="color:#9ca3af;">— zrušen</span></p>
        </div>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:0 0 16px;">
          <p style="margin:0 0 4px;color:#059669;font-size:14px;font-weight:700;">✓ Nový termín</p>
          <p style="margin:4px 0;color:#374151;font-size:14px;"><strong>Služba:</strong> ${serviceName}</p>
          <p style="margin:4px 0;color:#374151;font-size:14px;"><strong>Datum:</strong> ${newDate} v ${newTime}</p>
          ${staffName ? `<p style="margin:4px 0;color:#374151;font-size:14px;"><strong>Specialista:</strong> ${staffName}</p>` : ''}
        </div>
        <p style="color:#6b7280;font-size:13px;margin:16px 0 0;">
          ${orgName}${orgPhone ? ` · ${orgPhone}` : ''}
        </p>
        ${bookingUrl ? `<div style="margin:20px 0;text-align:center;">
          <a href="${bookingUrl}" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">Spravovat rezervaci</a>
        </div>` : ''}
      `,
      footer: `<p style="color:#6b7280;font-size:12px;margin:0;">Těšíme se na Vás!</p>`,
    }),
  })
}

// ===== 7. FOLLOW-UP — poděkování po návštěvě =====
export async function sendBookingFollowup({
  to, customerName, serviceName, staffName, orgName, orgPhone, bookingUrl,
}: {
  to: string; customerName: string; serviceName: string; staffName?: string
  orgName: string; orgPhone?: string; bookingUrl?: string
}) {
  return sendEmail({
    to,
    subject: `Děkujeme za návštěvu — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: 'Děkujeme za návštěvu!',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Dobrý den <strong>${customerName}</strong>, děkujeme že jste nás navštívili${staffName ? ` u specialisty <strong>${staffName}</strong>` : ''}.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 4px;color:#111827;font-size:14px;font-weight:600;">Služba: ${serviceName}</p>
          <p style="margin:0;color:#6b7280;font-size:13px;">Doufáme, že jste byli spokojeni.</p>
        </div>
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:16px 0;">
          Chcete si zarezervovat další termín? Rádi Vás uvidíme znovu.
        </p>
        ${bookingUrl ? `<div style="margin:20px 0;text-align:center;">
          <a href="${bookingUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">Rezervovat znovu</a>
        </div>` : ''}
        <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:14px 16px;margin:16px 0;text-align:center;">
          <p style="color:#92400e;font-size:13px;margin:0;">⭐ Byli jste spokojeni? Budeme rádi za <strong>Vaše hodnocení na Google</strong>.</p>
        </div>
      `,
      footer: `<p style="color:#6b7280;font-size:12px;margin:0;">${orgName}${orgPhone ? ` · ${orgPhone}` : ''}</p>`,
    }),
  })
}
