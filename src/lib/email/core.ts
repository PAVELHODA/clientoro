// PATH: src/lib/email/core.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ===== ŠABLONA — table-based pro maximální kompatibilitu =====
export function emailTemplate({ title, body, footer, orgName, logoUrl, bookingId }: { title: string; body: string; footer?: string; orgName?: string; logoUrl?: string; bookingId?: string }) {
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

export function infoBox(items: { label: string; value: string }[], color: 'green' | 'blue' | 'red' = 'blue') {
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

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY || !to) return { success: false, error: 'Missing API key or recipient' }
  try {
    const { data, error } = await resend.emails.send({
      from: 'Clientoro <noreply@clientoro.pro>',
      to,
      subject,
      html,
    })
    if (error) { console.error('[Email error]', error); return { success: false, error } }
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('[Email send error]', err)
    return { success: false, error: err }
  }
}
