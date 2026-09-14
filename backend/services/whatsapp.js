const whatsappConfig = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  recipientNumber: process.env.WHATSAPP_RECIPIENT_NUMBER,
};

export async function notifyWhatsApp({ name, email, subject, message }) {
  const { accessToken, phoneNumberId, recipientNumber } = whatsappConfig;
  if (!accessToken || !phoneNumberId || !recipientNumber) {
    console.warn(
      "WhatsApp notification skipped: WhatsApp environment variables are incomplete.",
    );
    return;
  }

  const response = await fetch(
    `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipientNumber,
        type: "template",
        template: {
          name:
            process.env.WHATSAPP_TEMPLATE_NAME ||
            "portfolio_contact_notification",
          language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: name },
                { type: "text", text: email },
                { type: "text", text: subject },
                { type: "text", text: message },
              ],
            },
          ],
        },
      }),
    },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `WhatsApp notification failed (${response.status}): ${details}`,
    );
  }
}
