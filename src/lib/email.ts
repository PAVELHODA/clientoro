// PATH: src/lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ===== ŠABLONA =====
function emailTemplate({ title, body, footer, orgName, logoUrl, bookingId }: { title: string; body: string; footer?: string; orgName?: string; logoUrl?: string; bookingId?: string }) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:linear-gradient(135deg,#0a1628,#0c2d48,#0f6b7a);font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:24px 16px;">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0a1628 0%,#0c2d48 40%,#0e4d64 70%,#0f6b7a 100%);padding:28px 24px;border-radius:16px 16px 0 0;text-align:center;">
    ${logoUrl ? `<img src="${logoUrl}" alt="${orgName}" width="48" height="48" style="border-radius:12px;margin-bottom:12px;border:2px solid rgba(255,255,255,0.2);" />` : ''}
    <h1 style="color:white;margin:0;font-size:20px;font-weight:600;letter-spacing:0.03em;">${orgName || 'Rezervace'}</h1>
    <p style="color:rgba(255,255,255,0.5);margin:4px 0 0;font-size:11px;letter-spacing:0.1em;">ONLINE REZERVACE</p>
    ${bookingId ? `<p style="color:rgba(255,255,255,0.3);margin:8px 0 0;font-size:10px;letter-spacing:0.05em;">#${bookingId}</p>` : ''}
  </div>
  <!-- Body -->
  <div style="background:white;padding:28px 24px;border:1px solid #e5e7eb;border-top:none;">
    <h2 style="color:#111827;margin:0 0 16px;font-size:20px;font-weight:600;">${title}</h2>
    ${body}
  </div>
  <!-- Footer -->
  <div style="background:#f9fafb;padding:16px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;text-align:center;">
    ${footer || ''}
    <p style="color:#9ca3af;font-size:11px;margin:8px 0 0;letter-spacing:0.05em;">Powered by CLIENTORO · clientoro.pro</p>
  </div>
</div>
</body></html>`
}

function infoBox(items: { label: string; value: string }[], color: 'green' | 'blue' | 'red' = 'blue') {
  const colors = {
    green: { bg: '#f0fdf4', border: '#bbf7d0' },
    blue: { bg: '#eff6ff', border: '#bfdbfe' },
    red: { bg: '#fef2f2', border: '#fecaca' },
  }
  const c = colors[color]
  return `<div style="background:${c.bg};border:1px solid ${c.border};border-radius:12px;padding:16px;margin:16px 0;">
    ${items.map(i => `<p style="margin:4px 0;color:#374151;font-size:14px;"><strong style="color:#111827;">${i.label}:</strong> ${i.value}</p>`).join('')}
  </div>`
}

// ===== SEND =====
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY || !to) return { success: false, error: 'Missing API key or recipient' }
  try {
    const { data, error } = await resend.emails.send({
      from: 'Clientoro <noreply@clientoro.pro>',
      to,
      subject,
      html,
    })
    if (error) { console.error('[Email error]', error); return { success: false, error } }
    console.log('[Email sent]', to, subject)
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('[Email send error]', err)
    return { success: false, error: err }
  }
}

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
          const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
          const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(serviceName + ' — ' + orgName)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(address || '')}&details=${encodeURIComponent('Rezervace přes Clientoro')}`
          return `<div style="margin:12px 0;padding:12px 0;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:11px;margin:0 0 8px;font-weight:600;">PŘIDAT DO KALENDÁŘE</p>
            <a href="${gcalUrl}" target="_blank" style="display:inline-block;padding:8px 16px;background:#f3f4f6;color:#374151;text-decoration:none;border-radius:8px;font-size:12px;font-weight:500;margin-right:8px;">📅 Google Calendar</a>
          </div>`
        })() : ''}
        ${manageUrl ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb;">
          <a href="${manageUrl}" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#0c2d48,#0f6b7a);color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">Spravovat rezervaci</a>
          <p style="color:#9ca3af;font-size:11px;margin:8px 0 0;">Změnit nebo zrušit rezervaci</p>
        </div>` : ''}`,
    }),
  })
}

// ===== 2. NOTIFIKACE MAJITELI — nová rezervace =====
export async function sendOwnerNotification({
  to, customerName, customerPhone, customerEmail, serviceName, staffName, date, time, price, orgName,
}: {
  to: string; customerName: string; customerPhone: string; customerEmail?: string
  serviceName: string; staffName?: string; date: string; time: string; price?: number; orgName: string
}) {
  const items = [
    { label: 'Klient', value: customerName },
    { label: 'Telefon', value: customerPhone },
    ...(customerEmail ? [{ label: 'Email', value: customerEmail }] : []),
    { label: 'Služba', value: serviceName },
    { label: 'Datum', value: `${date} v ${time}` },
    ...(staffName ? [{ label: 'Specialista', value: staffName }] : []),
    ...(price ? [{ label: 'Cena', value: `${price} Kč` }] : []),
  ]

  return sendEmail({
    to,
    subject: `Nová rezervace — ${customerName} · ${serviceName}`,
    html: emailTemplate({
      orgName,
      title: 'Nová rezervace!',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Máte novou rezervaci v <strong>${orgName}</strong>.
        </p>
        ${infoBox(items, 'blue')}
      `,
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
          Pokud chcete nový termín, zarezervujte si prosím znovu.<br/>
        ${bookingUrl ? `<div style="margin-top:16px;"><a href="${bookingUrl}" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#0c2d48,#0f6b7a);color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">Rezervovat nový termín</a></div>` : ''}
          Provozovatel: <strong>${orgName}</strong>${orgPhone ? ` · ${orgPhone}` : ''}
        </p>
      `,
    }),
  })
}

// ===== 4. ZRUŠENÍ — notifikace majiteli =====
export async function sendOwnerCancellation({
  to, customerName, customerPhone, serviceName, date, time, orgName, dashboardUrl,
}: {
  to: string; customerName: string; customerPhone: string
  serviceName: string; date: string; time: string; orgName: string; dashboardUrl?: string
}) {
  const items = [
    { label: 'Klient', value: customerName },
    { label: 'Telefon', value: customerPhone },
    { label: 'Služba', value: serviceName },
    { label: 'Datum', value: `${date} v ${time}` },
  ]

  return sendEmail({
    to,
    subject: `Rezervace zrušena — ${customerName}`,
    html: emailTemplate({
      orgName,
      title: 'Rezervace zrušena ✕',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Klient zrušil rezervaci v <strong>${orgName}</strong>.
        </p>
        ${infoBox(items, 'red')}
        ${dashboardUrl ? `<div style="margin-top:16px;"><a href="${dashboardUrl}" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#0c2d48,#0f6b7a);color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">Otevřít kalendář</a></div>` : ''}
      `,
    }),
  })
}

// ===== 5. PŘIPOMÍNKA — klientovi den předem =====
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
      footer: `<p style="color:#6b7280;font-size:12px;margin:0;">Těšíme se na Vás! Pokud potřebujete změnit termín, kontaktujte nás.</p>`,
    }),
  })
}

// ===== 6. TESTOVACÍ EMAIL =====
export async function sendTestEmail({ to, orgName }: { to: string; orgName: string }) {
  return sendEmail({
    to,
    subject: `Testovací email — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: 'Notifikace fungují! ✓',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Toto je testovací email z <strong>${orgName}</strong>. Emailové notifikace jsou správně nastaveny.
        </p>
        ${infoBox([
          { label: 'Organizace', value: orgName },
          { label: 'Odesláno', value: new Date().toLocaleString('cs-CZ') },
        ], 'green')}
      `,
    }),
  })
}


// ===== WELCOME EMAIL PO REGISTRACI =====
export async function sendWelcomeEmail({
  to, orgName, bookingUrl, dashboardUrl,
}: {
  to: string; orgName: string; bookingUrl: string; dashboardUrl?: string
}) {
  return sendEmail({
    to,
    subject: `Vítejte v Clientoro — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: 'Vítejte v Clientoro!',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Váš účet <strong>${orgName}</strong> je připraven. Tady je vše co potřebujete pro začátek:
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;color:#111827;font-size:14px;font-weight:600;">Váš booking link:</p>
          <p style="margin:0;"><a href="${bookingUrl}" style="color:#0f6b7a;font-size:14px;font-weight:600;text-decoration:none;">${bookingUrl}</a></p>
          <p style="margin:8px 0 0;color:#6b7280;font-size:12px;">Sdílejte tento link klientům — mohou si rovnou rezervovat online.</p>
        </div>
        <div style="margin:16px 0;">
          <p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 8px;">Co udělat jako první:</p>
          <p style="color:#6b7280;font-size:13px;margin:4px 0;">1. Přidejte služby co nabízíte</p>
          <p style="color:#6b7280;font-size:13px;margin:4px 0;">2. Nastavte pracovní dobu</p>
          <p style="color:#6b7280;font-size:13px;margin:4px 0;">3. Sdílejte booking link klientům</p>
        </div>

      `,
      footer: `
        <a href="${dashboardUrl || 'https://clientoro.pro/dashboard'}" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#0c2d48,#0f6b7a);color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">Otevřít dashboard</a>
        <p style="color:#9ca3af;font-size:11px;margin:8px 0 0;">Máte 14 dní trial zdarma.</p>
      `,
    }),
  })
}
// ===== 7. FOLLOW-UP — den po návštěvě =====
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
          <a href="${bookingUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#0c2d48,#0f6b7a);color:white;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">Rezervovat znovu</a>
        </div>` : ''}
        <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;text-align:center;">
          Byli jste spokojeni? Budeme rádi za Vaše hodnocení.
        </p>
      `,
      footer: `<p style="color:#6b7280;font-size:12px;margin:0;">${orgName}${orgPhone ? ` · ${orgPhone}` : ''}</p>`,
    }),
  })
}

// ===== 8. DENNÍ SOUHRN PRO MAJITELE — co je zítra =====
export async function sendOwnerDailySummary({
  to, orgName, tomorrowDate, bookingsCount, firstTime, lastTime, totalRevenue, bookings,
}: {
  to: string; orgName: string; tomorrowDate: string
  bookingsCount: number; firstTime: string; lastTime: string; totalRevenue: number
  bookings: { time: string; customerName: string; serviceName: string; staffName?: string }[]
}) {
  const bookingRows = bookings.map(b =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#111827;font-size:13px;font-weight:600;">${b.time}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:13px;">${b.customerName}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">${b.serviceName}</td>
      ${b.staffName ? `<td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">${b.staffName}</td>` : ''}
    </tr>`
  ).join('')

  const hasStaff = bookings.some(b => b.staffName)

  return sendEmail({
    to,
    subject: `Zítřejší přehled: ${bookingsCount} rezervací — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: `Zítra: ${bookingsCount} rezervací`,
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Přehled rezervací na <strong>${tomorrowDate}</strong>.
        </p>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 4px;color:#111827;font-size:14px;"><strong>${bookingsCount}</strong> rezervací</p>
          <p style="margin:0 0 4px;color:#374151;font-size:13px;">První: <strong>${firstTime}</strong> · Poslední: <strong>${lastTime}</strong></p>
          <p style="margin:0;color:#374151;font-size:13px;">Očekávaný příjem: <strong>${totalRevenue.toLocaleString('cs-CZ')} Kč</strong></p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Čas</th>
            <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Klient</th>
            <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Služba</th>
            ${hasStaff ? `<th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Specialista</th>` : ''}
          </tr>
          ${bookingRows}
        </table>
      `,
      footer: `
        <a href="https://clientoro.pro/dashboard" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#0c2d48,#0f6b7a);color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">Otevřít dashboard</a>
      `,
    }),
  })
}

// ===== 9. TÝDENNÍ REPORT PRO MAJITELE =====
export async function sendWeeklyReport({
  to, orgName, weekStart, weekEnd, totalBookings, completedBookings, cancelledBookings, noShowBookings, revenue, dashboardUrl,
}: {
  to: string; orgName: string; weekStart: string; weekEnd: string
  totalBookings: number; completedBookings: number; cancelledBookings: number; noShowBookings: number
  revenue: number; dashboardUrl?: string
}) {
  const noShowRate = totalBookings > 0 ? Math.round((noShowBookings / totalBookings) * 100) : 0
  const cancelRate = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0

  return sendEmail({
    to,
    subject: `Týdenní report ${weekStart}–${weekEnd} — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: `Týdenní přehled`,
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Report za období <strong>${weekStart} – ${weekEnd}</strong>.
        </p>
        <div style="display:flex;gap:8px;margin:16px 0;flex-wrap:wrap;">
          <div style="flex:1;min-width:120px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;text-align:center;">
            <p style="margin:0;color:#059669;font-size:24px;font-weight:700;">${revenue.toLocaleString('cs-CZ')}</p>
            <p style="margin:4px 0 0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Tržby (Kč)</p>
          </div>
          <div style="flex:1;min-width:120px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;text-align:center;">
            <p style="margin:0;color:#2563eb;font-size:24px;font-weight:700;">${completedBookings}</p>
            <p style="margin:4px 0 0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Rezervací</p>
          </div>
        </div>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;color:#111827;font-size:14px;font-weight:600;">Detaily</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">Celkem rezervací: <strong>${totalBookings}</strong></p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">Dokončených: <strong>${completedBookings}</strong></p>
          <p style="margin:4px 0;color:${cancelledBookings > 0 ? '#dc2626' : '#374151'};font-size:13px;">Zrušených: <strong>${cancelledBookings}</strong> (${cancelRate}%)</p>
          <p style="margin:4px 0;color:${noShowBookings > 0 ? '#dc2626' : '#374151'};font-size:13px;">Nedorazilo: <strong>${noShowBookings}</strong> (${noShowRate}%)</p>
        </div>
        ${noShowRate > 15 ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:12px 16px;margin:16px 0;">
          <p style="margin:0;color:#dc2626;font-size:13px;font-weight:600;">⚠ Vysoký podíl nedorazivších (${noShowRate}%). Zvažte zavedení záloh nebo SMS připomínek.</p>
        </div>` : ''}
        ${cancelRate > 20 ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:12px 16px;margin:16px 0;">
          <p style="margin:0;color:#dc2626;font-size:13px;font-weight:600;">⚠ Vysoký podíl zrušených (${cancelRate}%). Zvažte potvrzovací SMS den předem.</p>
        </div>` : ''}
      `,
      footer: `
        <a href="${dashboardUrl || 'https://clientoro.pro/dashboard'}" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#0c2d48,#0f6b7a);color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">Otevřít dashboard</a>
        <p style="color:#9ca3af;font-size:11px;margin:8px 0 0;">Tento report můžete vypnout v Nastavení.</p>
      `,
    }),
  })
}

// ===== 10. SUPERADMIN CRON SOUHRN =====
export async function sendSuperadminCronSummary({
  to, timestamp, results,
}: {
  to: string; timestamp: string
  results: {
    reminders: { sent: number; skipped: number; errors: number; details: string[] }
    followups: { sent: number; skipped: number; errors: number; details: string[] }
    weeklyReports: { sent: number; skipped: number; errors: number; details: string[] }
  }
}) {
  const totalSent = results.reminders.sent + results.followups.sent + results.weeklyReports.sent
  const totalErrors = results.reminders.errors + results.followups.errors + results.weeklyReports.errors

  // Pokud nic nebylo odesláno a žádné chyby, nepošli email (šetříme)
  if (totalSent === 0 && totalErrors === 0) return { success: true, skipped: true }

  const detailsHtml = (label: string, data: typeof results.reminders) => {
    if (data.sent === 0 && data.errors === 0) return ''
    return `
      <div style="margin:8px 0;">
        <p style="margin:0;color:#111827;font-size:13px;font-weight:600;">${label}: ${data.sent} odesláno, ${data.skipped} přeskočeno${data.errors > 0 ? `, <span style="color:#dc2626;">${data.errors} chyb</span>` : ''}</p>
        ${data.details.length > 0 ? `<p style="margin:4px 0 0;color:#6b7280;font-size:12px;">${data.details.join(' · ')}</p>` : ''}
      </div>
    `
  }

  return sendEmail({
    to,
    subject: `[Clientoro Cron] ${totalSent} emailů odesláno${totalErrors > 0 ? ` · ${totalErrors} chyb` : ''}`,
    html: emailTemplate({
      orgName: 'Clientoro Superadmin',
      title: `Denní cron report`,
      body: `
        <p style="color:#6b7280;font-size:13px;margin:0 0 16px;">Spuštěno: ${timestamp}</p>
        <div style="background:${totalErrors > 0 ? '#fef2f2' : '#f0fdf4'};border:1px solid ${totalErrors > 0 ? '#fecaca' : '#bbf7d0'};border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0;color:#111827;font-size:16px;font-weight:700;">${totalSent} emailů odesláno</p>
          ${totalErrors > 0 ? `<p style="margin:4px 0 0;color:#dc2626;font-size:13px;font-weight:600;">${totalErrors} chyb!</p>` : ''}
        </div>
        ${detailsHtml('Připomínky', results.reminders)}
        ${detailsHtml('Follow-up', results.followups)}
        ${detailsHtml('Týdenní reporty', results.weeklyReports)}
      `,
    }),
  })
}


// ===== ADMIN NOTIFIKACE =====
export async function sendAdminNotification({ subject, body }: { subject: string; body: string }) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Clientoro <noreply@clientoro.pro>',
      to: 'clientoro.app@gmail.com',
      subject: '[Clientoro Admin] ' + subject,
      html: emailTemplate({
        title: subject,
        body: '<p>' + body.replace(/,\s/g, '</p><p>') + '</p>',
        orgName: 'Clientoro Admin',
      }),
    })
    console.log('[Admin notification sent]', subject)
  } catch (err) {
    console.error('[Admin notification failed]', err)
  }
}