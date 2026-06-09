// src/lib/email.ts

interface EmailPayload {
  to: string
  subject: string
  html: string
}

async function sendViaResend({ to, subject, html }: EmailPayload) {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'HAMON <noreply@hamon.co>',
    to,
    subject,
    html,
  })
}

async function sendViaSMTP({ to, subject, html }: EmailPayload) {
  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  })
}

export async function sendEmail(payload: EmailPayload) {
  try {
    if (process.env.RESEND_API_KEY) {
      await sendViaResend(payload)
    } else if (process.env.SMTP_HOST) {
      await sendViaSMTP(payload)
    } else {
      console.log('[EMAIL — DEV MODE] Would send:', payload.subject, 'to', payload.to)
    }
  } catch (err) {
    console.error('Email send failed:', err)
  }
}

export function welcomeEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to HAMON</title>
</head>
<body style="margin:0;padding:0;background:#F7F7F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F7F5;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0A0A0A;border-radius:2px;">
          <tr>
            <td style="padding:56px 48px 40px;text-align:center;border-bottom:1px solid #2B2B2B;">
              <h1 style="margin:0;font-size:36px;font-weight:300;letter-spacing:0.25em;color:#F7F7F5;font-family:Georgia,serif;">HAMON</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:48px 48px 32px;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C0C0C0;">Welcome,</p>
              <h2 style="margin:0 0 24px;font-size:28px;font-weight:300;color:#F7F7F5;font-family:Georgia,serif;">${name}</h2>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#C0C0C0;">
                Thank you for joining the HAMON waitlist.
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#C0C0C0;">
                You'll be among the first to receive updates and early access to our debut collection — a luxury sneaker engineered for those who understand that how you carry yourself changes everything.
              </p>
              <p style="margin:0 0 40px;font-size:15px;line-height:1.7;color:#C0C0C0;">
                Confidence is presence. We'll be in touch.
              </p>
              <div style="border-top:1px solid #2B2B2B;padding-top:32px;">
                <p style="margin:0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#888;">
                  — The HAMON Team
                </p>
              </div>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:11px;color:#888;letter-spacing:0.05em;">
          © 2024 HAMON. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export function adminNotificationHtml(entry: {
  full_name: string
  email: string
  phone_number?: string
  created_at: string
}): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family:monospace;background:#0A0A0A;color:#F7F7F5;padding:32px;">
  <h2 style="color:#C0C0C0;letter-spacing:0.1em;">NEW HAMON WAITLIST SIGNUP</h2>
  <table style="border-collapse:collapse;width:100%;max-width:480px;">
    <tr><td style="padding:8px 0;color:#888;width:120px;">Name</td><td style="color:#F7F7F5;">${entry.full_name}</td></tr>
    <tr><td style="padding:8px 0;color:#888;">Email</td><td style="color:#F7F7F5;">${entry.email}</td></tr>
    <tr><td style="padding:8px 0;color:#888;">Phone</td><td style="color:#F7F7F5;">${entry.phone_number || '—'}</td></tr>
    <tr><td style="padding:8px 0;color:#888;">Time</td><td style="color:#F7F7F5;">${entry.created_at}</td></tr>
  </table>
  <p style="margin-top:24px;color:#C0C0C0;font-size:12px;">View dashboard → /admin</p>
</body>
</html>
  `
}
