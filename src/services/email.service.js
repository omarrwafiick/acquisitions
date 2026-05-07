import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmailService = async (from, to, subject, body) => {
    if (!to || !subject || !body)
        throw new Error('Missing required email fields');

    await transporter.sendMail({
        from: from || process.env.SMTP_FROM,
        to,
        subject,
        text: body,
    });
};