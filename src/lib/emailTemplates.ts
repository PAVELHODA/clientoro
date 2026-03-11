export function renderReservationCreatedEmail({
  fullName,
  serviceName,
  employeeName,
  date,
  time,
}: {
  fullName: string;
  serviceName: string;
  employeeName: string;
  date: string;
  time: string;
}) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
    <h2 style="color: #2563eb;">Potvrzení rezervace</h2>

    <p>Dobrý den, <strong>${fullName}</strong>,</p>

    <p>vaše rezervace byla úspěšně vytvořena.</p>

    <h3>Detaily rezervace</h3>
    <ul>
      <li><strong>Služba:</strong> ${serviceName}</li>
      <li><strong>Zaměstnanec:</strong> ${employeeName}</li>
      <li><strong>Datum:</strong> ${date}</li>
      <li><strong>Čas:</strong> ${time}</li>
    </ul>

    <p>Těšíme se na vás.</p>
  </div>
  `;
}

export function renderReservationCancelledEmail({
  fullName,
  serviceName,
  date,
  time,
}: {
  fullName: string;
  serviceName: string;
  date: string;
  time: string;
}) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
    <h2 style="color: #dc2626;">Zrušení rezervace</h2>

    <p>Dobrý den, <strong>${fullName}</strong>,</p>

    <p>vaše rezervace byla úspěšně zrušena.</p>

    <h3>Detaily zrušené rezervace</h3>
    <ul>
      <li><strong>Služba:</strong> ${serviceName}</li>
      <li><strong>Datum:</strong> ${date}</li>
      <li><strong>Čas:</strong> ${time}</li>
    </ul>

    <p>Pokud budete potřebovat nový termín, můžete si jej kdykoliv vytvořit online.</p>
  </div>
  `;
}

export function renderReservationReminderEmail({
  fullName,
  serviceName,
  employeeName,
  date,
  time,
}: {
  fullName: string;
  serviceName: string;
  employeeName: string;
  date: string;
  time: string;
}) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
    <h2 style="color: #16a34a;">Připomenutí rezervace</h2>

    <p>Dobrý den, <strong>${fullName}</strong>,</p>

    <p>připomínáme vám nadcházející rezervaci.</p>

    <h3>Detaily rezervace</h3>
    <ul>
      <li><strong>Služba:</strong> ${serviceName}</li>
      <li><strong>Zaměstnanec:</strong> ${employeeName}</li>
      <li><strong>Datum:</strong> ${date}</li>
      <li><strong>Čas:</strong> ${time}</li>
    </ul>

    <p>Pokud potřebujete změnit nebo zrušit termín, můžete tak učinit online.</p>
  </div>
  `;
}
