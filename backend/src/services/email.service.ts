import { Resend } from 'resend';
import { env } from '../utils/env';
import type { Reservation, Room } from '../types';

// Create Resend client
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface EmailData {
  reservation: Reservation;
  room: Room;
}

/**
 * Generate .ics calendar file content
 */
function generateICS(data: EmailData): string {
  const { reservation, room } = data;
  const startDate = new Date(reservation.start);
  const endDate = new Date(reservation.end);

  // Format dates for ICS (YYYYMMDDTHHmmssZ)
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//${env.COMPANY_NAME}//Reservas//ES
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
DTSTAMP:${formatICSDate(new Date())}
UID:${reservation._id}@${env.COMPANY_NAME.toLowerCase().replace(/\s/g, '')}
SUMMARY:Reserva: ${room.name}
DESCRIPTION:Reserva de ${room.name} para ${reservation.fullName}
LOCATION:${room.name}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Recordatorio: Reserva de ${room.name} en 15 minutos
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

/**
 * Generate HTML email template for confirmation
 */
function generateConfirmationEmail(data: EmailData, cancelToken: string): string {
  const { reservation, room } = data;
  const startDate = new Date(reservation.start);
  const endDate = new Date(reservation.end);

  const cancelUrl = `${env.FRONTEND_URL}/api/cancel?token=${cancelToken}`;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Reserva</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">✓ Reserva Confirmada</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
                Hola <strong>${reservation.fullName}</strong>,
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; color: #666666; line-height: 1.5;">
                Tu reserva ha sido confirmada exitosamente. A continuación encontrarás los detalles:
              </p>

              <!-- Reservation Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; overflow: hidden; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #667eea; font-size: 22px;">${room.name}</h2>

                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666666; width: 120px;">
                          📅 Fecha:
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: 600;">
                          ${formatDate(startDate)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">
                          🕐 Hora inicio:
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: 600;">
                          ${formatTime(startDate)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">
                          🕐 Hora fin:
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: 600;">
                          ${formatTime(endDate)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">
                          👥 Capacidad:
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333333; font-weight: 600;">
                          ${room.capacity} personas
                        </td>
                      </tr>
                    </table>

                    ${room.description ? `
                    <p style="margin: 20px 0 0; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #666666; line-height: 1.5;">
                      ${room.description}
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>

              <!-- Action Buttons -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td align="center" style="padding: 10px 0;">
                    <a href="${cancelUrl}" style="display: inline-block; padding: 14px 30px; background-color: #dc3545; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; text-align: center;">
                      Cancelar Reserva
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Info Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #e7f3ff; border-left: 4px solid #2196F3; border-radius: 4px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #0d47a1; line-height: 1.6;">
                      <strong>📎 Adjunto:</strong> Encontrarás un archivo .ics adjunto para agregar esta reserva a tu calendario.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                ${env.COMPANY_NAME}
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send confirmation email with calendar attachment using Resend
 */
export async function sendConfirmationEmail(data: EmailData): Promise<void> {
  if (!resend) {
    console.warn('⚠️  Resend not configured. Email not sent.');
    return;
  }

  try {
    const { reservation, room } = data;

    // Generate cancel token (simple implementation - you should use JWT or similar in production)
    const cancelToken = Buffer.from(`${reservation._id}:${reservation.email}`).toString('base64');

    // Generate ICS file
    const icsContent = generateICS(data);

    // Send email with Resend
    await resend.emails.send({
      from: `${env.COMPANY_NAME} <${env.FROM_EMAIL}>`,
      to: reservation.email,
      subject: `✓ Confirmación de Reserva - ${room.name}`,
      html: generateConfirmationEmail(data, cancelToken),
      attachments: [
        {
          filename: 'reserva.ics',
          content: Buffer.from(icsContent),
        },
      ],
    });

    console.log(`✅ Email sent to ${reservation.email}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Don't throw - we don't want to fail the reservation if email fails
  }
}

/**
 * Send cancellation confirmation email
 */
export async function sendCancellationEmail(email: string, room: Room, start: Date): Promise<void> {
  if (!resend) {
    console.warn('⚠️  Resend not configured. Email not sent.');
    return;
  }

  try {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    };

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reserva Cancelada</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; background-color: #dc3545; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Reserva Cancelada</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">
                Tu reserva de <strong>${room.name}</strong> para el <strong>${formatDate(start)}</strong> ha sido cancelada exitosamente.
              </p>
              <p style="margin: 0; font-size: 14px; color: #666666;">
                Si tienes alguna pregunta, no dudes en contactarnos.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; font-size: 14px; color: #666666;">${env.COMPANY_NAME}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    await resend.emails.send({
      from: `${env.COMPANY_NAME} <${env.FROM_EMAIL}>`,
      to: email,
      subject: `Reserva Cancelada - ${room.name}`,
      html,
    });

    console.log(`✅ Cancellation email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error);
  }
}
