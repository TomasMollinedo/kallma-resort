/**
 * Servicio de Email
 * Maneja el envío de correos electrónicos usando Nodemailer
 */

import nodemailer from "nodemailer";
import { config } from "../config/index.js";

/**
 * Crea y configura el transportador de correo electrónico.
 * Usa las credenciales configuradas en las variables de entorno.
 * @returns {Object} Transportador de Nodemailer configurado
 */
const crearTransportador = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure, // true para puerto 465, false para otros puertos
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });
};

/**
 * Envía un correo electrónico de respuesta a una consulta de cliente.
 * @param {Object} params - Parámetros del correo
 * @param {string} params.emailDestinatario - Email del cliente que hizo la consulta
 * @param {string} params.nombreCliente - Nombre del cliente
 * @param {string} params.tituloConsulta - Título de la consulta original
 * @param {string} params.mensajeCliente - Mensaje original del cliente
 * @param {string} params.respuestaOperador - Respuesta del operador/administrador
 * @param {string} params.nombreOperador - Nombre del operador que respondió
 * @returns {Promise<Object>} Información del correo enviado
 */
export const enviarRespuestaConsulta = async ({
  emailDestinatario,
  nombreCliente,
  tituloConsulta,
  mensajeCliente,
  respuestaOperador,
  nombreOperador,
}) => {
  try {
    const transportador = crearTransportador();

    const asunto = `Respuesta a su consulta: ${tituloConsulta || "Sin título"}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Respuesta a su consulta</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #2c5f2d;
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 30px -30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .seccion {
            margin-bottom: 25px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #2c5f2d;
            border-radius: 4px;
          }
          .seccion h3 {
            margin-top: 0;
            color: #2c5f2d;
            font-size: 16px;
          }
          .seccion p {
            margin: 10px 0 0 0;
            white-space: pre-wrap;
          }
          .respuesta {
            background-color: #e8f5e9;
            border-left-color: #4caf50;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .firma {
            margin-top: 20px;
            font-style: italic;
            color: #555;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏕️ Kallma Resort</h1>
            <p style="margin: 10px 0 0 0;">Respuesta a su consulta</p>
          </div>
          
          <p>Hola <strong>${nombreCliente}</strong>,</p>
          <p>Hemos recibido su consulta y queremos darle una respuesta:</p>
          
          <div class="seccion">
            <h3>📝 Su consulta original:</h3>
            ${tituloConsulta ? `<p><strong>Asunto:</strong> ${tituloConsulta}</p>` : ""}
            <p><strong>Mensaje:</strong></p>
            <p>${mensajeCliente}</p>
          </div>
          
          <div class="seccion respuesta">
            <h3>💬 Nuestra respuesta:</h3>
            <p>${respuestaOperador}</p>
          </div>
          
          <p class="firma">Atentamente,<br><strong>${nombreOperador}</strong><br>Equipo de Kallma Resort</p>
          
          <div class="footer">
            <p>Este es un correo automático, por favor no responda a este mensaje.</p>
            <p>Si tiene más consultas, puede contactarnos a través de nuestra página web.</p>
            <p>&copy; ${new Date().getFullYear()} Kallma Resort. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Kallma Resort - Respuesta a su consulta

Hola ${nombreCliente},

Hemos recibido su consulta y queremos darle una respuesta:

SU CONSULTA ORIGINAL:
${tituloConsulta ? `Asunto: ${tituloConsulta}\n` : ""}
Mensaje: ${mensajeCliente}

NUESTRA RESPUESTA:
${respuestaOperador}

Atentamente,
${nombreOperador}
Equipo de Kallma Resort

---
Este es un correo automático, por favor no responda a este mensaje.
Si tiene más consultas, puede contactarnos a través de nuestra página web.
© ${new Date().getFullYear()} Kallma Resort. Todos los derechos reservados.
    `;

    const infoCorreo = await transportador.sendMail({
      from: `"Kallma Resort" <${config.email.from}>`,
      to: emailDestinatario,
      subject: asunto,
      text: textContent,
      html: htmlContent,
    });

    console.log("Correo enviado exitosamente:", infoCorreo.messageId);
    return infoCorreo;
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    throw new Error("Error al enviar el correo electrónico");
  }
};

/**
 * Envía un correo de prueba para verificar la configuración.
 * @param {string} emailDestino - Email de destino para la prueba
 * @returns {Promise<Object>} Información del correo enviado
 */
export const enviarCorreoPrueba = async (emailDestino) => {
  try {
    const transportador = crearTransportador();

    const infoCorreo = await transportador.sendMail({
      from: `"Kallma Resort" <${config.email.from}>`,
      to: emailDestino,
      subject: "Prueba de configuración de correo - Kallma Resort",
      text: "Este es un correo de prueba para verificar la configuración del servicio de email.",
      html: "<p>Este es un correo de prueba para verificar la configuración del servicio de email.</p>",
    });

    console.log("Correo de prueba enviado:", infoCorreo.messageId);
    return infoCorreo;
  } catch (error) {
    console.error("Error al enviar correo de prueba:", error);
    throw error;
  }
};
