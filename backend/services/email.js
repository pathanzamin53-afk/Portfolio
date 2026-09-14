const emailConfig = {
  apiKey: process.env.RESEND_API_KEY,
  notifyEmail: process.env.NOTIFY_EMAIL || "khanmohdzamin@gmail.com",
  fromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
};

export async function notifyByEmail({ name, email, subject, message }) {
  const { apiKey, notifyEmail, fromEmail } = emailConfig;

  if (!apiKey) {
    console.warn("Email notification skipped: RESEND_API_KEY is missing.");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [notifyEmail],
      reply_to: email,
      subject: `Portfolio inquiry: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin-bottom: 12px;">New portfolio message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="padding: 14px 16px; background: #f3f4f6; border-radius: 8px; white-space: pre-wrap;">${message}</div>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Email notification failed (${response.status}): ${details}`);
  }
}
