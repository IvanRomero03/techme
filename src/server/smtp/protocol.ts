import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import { env } from "techme/env";

export function getTransporter() {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: env.SMTP_EMAIL,
      pass: env.SMTP_PASSWORD,
    },
  });

  return transporter;
}

export async function sendMail(mail: Mail.Options) {
  const transporter = getTransporter();
  await transporter.sendMail(mail);
}

// sample
export async function sendEmailInvitation(
  email: string,
  name: string,
  role: string,
) {
  const mail: Mail.Options = {
    from: env.SMTP_EMAIL,
    to: email,
    subject: "Invitation to join TechMe",
    text: `Hello ${name}, you have been invited to join TechMe as a ${role}. Please log in into your account to accept the invitation! https://techme-pearl.vercel.app`,
  };
  await sendMail(mail);
}
