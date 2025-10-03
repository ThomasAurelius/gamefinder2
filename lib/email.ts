interface SendResetEmailOptions {
  email: string;
  token: string;
}

interface SendResetEmailResult {
  delivered: boolean;
  skipped: boolean;
  message: string;
}

export async function sendResetPasswordEmail(
  options: SendResetEmailOptions,
): Promise<SendResetEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("RESEND_API_KEY is not configured. Skipping reset email.");
    return {
      delivered: false,
      skipped: true,
      message: "Resend API key not configured; email not sent.",
    };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "no-reply@games.example";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/auth/reset-password?token=${options.token}`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: options.email,
      subject: "Reset your The Gathering Call password",
      html: `
        <p>Hi there,</p>
        <p>We received a request to reset your The Gathering Call password.</p>
        <p><a href="${resetUrl}">Click here to choose a new password</a>. This link will expire in 60 minutes.</p>
        <p>If you did not request a reset, feel free to ignore this email.</p>
      `,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    console.error("Failed to send reset email via Resend:", errorPayload);
    throw new Error("Unable to send reset email through Resend");
  }

  const payload = await response.json();

  return {
    delivered: true,
    skipped: false,
    message: payload?.id ? `Email dispatched (id: ${payload.id})` : "Email dispatched.",
  };
}
