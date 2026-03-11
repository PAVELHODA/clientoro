// lib/notifications/sendNotifications.ts

import { sendEmail } from "./email";
import { sendSms } from "./sms";

export async function notifyReservationCreated({
  customer_email,
  customer_phone,
  customer_name,
  start,
  end,
  service_name,
  employee_name,
}) {
  const subject = "Potvrzení rezervace";
  const html = `
    <h2>Vaše rezervace byla vytvořena</h2>
    <p><strong>Služba:</strong> ${service_name}</p>
    <p><strong>Zaměstnanec:</strong> ${employee_name}</p>
    <p><strong>Začátek:</strong> ${start}</p>
    <p><strong>Konec:</strong> ${end}</p>
  `;

  if (customer_email) {
    await sendEmail(customer_email, subject, html);
  }

  if (customer_phone) {
    await sendSms(
      customer_phone,
      `Potvrzení rezervace: ${service_name} u ${employee_name} ${start}`
    );
  }
}

export async function notifyReservationUpdated({
  customer_email,
  customer_phone,
  service_name,
  employee_name,
  start,
  end,
}) {
  const subject = "Aktualizace rezervace";
  const html = `
    <h2>Vaše rezervace byla aktualizována</h2>
    <p><strong>Služba:</strong> ${service_name}</p>
    <p><strong>Zaměstnanec:</strong> ${employee_name}</p>
    <p><strong>Nový začátek:</strong> ${start}</p>
    <p><strong>Nový konec:</strong> ${end}</p>
  `;

  if (customer_email) {
    await sendEmail(customer_email, subject, html);
  }

  if (customer_phone) {
    await sendSms(
      customer_phone,
      `Aktualizace rezervace: ${service_name} u ${employee_name} ${start}`
    );
  }
}

export async function notifyReservationCancelled({
  customer_email,
  customer_phone,
  service_name,
  employee_name,
  start,
}) {
  const subject = "Zrušení rezervace";
  const html = `
    <h2>Vaše rezervace byla zrušena</h2>
    <p><strong>Služba:</strong> ${service_name}</p>
    <p><strong>Zaměstnanec:</strong> ${employee_name}</p>
    <p><strong>Původní termín:</strong> ${start}</p>
  `;

  if (customer_email) {
    await sendEmail(customer_email, subject, html);
  }

  if (customer_phone) {
    await sendSms(
      customer_phone,
      `Zrušení rezervace: ${service_name} u ${employee_name} ${start}`
    );
  }
}
