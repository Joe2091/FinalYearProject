jest.mock('@azure/communication-email', () => {
  return {
    EmailClient: jest.fn().mockImplementation(() => ({
      beginSend: jest.fn().mockResolvedValue({
        pollUntilDone: jest.fn().mockResolvedValue({ status: 'Succeeded' }),
      }),
    })),
  };
});

const { sendReminderEmail } = require('../services/azureEmailService');

describe('sendReminderEmail', () => {
  const to = 'testreminder@example.com';
  const subject = 'Test Subject';
  const body = 'This is a test reminder body';

  it('should send an email and log status', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await sendReminderEmail(to, subject, body);

    expect(consoleSpy).toHaveBeenCalledWith('Email send status:', 'Succeeded');
    consoleSpy.mockRestore();
  });

  it('should catch and log an error if sending fails', async () => {
    const error = new Error('Failed to send');
    const EmailClientMock = require('@azure/communication-email').EmailClient;
    EmailClientMock.mockImplementation(() => ({
      beginSend: jest.fn().mockRejectedValue(error),
    }));

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await sendReminderEmail(to, subject, body);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending email:', error);
    consoleErrorSpy.mockRestore();
  });
});
