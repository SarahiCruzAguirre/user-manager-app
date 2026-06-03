import nodemailer from "nodemailer";

/**
 * Función encargada de despachar el correo electrónico premium de bienvenida.
 * Utiliza el protocolo seguro OAuth2 autorizado por Google Cloud Console.
 */
export async function sendWelcomeEmail(email: string, nombre: string, passwordPlano: string) {
  
  // Configuramos el transporte especializado utilizando las credenciales de Google Cloud
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2", // Indicamos expresamente que usaremos el flujo de tokens OAuth2
      user: process.env.GMAIL_USER, // Tu dirección de correo emisora
      clientId: process.env.OAUTH_CLIENT_ID, // ID obtenido en la consola de Google Cloud
      clientSecret: process.env.OAUTH_CLIENT_SECRET, // Secreto de cliente del Cloud Console
      refreshToken: process.env.OAUTH_REFRESH_TOKEN, // Token permanente de autorenovación del Playground
    },
  });

  // Estructura visual premium en HTML con diseño Glassmorphism flotante oscuro
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap');
        body {
          margin: 0; padding: 0; background-color: #0d0d0e; font-family: 'Plus Jakarta Sans', sans-serif; color: #e4e4e7;
        }
        .container {
          max-width: 600px; margin: 40px auto; padding: 32px; background: rgba(23, 23, 27, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; text-align: center;
        }
        .logo {
          font-weight: 700; font-size: 24px; letter-spacing: -1px; color: #ffffff; margin-bottom: 24px;
        }
        .title {
          font-size: 28px; font-weight: 600; color: #ffffff; margin-bottom: 8px; letter-spacing: -0.5px;
        }
        .subtitle {
          font-size: 15px; color: #a1a1aa; margin-bottom: 32px;
        }
        .credentials-box {
          background: rgba(255, 255, 255, 0.03); border: 1px dashed rgba(255, 255, 255, 0.15);
          border-radius: 16px; padding: 20px; margin: 24px 0; text-align: left;
        }
        .credential-item {
          margin: 10px 0; font-size: 14px;
        }
        .label { color: #71717a; font-weight: 500; }
        .value { color: #f4f4f5; font-weight: 600; font-family: monospace; }
        .btn {
          display: inline-block; padding: 14px 28px; background: #ffffff; color: #000000;
          text-decoration: none; font-weight: 600; border-radius: 12px; font-size: 14px; margin-top: 16px;
        }
        .footer {
          margin-top: 32px; font-size: 12px; color: #52525b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">NEXUS // USER</div>
        <div class="title">¡Bienvenido al sistema, ${nombre}!</div>
        <div class="subtitle">Tu cuenta ha sido creada exitosamente con credenciales Cloud Autorizadas.</div>
        
        <div class="credentials-box">
          <div class="credential-item">
            <span class="label">Usuario de Acceso (Email):</span> <span class="value">${email}</span>
          </div>
          <div class="credential-item">
            <span class="label">Contraseña Temporal:</span> <span class="value">${passwordPlano}</span>
          </div>
        </div>

        <a href="https://vercel.com" class="btn">Acceder al Sistema</a>
        
        <div class="footer">
          Este correo electrónico fue despachado mediante una integración segura de Google Cloud Console API.
        </div>
      </div>
    </body>
    </html>
  `;

  // Despachamos el correo configurando remitente cifrado y destinatario final
  await transporter.sendMail({
    from: `"Nexus Cloud Services" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "✨ Acceso Autorizado — Credenciales de tu Cuenta Nexus",
    html: htmlContent,
  });
}