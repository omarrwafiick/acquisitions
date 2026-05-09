import nodemailer from 'nodemailer';

export const mailer = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,

  port: Number(process.env.EMAIL_PORT),

  secure: process.env.EMAIL_SECURE === 'true',

  auth: {
    user: process.env.EMAIL_USER,

    pass: process.env.EMAIL_PASSWORD,
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

export const vendorEmailBodyBuilder = payload => {
  const { vendor, purchaseOrder } = payload;
  return `
    Dear ${vendor.name || 'Partner'},

    You have received a new official Purchase Order.

    Purchase Order Details:
    - PO ID: ${purchaseOrder.id}
    - Status: SENT
    - Total Amount: ${purchaseOrder.total_amount}

    This order has been issued by our procurement team. Please review the attached details and confirm receipt.

    Next Steps:
    1. Acknowledge receipt of this Purchase Order
    2. Confirm estimated delivery timeline
    3. Contact us if any clarification is needed

    We look forward to your prompt response.

    Best regards,
    Procurement Team
  `;
};
