// PATH: src/lib/email/billing.ts
import { sendEmail, emailTemplate } from './core'

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
