// PATH: src/lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ===== ŠABLONA — table-based pro maximální kompatibilitu =====
function emailTemplate({ title, body, footer, orgName, logoUrl, bookingId }: { title: string; body: string; footer?: string; orgName?: string; logoUrl?: string; bookingId?: string }) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0e3a5c;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0e3a5c;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">
          <!-- HEADER -->
          <tr>
            <td align="center" style="background-color:#0e3a5c;padding:28px 24px;border-radius:16px 16px 0 0;">
              ${logoUrl ? `<img src="${logoUrl}" alt="${orgName || ''}" width="48" height="48" style="border-radius:12px;margin-bottom:12px;border:2px solid rgba(255,255,255,0.2);display:block;" />` : ''}
              <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:600;letter-spacing:0.03em;">${orgName || 'Rezervace'}</h1>
              <p style="color:rgba(255,255,255,0.5);margin:4px 0 0;font-size:11px;letter-spacing:0.1em;">ONLINE REZERVACE</p>
              ${bookingId ? `<p style="color:rgba(255,255,255,0.3);margin:8px 0 0;font-size:10px;letter-spacing:0.05em;">#${bookingId}</p>` : ''}
            </td>
          </tr>
          <!-- TRANSITION -->
          <tr>
            <td style="height:4px;background-color:#2ba0b0;font-size:1px;line-height:1px;">&nbsp;</td>
          </tr>
          <!-- BODY -->
          <tr>
            <td style="background-color:#ffffff;padding:28px 24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <h2 style="color:#111827;margin:0 0 16px 0;font-size:20px;font-weight:600;">${title}</h2>
              ${body}
            </td>
          </tr>
          <!-- FOOTER -->
          <tr>
            <td style="background-color:#f9fafb;padding:16px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;text-align:center;">
              ${footer || ''}
              <p style="color:#9ca3af;font-size:11px;margin:8px 0 0;letter-spacing:0.05em;">Powered by CLIENTORO &middot; clientoro.pro</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function infoBox(items: { label: string; value: string }[], color: 'green' | 'blue' | 'red' = 'blue') {
  const colors = {
    green: { bg: '#f0fdf4', border: '#bbf7d0' },
    blue: { bg: '#eff6ff', border: '#bfdbfe' },
    red: { bg: '#fef2f2', border: '#fecaca' },
  }
  const c = colors[color]
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
    <tr>
      <td style="background-color:${c.bg};border:1px solid ${c.border};border-radius:12px;padding:16px;">
        ${items.map(i => `<p style="margin:4px 0;color:#374151;font-size:14px;line-height:1.5;"><strong style="color:#111827;">${i.label}:</strong> ${i.value}</p>`).join('')}
      </td>
    </tr>
  </table>`
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
          const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
          const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(serviceName + ' — ' + orgName)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(address || '')}&details=${encodeURIComponent('Rezervace přes Clientoro')}`
          return `<div style="margin:12px 0;padding:12px 0;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:11px;margin:0 0 8px;font-weight:600;">PŘIDAT DO KALENDÁŘE</p>
            <a href="${gcalUrl}" target="_blank" style="display:inline-block;padding:8px 16px;background:#f3f4f6;color:#374151;text-decoration:none;border-radius:8px;font-size:12px;font-weight:500;margin-right:8px;">📅 Google Calendar</a>
          </div>`
        })() : ''}
        ${manageUrl ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb;">
          <a href="${manageUrl}" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">Spravovat rezervaci</a>
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
      footer: `
        <a href="https://clientoro.pro/dashboard" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">Otevřít kalendář</a>
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
      footer: `
        <p style="color:#6b7280;font-size:12px;margin:0 0 12px;">Těšíme se na Vás!</p>
        <div style="margin:8px 0;padding:8px 0;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">Nemůžete dorazit? Kontaktujte nás prosím co nejdříve${orgPhone ? ` na <strong>${orgPhone}</strong>` : ''}.</p>
        </div>
      `,
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
function getWelcomeSteps(mode: string): string {
  const s = (n: number, t: string) => `<tr><td style="padding:6px 0;color:#374151;font-size:13px;"><span style="display:inline-block;width:24px;height:24px;background:#10b981;color:white;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;margin-right:8px;">${n}</span> ${t}</td></tr>`;
  const r: string[] = [];
  r.push(s(1, "Zkontrolujte sluzby a cenik"));
  if (mode === "team" || mode === "pro_inspire") { r.push(s(2, "Nastavte tym a pracovni dobu")); }
  else { r.push(s(2, "Nastavte pracovni dobu")); }
  if (mode === "solo_inspire" || mode === "pro_inspire") { r.push(s(r.length + 1, "Zapnete AI insighty v nastaveni")); }
  r.push(s(r.length + 1, "Sdilejte booking link klientum"));
  return r.join("\n");
}
export async function sendWelcomeEmail({
  to, orgName, bookingUrl, dashboardUrl, mode = 'solo',
}: {
  to: string; orgName: string; bookingUrl: string; dashboardUrl?: string; mode?: string
}) {
  return sendEmail({
    to,
    subject: `Vítejte v Clientoro — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: 'Vítejte v Clientoro! 🏆',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 20px;">
          Váš účet <strong style="color:#111827;">${orgName}</strong> je připraven. Tady je vše co potřebujete pro začátek.
        </p>

        <!-- Booking link box -->
        <div style="background:linear-gradient(135deg,#0e3a5c,#2ba0b0);border-radius:12px;padding:20px;margin:0 0 20px;text-align:center;">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">📎 Váš booking link</p>
          <p style="margin:0 0 8px;"><a href="${bookingUrl}" style="color:#fbbf24;font-size:16px;font-weight:700;text-decoration:none;">${bookingUrl}</a></p>
          <p style="margin:0;color:rgba(255,255,255,0.6);font-size:12px;">Sdílejte klientům — mohou si rovnou rezervovat online.</p>
        </div>

        <!-- 3 kroky -->
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:0 0 20px;">
          <p style="color:#111827;font-size:14px;font-weight:700;margin:0 0 12px;">🚀 Co udělat jako první:</p>
            ${getWelcomeSteps(mode)}


            <tr><td style="padding:6px 0;color:#374151;font-size:13px;"><span style="display:inline-block;width:24px;height:24px;background:#10b981;color:white;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;margin-right:8px;">3</span> Sdílejte booking link klientům</td></tr>
          </table>
        </div>

        <!-- Průvodce -->
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin:0 0 20px;">
          <p style="color:#111827;font-size:14px;font-weight:700;margin:0 0 8px;">📖 Rychlý průvodce</p>
          <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">Nastavte si vše za 5 minut — krok za krokem.</p>
          <a href="https://clientoro.pro/#features" style="color:#0f6b7a;font-size:13px;font-weight:600;text-decoration:none;">→ Jak začít za 5 minut</a>
        </div>

        <!-- Tip -->
        <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:14px 16px;margin:0 0 8px;">
          <p style="color:#92400e;font-size:13px;margin:0;">💡 <strong>TIP:</strong> Zapněte připomínky v nastavení — snížíte počet nedorazivších až o 70 %.</p>
        </div>
      `,
      footer: `
        <a href="${dashboardUrl || 'https://www.clientoro.pro/dashboard'}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:12px;font-size:14px;font-weight:700;letter-spacing:0.02em;">Otevřít dashboard</a>
        <p style="color:#6b7280;font-size:12px;margin:12px 0 0;">14 dní zdarma · Bez kreditní karty · Zrušíte kdykoliv</p>
        <p style="color:#9ca3af;font-size:11px;margin:8px 0 0;">Potřebujete pomoct? Napište nám: <a href="mailto:support@clientoro.pro" style="color:#0f6b7a;text-decoration:none;">support@clientoro.pro</a></p>
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
        <a href="https://clientoro.pro/dashboard" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">Otevřít dashboard</a>
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
        <a href="${dashboardUrl || 'https://www.clientoro.pro/dashboard'}" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:600;">Otevřít dashboard</a>
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


// ===== ADMIN NOTIFIKACE — nová registrace =====
export async function sendAdminNotification({ orgName, email, phone, ico, category, mode, slug, address }: {
  orgName: string; email: string; phone?: string; ico?: string; category?: string; mode?: string; slug?: string; address?: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.clientoro.pro'
  const bookingUrl = slug ? `${baseUrl}/book/${slug}` : ''

  const rows = [
    { label: 'Email', value: email },
    { label: 'Telefon', value: phone || '—' },
    { label: 'IČO', value: ico || '—' },
    { label: 'Kategorie', value: category || '—' },
    { label: 'Mód', value: mode || '—' },
    { label: 'Adresa', value: address || '—' },
    { label: 'Slug', value: slug || '—' },
  ]

  const tableRows = rows.map(r =>
    `<tr><td style="padding:6px 12px;color:#6b7280;font-size:13px;border-bottom:1px solid #f3f4f6;">${r.label}</td><td style="padding:6px 12px;color:#111827;font-size:13px;font-weight:600;border-bottom:1px solid #f3f4f6;">${r.value}</td></tr>`
  ).join('')

  return sendEmail({
    to: 'clientoro.app@gmail.com',
    subject: `[Nová registrace] ${orgName} — ${mode || 'solo'}`,
    html: emailTemplate({
      orgName: 'Clientoro Admin',
      title: `Nová organizace: ${orgName}`,
      body: `
        <p style="color:#6b7280;font-size:14px;margin:0 0 16px;">Dokončen onboarding nové organizace.</p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:0 0 16px;">
          <p style="color:#111827;font-size:18px;font-weight:700;margin:0 0 4px;">${orgName}</p>
          <p style="color:#6b7280;font-size:13px;margin:0;">${category || 'Nezadaná kategorie'} · ${mode || 'solo'}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;margin:0 0 16px;">
          ${tableRows}
        </table>

        ${bookingUrl ? `
        <div style="background:linear-gradient(135deg,#0e3a5c,#2ba0b0);border-radius:12px;padding:16px;margin:0 0 16px;text-align:center;">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Booking link</p>
          <p style="margin:0;"><a href="${bookingUrl}" style="color:#fbbf24;font-size:14px;font-weight:700;text-decoration:none;">${bookingUrl}</a></p>
        </div>
        ` : ''}

        <p style="color:#9ca3af;font-size:11px;margin:0;">Registrace: ${new Date().toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' })}</p>
      `,
    }),
  })
}

// ===== 11. POZVÁNKA DO TÝMU =====
export async function sendTeamInvite({
  to, orgName, inviterName, role, acceptUrl, logoUrl,
}: {
  to: string; orgName: string; inviterName: string; role: string; acceptUrl: string; logoUrl?: string
}) {
  return sendEmail({
    to,
    subject: `Pozvánka do týmu — ${orgName}`,
    html: emailTemplate({
      orgName, logoUrl,
      title: 'Byli jste pozváni do týmu!',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          <strong>${inviterName}</strong> vás zve do organizace <strong style="color:#111827;">${orgName}</strong> jako <strong>${role}</strong>.
        </p>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 4px;color:#111827;font-size:14px;font-weight:600;">Co vás čeká:</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">📅 Vlastní kalendář s rezervacemi</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">👥 Přehled vašich klientů</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">🔔 Notifikace o nových rezervacích</p>
        </div>
        <div style="margin:24px 0;text-align:center;">
          <a href="${acceptUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;">Přijmout pozvánku</a>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;text-align:center;">Pozvánka je platná 7 dní.</p>
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

// ===== 13. TRIAL KONČÍ ZA 3 DNY =====
export async function sendTrialEnding({
  to, orgName, daysLeft, trialEndDate, upgradeUrl,
}: {
  to: string; orgName: string; daysLeft: number; trialEndDate: string; upgradeUrl: string
}) {
  return sendEmail({
    to,
    subject: `Zkušební období končí za ${daysLeft} dny — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: `Zkušební období končí za ${daysLeft} dny`,
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Dobrý den, vaše 14denní zkušební období pro <strong style="color:#111827;">${orgName}</strong> končí <strong>${trialEndDate}</strong>.
        </p>
        <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;color:#92400e;font-size:14px;font-weight:700;">⏰ Zbývají ${daysLeft} dny</p>
          <p style="margin:0;color:#92400e;font-size:13px;">Po skončení trialu nebudete moci přijímat nové rezervace. Vaše data zůstanou zachována 30 dní.</p>
        </div>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;color:#111827;font-size:14px;font-weight:600;">Co získáte s placeným plánem:</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">✅ Neomezené rezervace</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">✅ Email notifikace klientům</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">✅ CRM a historie klientů</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">✅ Reporty a přehledy</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">🔜 AI insighty a doporučení</p>
        </div>
        <div style="margin:24px 0;text-align:center;">
          <a href="${upgradeUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;">Vybrat plán od 49 Kč/měs</a>
          <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">Žádné skryté poplatky · Zrušíte kdykoliv</p>
        </div>
      `,
    }),
  })
}

// ===== 14. TRIAL SKONČIL =====
export async function sendTrialExpired({
  to, orgName, upgradeUrl, exportUrl,
}: {
  to: string; orgName: string; upgradeUrl: string; exportUrl?: string
}) {
  return sendEmail({
    to,
    subject: `Zkušební období skončilo — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: 'Zkušební období skončilo',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Dobrý den, vaše 14denní zkušební období pro <strong style="color:#111827;">${orgName}</strong> skončilo.
        </p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;color:#dc2626;font-size:14px;font-weight:700;">Co to znamená:</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">❌ Nové rezervace nelze přijímat</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">❌ Booking stránka je pozastavena</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">✅ Vaše data zůstávají zachována 30 dní</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">✅ Dashboard je stále přístupný</p>
        </div>
        <div style="margin:24px 0;text-align:center;">
          <a href="${upgradeUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;">Aktivovat plán od 49 Kč/měs</a>
          <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">Aktivací se okamžitě obnoví vše.</p>
        </div>
        ${exportUrl ? `<div style="margin:16px 0;text-align:center;padding-top:16px;border-top:1px solid #e5e7eb;">
          <a href="${exportUrl}" style="color:#6b7280;font-size:12px;text-decoration:none;">📥 Exportovat moje data</a>
        </div>` : ''}
      `,
    }),
  })
}
// ===== 15. ZRUŠENÍ ČLENSTVÍ — POTVRZENÍ =====
export async function sendSubscriptionCancelled({
  to, orgName, cancelDate, activeUntil, reason,
}: {
  to: string; orgName: string; cancelDate: string; activeUntil: string; reason?: string
}) {
  return sendEmail({
    to,
    subject: `Členství zrušeno — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: 'Členství bylo zrušeno',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Dobrý den, potvrzujeme zrušení vašeho placeného členství pro <strong style="color:#111827;">${orgName}</strong>.
        </p>
        <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;color:#92400e;font-size:14px;font-weight:700;">Co se stane:</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">📅 Zrušeno: <strong>${cancelDate}</strong></p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">✅ Aktivní do: <strong>${activeUntil}</strong></p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">📦 Data zachována 30 dní po vypršení</p>
        </div>
        <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:16px 0;">
          Do <strong>${activeUntil}</strong> můžete plně využívat všechny funkce. Po tomto datu přejdete na omezený režim.
        </p>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px 16px;margin:16px 0;">
          <p style="margin:0;color:#1e40af;font-size:13px;">💡 Rozmysleli jste si to? Členství můžete kdykoliv obnovit v <a href="https://clientoro.pro/settings" style="color:#1e40af;font-weight:600;">Nastavení</a>.</p>
        </div>
      `,
    }),
  })
}

// ===== 16. ROZLOUČENÍ PO ZRUŠENÍ + EXPORT DAT =====
export async function sendFarewellEmail({
  to, orgName, exportUrl, feedbackEmail,
}: {
  to: string; orgName: string; exportUrl?: string; feedbackEmail?: string
}) {
  return sendEmail({
    to,
    subject: `Děkujeme za čas s Clientoro — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: 'Děkujeme a přejeme hodně úspěchů',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Dobrý den, váš účet <strong style="color:#111827;">${orgName}</strong> byl uzavřen a vše je vyrovnáno.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 4px;color:#059669;font-size:14px;font-weight:700;">✓ Vše vyrovnáno</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">Žádné další platby nebudou strženy.</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">Vaše data byla exportována a jsou připravena ke stažení.</p>
        </div>
        ${exportUrl ? `<div style="margin:20px 0;text-align:center;">
          <a href="${exportUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:12px;font-size:14px;font-weight:600;">📥 Stáhnout moje data</a>
          <p style="color:#9ca3af;font-size:11px;margin:8px 0 0;">Link je platný 30 dní.</p>
        </div>` : ''}
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;color:#111827;font-size:14px;font-weight:600;">Budeme rádi za vaše připomínky</p>
          <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
            Co bychom mohli udělat lépe? Stačí odpovědět na tento email nebo napsat na
            <a href="mailto:${feedbackEmail || 'support@clientoro.pro'}" style="color:#0e3a5c;font-weight:600;text-decoration:none;">${feedbackEmail || 'support@clientoro.pro'}</a>.
            Každý podnět nám pomáhá růst.
          </p>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px 16px;margin:16px 0;text-align:center;">
          <p style="margin:0;color:#1e40af;font-size:13px;">🔄 Pokud se kdykoliv rozhodnete vrátit, rádi vás přivítáme zpět. Stačí se znovu zaregistrovat na <a href="https://clientoro.pro/register" style="color:#1e40af;font-weight:600;text-decoration:none;">clientoro.pro</a>.</p>
        </div>
        <p style="color:#9ca3af;font-size:13px;margin:20px 0 0;text-align:center;">
          Děkujeme za čas strávený s Clientoro. Přejeme vám hodně úspěchů! 🙏
        </p>
      `,
    }),
  })
}

// ===== 17. ADMIN NOTIFIKACE — ZRUŠENÍ ÚČTU =====
export async function sendAdminChurnNotification({
  orgName, email, plan, reason, totalBookings, totalRevenue, memberSince,
}: {
  orgName: string; email: string; plan: string; reason?: string
  totalBookings?: number; totalRevenue?: number; memberSince?: string
}) {
  return sendEmail({
    to: 'clientoro.app@gmail.com',
    subject: `[CHURN] ${orgName} zrušil členství — ${plan}`,
    html: emailTemplate({
      orgName: 'Clientoro Admin',
      title: `Churn: ${orgName}`,
      body: `
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:0 0 16px;">
          <p style="margin:0;color:#dc2626;font-size:16px;font-weight:700;">🔴 Zákazník odchází</p>
        </div>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:4px 0;color:#374151;font-size:13px;"><strong>Organizace:</strong> ${orgName}</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;"><strong>Email:</strong> ${email}</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;"><strong>Plán:</strong> ${plan}</p>
          ${reason ? `<p style="margin:4px 0;color:#374151;font-size:13px;"><strong>Důvod:</strong> ${reason}</p>` : ''}
          ${memberSince ? `<p style="margin:4px 0;color:#374151;font-size:13px;"><strong>Členem od:</strong> ${memberSince}</p>` : ''}
          ${totalBookings ? `<p style="margin:4px 0;color:#374151;font-size:13px;"><strong>Celkem rezervací:</strong> ${totalBookings}</p>` : ''}
          ${totalRevenue ? `<p style="margin:4px 0;color:#374151;font-size:13px;"><strong>Celkové tržby:</strong> ${totalRevenue.toLocaleString('cs-CZ')} Kč</p>` : ''}
        </div>
        <p style="color:#9ca3af;font-size:11px;margin:16px 0 0;">Zrušeno: ${new Date().toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' })}</p>
      `,
    }),
  })
}

// ===== 18. GDPR — POTVRZENÍ SMAZÁNÍ ÚČTU =====
export async function sendAccountDeleted({
  to, orgName, deletionDate,
}: {
  to: string; orgName: string; deletionDate: string
}) {
  return sendEmail({
    to,
    subject: `Účet smazán — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: 'Účet byl trvale smazán',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Dobrý den, potvrzujeme trvalé smazání účtu <strong style="color:#111827;">${orgName}</strong> v souladu s GDPR.
        </p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;color:#111827;font-size:14px;font-weight:600;">Co bylo smazáno:</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">🗑️ Všechna data organizace</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">🗑️ Klientské záznamy a historie</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">🗑️ Rezervace a kalendáře</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">🗑️ Nastavení a konfigurace</p>
          <p style="margin:8px 0 0;color:#6b7280;font-size:12px;">Datum smazání: ${deletionDate}</p>
        </div>
        <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:16px 0;">
          Tato akce je nevratná. Pokud budete chtít v budoucnu využívat Clientoro, bude nutné vytvořit nový účet.
        </p>
        <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;text-align:center;">
          Máte otázky? <a href="mailto:support@clientoro.pro" style="color:#0e3a5c;text-decoration:none;">support@clientoro.pro</a>
        </p>
      `,
    }),
  })
}

// ===== 19. ŽÁDOST O GOOGLE RECENZI =====
export async function sendReviewRequest({
  to, customerName, orgName, staffName, googleReviewUrl, bookingUrl,
}: {
  to: string; customerName: string; orgName: string; staffName?: string
  googleReviewUrl?: string; bookingUrl?: string
}) {
  return sendEmail({
    to,
    subject: `Jak se Vám u nás líbilo? — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: 'Jak jste byli spokojeni?',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Dobrý den <strong>${customerName}</strong>, děkujeme za návštěvu${staffName ? ` u <strong>${staffName}</strong>` : ''} v <strong>${orgName}</strong>.
        </p>
        <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
          <p style="margin:0 0 8px;font-size:28px;">⭐⭐⭐⭐⭐</p>
          <p style="margin:0 0 12px;color:#92400e;font-size:14px;font-weight:600;">Vaše hodnocení nám pomáhá růst</p>
          ${googleReviewUrl ? `<a href="${googleReviewUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:12px;font-size:14px;font-weight:600;">Ohodnotit na Google</a>` : ''}
        </div>
        <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:16px 0;">
          Zabere to jen minutku a nám to nesmírně pomůže. Děkujeme! 🙏
        </p>
        ${bookingUrl ? `<div style="margin:16px 0;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;">
          <a href="${bookingUrl}" style="color:#0e3a5c;font-size:13px;font-weight:600;text-decoration:none;">📅 Rezervovat další termín</a>
        </div>` : ''}
      `,
    }),
  })
}

// ===== 20. PLATBA PŘIJATA =====
export async function sendPaymentReceived({
  to, orgName, amount, plan, nextBillingDate, invoiceUrl,
}: {
  to: string; orgName: string; amount: string; plan: string; nextBillingDate: string; invoiceUrl?: string
}) {
  return sendEmail({
    to,
    subject: `Platba přijata — ${amount} · ${orgName}`,
    html: emailTemplate({
      orgName,
      title: 'Platba přijata ✓',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Dobrý den, potvrzujeme přijetí platby za <strong style="color:#111827;">${orgName}</strong>.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:4px 0;color:#374151;font-size:14px;"><strong>Částka:</strong> ${amount}</p>
          <p style="margin:4px 0;color:#374151;font-size:14px;"><strong>Plán:</strong> ${plan}</p>
          <p style="margin:4px 0;color:#374151;font-size:14px;"><strong>Další platba:</strong> ${nextBillingDate}</p>
        </div>
        ${invoiceUrl ? `<div style="margin:16px 0;text-align:center;">
          <a href="${invoiceUrl}" style="color:#0e3a5c;font-size:13px;font-weight:600;text-decoration:none;">📄 Stáhnout fakturu</a>
        </div>` : ''}
      `,
    }),
  })
}

// ===== 21. PLATBA SELHALA =====
export async function sendPaymentFailed({
  to, orgName, amount, retryUrl, updateCardUrl,
}: {
  to: string; orgName: string; amount: string; retryUrl?: string; updateCardUrl?: string
}) {
  return sendEmail({
    to,
    subject: `Platba selhala — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: 'Platba se nezdařila',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Dobrý den, nepodařilo se stáhnout platbu <strong>${amount}</strong> za <strong style="color:#111827;">${orgName}</strong>.
        </p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;color:#dc2626;font-size:14px;font-weight:700;">⚠️ Akce potřeba</p>
          <p style="margin:0;color:#374151;font-size:13px;">Zkontrolujte prosím platební údaje. Pokud platba neproběhne do 7 dní, bude účet pozastaven.</p>
        </div>
        <div style="margin:24px 0;text-align:center;">
          ${updateCardUrl ? `<a href="${updateCardUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;">Aktualizovat platební údaje</a>` : ''}
          ${retryUrl ? `<p style="margin:12px 0 0;"><a href="${retryUrl}" style="color:#0e3a5c;font-size:13px;font-weight:600;text-decoration:none;">🔄 Zkusit platbu znovu</a></p>` : ''}
        </div>
      `,
    }),
  })
}
// ===== 22. UPGRADE PLÁNU =====
export async function sendPlanUpgraded({
  to, orgName, oldPlan, newPlan, amount, features,
}: {
  to: string; orgName: string; oldPlan: string; newPlan: string; amount: string; features?: string[]
}) {
  return sendEmail({
    to,
    subject: `Plán upgradován na ${newPlan} — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: `Upgrade na ${newPlan} ✓`,
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Dobrý den, váš plán pro <strong style="color:#111827;">${orgName}</strong> byl úspěšně upgradován.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:4px 0;color:#374151;font-size:14px;"><strong>Předchozí:</strong> <span style="text-decoration:line-through;color:#9ca3af;">${oldPlan}</span></p>
          <p style="margin:4px 0;color:#374151;font-size:14px;"><strong>Nový plán:</strong> <span style="color:#059669;font-weight:700;">${newPlan}</span></p>
          <p style="margin:4px 0;color:#374151;font-size:14px;"><strong>Měsíční platba:</strong> ${amount}</p>
        </div>
        ${features && features.length > 0 ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;color:#111827;font-size:14px;font-weight:600;">🏆 Nově máte přístup k:</p>
          ${features.map(f => `<p style="margin:4px 0;color:#374151;font-size:13px;">✅ ${f}</p>`).join('')}
        </div>` : ''}
        <div style="margin:20px 0;text-align:center;">
          <a href="https://clientoro.pro/dashboard" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:12px;font-size:14px;font-weight:600;">Otevřít dashboard</a>
        </div>
      `,
    }),
  })
}

// ===== 23. ZMĚNA HESLA — POTVRZENÍ =====
export async function sendPasswordChanged({
  to, orgName, changedAt,
}: {
  to: string; orgName: string; changedAt: string
}) {
  return sendEmail({
    to,
    subject: `Heslo změněno — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: 'Heslo bylo změněno',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Dobrý den, potvrzujeme změnu hesla pro účet <strong style="color:#111827;">${orgName}</strong>.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0;color:#059669;font-size:14px;font-weight:600;">✓ Heslo úspěšně změněno</p>
          <p style="margin:4px 0 0;color:#6b7280;font-size:12px;">Změněno: ${changedAt}</p>
        </div>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 16px;margin:16px 0;">
          <p style="margin:0;color:#dc2626;font-size:13px;">⚠️ Pokud jste tuto změnu neprovedli vy, okamžitě si resetujte heslo na <a href="https://clientoro.pro/login" style="color:#dc2626;font-weight:600;">clientoro.pro/login</a> nebo nás kontaktujte.</p>
        </div>
      `,
    }),
  })
}

// ===== 24. WAITLIST — UVOLNIL SE TERMÍN =====
export async function sendWaitlistNotification({
  to, customerName, serviceName, date, time, orgName, bookingUrl,
}: {
  to: string; customerName: string; serviceName: string
  date: string; time: string; orgName: string; bookingUrl: string
}) {
  return sendEmail({
    to,
    subject: `Uvolnil se termín! — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: 'Uvolnil se termín! 🏆',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Dobrý den <strong>${customerName}</strong>, máme pro vás skvělou zprávu!
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 4px;color:#059669;font-size:14px;font-weight:700;">Volný termín</p>
          <p style="margin:4px 0;color:#374151;font-size:14px;"><strong>Služba:</strong> ${serviceName}</p>
          <p style="margin:4px 0;color:#374151;font-size:14px;"><strong>Datum:</strong> ${date} v ${time}</p>
        </div>
        <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:12px 16px;margin:16px 0;">
          <p style="margin:0;color:#92400e;font-size:13px;">⏰ Termín je dostupný omezeně — rezervujte co nejdříve.</p>
        </div>
        <div style="margin:24px 0;text-align:center;">
          <a href="${bookingUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;">Rezervovat termín</a>
        </div>
      `,
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
