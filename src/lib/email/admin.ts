// PATH: src/lib/email/admin.ts
import { sendEmail, emailTemplate } from './core'

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
        <table style="width:100%;border-collapse:collapse;margin:0 0 16px;">${tableRows}</table>
        ${bookingUrl ? `
        <div style="background:linear-gradient(135deg,#0e3a5c,#2ba0b0);border-radius:12px;padding:16px;margin:0 0 16px;text-align:center;">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Booking link</p>
          <p style="margin:0;"><a href="${bookingUrl}" style="color:#fbbf24;font-size:14px;font-weight:700;text-decoration:none;">${bookingUrl}</a></p>
        </div>` : ''}
        <p style="color:#9ca3af;font-size:11px;margin:0;">Registrace: ${new Date().toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' })}</p>
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

// ===== 17. ADMIN CHURN NOTIFIKACE =====
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
