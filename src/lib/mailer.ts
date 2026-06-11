// lib/mailer.ts
// ─────────────────────────────────────────────────────────────────────────────
// Nodemailer transporter + welcome email template.
//
// HOW THIS CONNECTS TO GMAIL:
//   1. You create an "App Password" inside your Google account (not your normal
//      password).  Google lets you do this once 2-Step Verification is enabled:
//      https://myaccount.google.com/apppasswords
//   2. You set EMAIL_USER and EMAIL_PASS in .env.local.
//   3. Nodemailer opens a TLS connection to smtp.gmail.com:587 and authenticates
//      with those credentials every time we call transporter.sendMail().
//
// WHY NOT OAuth2?
//   App Passwords are simpler for a class project.  For a production SaaS you
//   would use Gmail's OAuth2 flow or a dedicated provider like Resend / SendGrid.
// ─────────────────────────────────────────────────────────────────────────────

import nodemailer from "nodemailer"

// createTransport() builds the reusable SMTP connection config.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GMAIL_USER,
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  },
})

// ─── Welcome email ────────────────────────────────────────────────────────────
// Called from the POST /api/users route after a new user is saved to MongoDB.
export async function sendWelcomeEmail(
  to: string,
  nombre: string,
  password: string   // plain-text password — only used here, never stored
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://user-manager-app-weld.vercel.app"

  // mailOptions describes the email we want to send.
  const mailOptions = {
    from: `"User Manager" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Bienvenido a User Manager — tu cuenta está lista",
    // html is the rich version; text is the plain-text fallback for clients
    // that block HTML.
    text: `Hola ${nombre}, tu cuenta ha sido creada. Inicia sesión en ${appUrl}/login`,
    html: buildWelcomeTemplate(nombre, to, password, appUrl),
  }

  // transporter.sendMail() returns a Promise that resolves with delivery info.
  // We await it so any network error surfaces as a thrown exception that the
  // API route can catch and log.
  await transporter.sendMail(mailOptions)
}

// ─── HTML template ────────────────────────────────────────────────────────────
// Pure function that returns an HTML string.  Keeping it in a function means
// we can unit-test it without sending real emails.
function buildWelcomeTemplate(
  nombre: string,
  email: string,
  password: string,
  appUrl: string
): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenido a User Manager</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Outfit',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 30px rgba(15,23,42,0.03);">

          <!-- Header strip -->
          <tr>
            <td style="background:linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%);padding:32px 40px;">
              <p style="margin:0;font-family:'Outfit',sans-serif;font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:#ffffff;opacity:.8;">User Manager</p>
              <h1 style="margin:8px 0 0;font-family:'Outfit',sans-serif;font-size:28px;font-weight:700;color:#ffffff;line-height:1.2;">
                Te damos la bienvenida,<br />${nombre}.
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;color:#3f3f46;font-size:15px;line-height:1.7;">
                Tu cuenta ha sido creada por un administrador. A continuación se muestran tus credenciales de acceso para ingresar — por favor consérvalas de forma segura.
              </p>

              <!-- Credentials card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#0ea5e9;">Correo Electrónico</p>
                    <p style="margin:0 0 20px;font-size:15px;color:#09090b;font-weight:500;">${email}</p>
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#0ea5e9;">Contraseña Temporal</p>
                    <p style="margin:0;font-family:'JetBrains+Mono',monospace;font-size:18px;font-weight:600;color:#09090b;letter-spacing:2px;">${password}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:#0ea5e9;">
                    <a href="${appUrl}/login"
                       style="display:inline-block;padding:14px 32px;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                      Iniciar Sesión
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 0;font-size:12px;color:#71717a;line-height:1.6;">
                Si no esperabas este correo, puedes ignorarlo de manera segura.
                Este mensaje fue enviado automáticamente — por favor no respondas a él.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:11px;color:#71717a;text-align:center;letter-spacing:1px;">
                USER MANAGER &nbsp;&middot;&nbsp; ${new Date().getFullYear()}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export async function sendMotivationalEmail(to: string, nombre: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://user-manager-app-weld.vercel.app"

  const mailOptions = {
    from: `"User Manager" <${process.env.GMAIL_USER}>`,
    to,
    subject: "¡Te damos la bienvenida! Sigue estudiando y alcanzando tus metas 🚀",
    text: `Hola ${nombre}, ¡te damos la bienvenida! Sigue estudiando y esforzándote cada día para alcanzar tus metas.`,
    html: buildMotivationalTemplate(nombre, appUrl),
  }

  await transporter.sendMail(mailOptions)
}

function buildMotivationalTemplate(nombre: string, appUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sigue Estudiando</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Outfit',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 30px rgba(15,23,42,0.03);">

          <!-- Header strip -->
          <tr>
            <td style="background:linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%);padding:32px 40px;">
              <p style="margin:0;font-family:'Outfit',sans-serif;font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:#ffffff;opacity:.8;">User Manager</p>
              <h1 style="margin:8px 0 0;font-family:'Outfit',sans-serif;font-size:28px;font-weight:700;color:#ffffff;line-height:1.2;">
                ¡Hola, ${nombre}!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;color:#09090b;font-size:18px;font-weight:600;line-height:1.4;">
                ¡Nos alegra mucho tenerte en nuestra plataforma!
              </p>
              <p style="margin:0 0 24px;color:#3f3f46;font-size:15px;line-height:1.7;">
                Queríamos aprovechar este momento para darte una cálida bienvenida y recordarte la importancia de mantener la constancia en tu aprendizaje. El camino del estudio abre puertas increíbles, y cada pequeño paso que das te acerca más a tus sueños y metas profesionales.
              </p>

              <!-- Motivational quote card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px 28px;border-left:4px solid #0ea5e9;">
                    <p style="margin:0 0 8px;font-size:14px;font-style:italic;color:#09090b;line-height:1.6;">
                      "El aprendizaje es un tesoro que seguirá a su dueño a todas partes."
                    </p>
                    <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#71717a;">— Proverbio</p>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:#0ea5e9;">
                    <a href="${appUrl}"
                       style="display:inline-block;padding:14px 32px;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                      Ir a Estudiar Ahora
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 0;font-size:12px;color:#71717a;line-height:1.6;">
                ¡Sigue estudiando, practicando y nunca dejes de aprender! Estamos aquí para acompañarte en tu progreso.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:11px;color:#71717a;text-align:center;letter-spacing:1px;">
                USER MANAGER &nbsp;&middot;&nbsp; ${new Date().getFullYear()}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
