const { EmailClient } = require('@azure/communication-email');
require('dotenv').config();

const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;

async function sendReminderEmail(
  to,
  subject,
  body,
  htmlBody,
  localizedTime,
  reminder,
) {
  const emailClient = new EmailClient(connectionString);

  const message = {
    senderAddress: process.env.AZURE_SENDER_EMAIL,
    content: {
      subject,
      plainText: body,
      html:
        htmlBody ||
        `
         <h2 style="color: #6a1b9a;">Reminder: ${subject}</h2>
         <p><strong>Due:</strong> ${localizedTime}</p>
         <p>${reminder.content?.replace(/\n/g, '<br>') || ''}</p>
        <hr />
        <footer style="font-size: 12px; color: #888;">Sent by Notemax</footer>
        `,
    },
    recipients: {
      to: [{ address: to, displayName: 'Reminder Recipient' }],
    },
  };

  try {
    const poller = await emailClient.beginSend(message);
    const response = await poller.pollUntilDone();
    console.log('Email send status:', response.status);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = { sendReminderEmail };
