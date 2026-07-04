import nodemailer from "nodemailer";
import { config } from "../config/env.js";

let transporter: nodemailer.Transporter | null = null;

if (config.smtp.host && config.smtp.user && config.smtp.pass) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
}

export async function sendMail(to: string, subject: string, text: string, html?: string) {
  if (!transporter) {
    console.log("Mailer not configured, skipping email to", to, subject);
    return;
  }
  await transporter.sendMail({ from: config.smtp.fromEmail, to, subject, text, html });
}
