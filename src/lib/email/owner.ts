// PATH: src/lib/email/owner.ts
import { sendEmail, emailTemplate, infoBox } from './core'

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
      footer: `
        <a href="https://clientoro.pro/dashboard" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">Otevřít kalendář</a>
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
        ${dashboardUrl ? `<div style="margin-top:16px;"><a href="${dashboardUrl}" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">Otevřít kalendář</a></div>` : ''}
      `,
    }),
  })
}

// ===== 8. DENNÍ SOUHRN PRO MAJITELE =====
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
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">${b.serviceName}${b.staffName ? ` · ${b.staffName}` : ''}</td>
    </tr>`
  ).join('')

  return sendEmail({
    to,
    subject: `Zítřejší program: ${bookingsCount} rezervací — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: `Program na ${tomorrowDate}`,
      body: `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 16px;text-align:center;">
          <p style="margin:0;color:#059669;font-size:32px;font-weight:700;">${bookingsCount}</p>
          <p style="margin:4px 0 0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Rezervací na zítra</p>
          <p style="margin:8px 0 0;color:#374151;font-size:13px;">${firstTime} – ${lastTime} · odhad tržeb: ${totalRevenue.toLocaleString('cs-CZ')} Kč</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin:0 0 16px;">
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Čas</th>
            <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Klient</th>
            <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Služba</th>
          </tr>
          ${bookingRows}
        </table>
      `,
      footer: `
        <a href="https://clientoro.pro/calendar" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">Otevřít kalendář</a>
        <p style="color:#9ca3af;font-size:11px;margin:8px 0 0;">Tento report můžete vypnout v Nastavení.</p>
      `,
    }),
  })
}

// ===== 9. TÝDENNÍ REPORT =====
export async function sendWeeklyReport({
  to, orgName, weekStart, weekEnd, totalBookings, completedBookings, cancelledBookings, noShowBookings, revenue, dashboardUrl,
}: {
  to: string; orgName: string; weekStart: string; weekEnd: string
  totalBookings: number; completedBookings: number; cancelledBookings: number; noShowBookings: number; revenue: number; dashboardUrl?: string
}) {
  return sendEmail({
    to,
    subject: `Týdenní přehled ${weekStart}–${weekEnd} — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: `Týden ${weekStart} – ${weekEnd}`,
      body: `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 16px;text-align:center;">
          <p style="margin:0;color:#059669;font-size:32px;font-weight:700;">${revenue.toLocaleString('cs-CZ')} Kč</p>
          <p style="margin:4px 0 0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Tržby za týden</p>
        </div>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:4px 0;color:#374151;font-size:13px;">📅 Celkem rezervací: <strong>${totalBookings}</strong></p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">✅ Dokončených: <strong>${completedBookings}</strong></p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">❌ Zrušených: <strong>${cancelledBookings}</strong></p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">🚫 No-show: <strong>${noShowBookings}</strong></p>
        </div>
        <div style="margin:20px 0;text-align:center;">
          <a href="${dashboardUrl || 'https://clientoro.pro/dashboard'}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:12px;font-size:14px;font-weight:600;">Zobrazit detaily</a>
        </div>
      `,
      footer: `<p style="color:#9ca3af;font-size:11px;margin:0;">Tento report můžete vypnout v Nastavení.</p>`,
    }),
  })
}

// ===== 25. MĚSÍČNÍ REPORT =====
export async function sendMonthlyReport({
  to, orgName, month, totalBookings, totalRevenue, newClients, repeatRate, topService, topStaff, dashboardUrl,
}: {
  to: string; orgName: string; month: string
  totalBookings: number; totalRevenue: number; newClients: number; repeatRate: number
  topService?: string; topStaff?: string; dashboardUrl?: string
}) {
  return sendEmail({
    to,
    subject: `Měsíční report ${month} — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: `Report za ${month}`,
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Přehled za <strong>${month}</strong> pro <strong style="color:#111827;">${orgName}</strong>.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
          <p style="margin:0;color:#059669;font-size:32px;font-weight:700;">${totalRevenue.toLocaleString('cs-CZ')} Kč</p>
          <p style="margin:4px 0 0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Celkové tržby</p>
        </div>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:4px 0;color:#374151;font-size:13px;">📅 Rezervací: <strong>${totalBookings}</strong></p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">👤 Nových klientů: <strong>${newClients}</strong></p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">🔄 Návratnost: <strong>${repeatRate}%</strong></p>
          ${topService ? `<p style="margin:4px 0;color:#374151;font-size:13px;">⭐ Top služba: <strong>${topService}</strong></p>` : ''}
          ${topStaff ? `<p style="margin:4px 0;color:#374151;font-size:13px;">🏆 Top specialista: <strong>${topStaff}</strong></p>` : ''}
        </div>
        <div style="margin:20px 0;text-align:center;">
          <a href="${dashboardUrl || 'https://www.clientoro.pro/dashboard'}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:12px;font-size:14px;font-weight:600;">Zobrazit detaily</a>
        </div>
      `,
      footer: `<p style="color:#9ca3af;font-size:11px;margin:0;">Tento report můžete vypnout v Nastavení.</p>`,
    }),
  })
}
