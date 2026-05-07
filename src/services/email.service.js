import nodemailer from 'nodemailer';

export const mailer = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,

  port: Number(
    process.env.EMAIL_PORT
  ),

  secure:
    process.env.EMAIL_SECURE
    === "true",

  auth: {
    user:
      process.env.EMAIL_USER,

    pass:
      process.env.EMAIL_PASSWORD,
  },
});

export const sendEmailService = async (from, to, subject, body) => {
  if (!to || !subject || !body)
    throw new Error('Missing required email fields');

  await mailer.sendMail({
    from: from || process.env.SMTP_FROM,
    to,
    subject,
    text: body,
  });
};