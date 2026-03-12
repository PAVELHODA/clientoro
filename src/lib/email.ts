import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ============================================
// 📧 POTVRZENÍ REZERVACE — klientovi
// ============================================
export async function sendBookingConfirmation({
  to,
  customerName,
  serviceName,
  staffName,
  date,
  time,
  price,
  orgName,
}: {
  to: string
  customerName: string
  serviceName: string
  staffName?: string
  date: string
  time: string
  price?: number
  orgName: string
}) {
  if (!to) return

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Clientoro <onboarding@resend.dev>',
      to,
      subject: `✅ Potvrzení rezervace — ${serviceName}`,
      html: baseTemplate(`
        <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">✅ Rezervace potvrzena!</h2>
        <p style="color:#6b7280;margin:0 0 24px;">Dobrý den, ${customerName}, vaše rezervace byla úspěšně vytvořena.</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Služba</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${serviceName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Datum</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${date}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Čas</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${time}</td>
            </tr>
            ${staffName ? `<tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Specialista</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${staffName}</td>
            </tr>` : ''}
            ${price ? `<tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Cena</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${price} Kč</td>
            </tr>` : ''}
          </table>
        </div>
        <p style="color:#6b7280;font-size:13px;margin:0;">Provozovatel: <strong>${orgName}</strong></p>
        <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">Potřebujete změnit termín? Kontaktujte nás.</p>
      `),
    })
    console.log('✅ Booking confirmation email sent to:', to)
  } catch (err) {
    console.error('❌ Email send failed:', err)
  }
}

// ============================================
// 📧 NOTIFIKACE MAJITELI — nová rezervace
// ============================================
export async function sendOwnerNotification({
  to,
  customerName,
  customerPhone,
  serviceName,
  staffName,
  date,
  time,
  orgName,
}: {
  to: string
  customerName: string
  customerPhone: string
  serviceName: string
  staffName?: string
  date: string
  time: string
  orgName: string
}) {
  if (!to) return

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Clientoro <onboarding@resend.dev>',
      to,
      subject: `📅 Nová rezervace — ${customerName}`,
      html: baseTemplate(`
        <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">📅 Nová rezervace!</h2>
        <p style="color:#6b7280;margin:0 0 24px;">Máte novou rezervaci v ${orgName}.</p>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin:0 0 24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Klient</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Telefon</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${customerPhone}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Služba</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${serviceName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Datum</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${date} v ${time}</td>
            </tr>
            ${staffName ? `<tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Specialista</td>
              <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${staffName}</td>
            </tr>` : ''}
          </table>
        </div>
      `),
    })
    console.log('✅ Owner notification sent to:', to)
  } catch (err) {
    console.error('❌ Owner email failed:', err)
  }
}

// ============================================
// 🎨 BASE TEMPLATE
// ============================================
function baseTemplate(content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#0369a1,#38bdf8);border-radius:16px 16px 0 0;padding:32px 24px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">Clientoro</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Váš rezervační systém</p>
    </div>
    <div style="background:#fff;padding:32px 24px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;">
      ${content}
    </div>
    <div style="text-align:center;padding:16px;color:#9ca3af;font-size:12px;">
      <p>Odesláno přes Clientoro</p>
    </div>
  </div>
</body>
</html>`
}
