// lib/notifications/sms.ts

import twilio from "twilio";

export async function sendSms(to: string, message: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  // Twilio je volitelné — pokud nejsou hodnoty vyplněné, SMS se neodešle
  if (!sid || !token || !from) {
    console.log("Twilio není nastavené — SMS se neodesílá.");
    return;
  }

  const client = twilio(sid, token);

  try {
    await client.messages.create({
      body: message,
      from,
      to,
    });
    console.log("SMS odeslána.");
  } catch (error) {
    console.error("Chyba při odesílání SMS:", error);
  }
}
