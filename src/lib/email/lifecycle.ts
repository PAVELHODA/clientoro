// PATH: src/lib/email/lifecycle.ts
import { sendEmail, emailTemplate } from './core'

// ===== WELCOME EMAIL =====
export async function sendWelcomeEmail({
  to, orgName, bookingUrl, dashboardUrl, mode, logoUrl,
}: {
  to: string; orgName: string; bookingUrl?: string; dashboardUrl?: string; mode?: string; logoUrl?: string
}) {
  const steps = mode === 'team'
    ? [
        '1️⃣ Přidejte své služby a ceník',
        '2️⃣ Pozvěte členy týmu',
        '3️⃣ Nastavte pracovní dobu',
        '4️⃣ Sdílejte booking link klientům',
      ]
    : [
        '1️⃣ Přidejte své služby a ceník',
        '2️⃣ Nastavte pracovní dobu',
        '3️⃣ Sdílejte booking link klientům',
      ]

  return sendEmail({
    to,
    subject: `Vítejte v Clientoro! — ${orgName}`,
    html: emailTemplate({
      orgName, logoUrl,
      title: 'Vítejte v Clientoro! 🎉',
      body: `
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Gratulujeme k vytvoření účtu <strong style="color:#111827;">${orgName}</strong>!
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;color:#111827;font-size:14px;font-weight:600;">Začněte v ${steps.length} krocích:</p>
          ${steps.map(s => `<p style="margin:4px 0;color:#374151;font-size:13px;">${s}</p>`).join('')}
        </div>
        ${bookingUrl ? `<div style="background:linear-gradient(135deg,#0e3a5c,#2ba0b0);border-radius:12px;padding:16px;margin:16px 0;text-align:center;">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Váš booking link</p>
          <p style="margin:0;"><a href="${bookingUrl}" style="color:#fbbf24;font-size:16px;font-weight:700;text-decoration:none;">${bookingUrl}</a></p>
        </div>` : ''}
        <div style="margin:20px 0;text-align:center;">
          <a href="${dashboardUrl || 'https://clientoro.pro/dashboard'}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0e3a5c,#2ba0b0);color:white;text-decoration:none;border-radius:12px;font-size:15px;font-weight:700;">Otevřít dashboard</a>
        </div>
      `,
      footer: `<p style="color:#6b7280;font-size:12px;margin:0;">14 dní zdarma · Žádná kreditka</p>`,
    }),
  })
}
// ===== 13. TRIAL KONČÍ =====
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

// ===== 15. ZRUŠENÍ ČLENSTVÍ =====
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

// ===== 16. ROZLOUČENÍ =====
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

// ===== 18. GDPR — SMAZÁNÍ ÚČTU =====
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
