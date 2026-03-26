// PATH: src/lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ===== ŠABLONA =====
function emailTemplate({ title, body, footer, orgName, logoUrl, bookingId }: { title: string; body: string; footer?: string; orgName?: string; logoUrl?: string; bookingId?: string }) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
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
  to, customerName, serviceName, staffName, date, time, price, orgName, orgPhone, manageUrl, logoUrl, bookingId,
}: {
  to: string; customerName: string; serviceName: string; staffName?: string
  date: string; time: string; price?: number; orgName: string; orgPhone?: string; manageUrl?: string; logoUrl?: string; bookingId?: string
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
  to, customerName, serviceName, date, time, orgName, orgPhone,
}: {
  to: string; customerName: string; serviceName: string
  date: string; time: string; orgName: string; orgPhone?: string
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
          Provozovatel: <strong>${orgName}</strong>${orgPhone ? ` · ${orgPhone}` : ''}
        </p>
      `,
    }),
  })
}

// ===== 4. ZRUŠENÍ — notifikace majiteli =====
export async function sendOwnerCancellation({
  to, customerName, customerPhone, serviceName, date, time, orgName,
}: {
  to: string; customerName: string; customerPhone: string
  serviceName: string; date: string; time: string; orgName: string
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
