// PATH: src/lib/email/engagement.ts
import { sendEmail, emailTemplate } from './core'

// ===== 6. TESTOVACÍ EMAIL =====
export async function sendTestEmail({ to, orgName }: { to: string; orgName: string }) {
  return sendEmail({
    to,
    subject: `Testovací email — ${orgName}`,
    html: emailTemplate({
      orgName,
      title: 'Testovací email ✓',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Tento email potvrzuje, že notifikace pro <strong style="color:#111827;">${orgName}</strong> fungují správně.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0;color:#059669;font-size:14px;font-weight:700;">✅ Vše funguje!</p>
          <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">Klienti budou dostávat potvrzení a připomínky automaticky.</p>
        </div>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;color:#111827;font-size:14px;font-weight:600;">Co klienti dostanou:</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">📧 Potvrzení rezervace</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">⏰ Připomínku den předem</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">🙏 Poděkování po návštěvě</p>
          <p style="margin:4px 0;color:#374151;font-size:13px;">❌ Oznámení o zrušení</p>
        </div>
      `,
      footer: `<p style="color:#9ca3af;font-size:11px;margin:0;">Odesláno z Clientoro · ${new Date().toLocaleString('cs-CZ')}</p>`,
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

// ===== 19. ŽÁDOST O RECENZI =====
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

// ===== 23. ZMĚNA HESLA =====
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
