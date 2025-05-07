jest.mock('../models/Reminder');
jest.mock('../models/User');
jest.mock('../services/azureEmailService', () => ({
  sendReminderEmail: jest.fn(),
}));

const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { sendReminderEmail } = require('../services/azureEmailService');
const { checkReminders } = require('../services/reminderScheduler');

describe('checkReminders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send emails for due reminders and mark them notified', async () => {
    const fakeReminder = {
      title: 'Test Reminder',
      content: 'Test Content',
      createdBy: 'test-user',
      notified: false,
      save: jest.fn(),
    };

    const fakeUser = {
      uid: 'test-user',
      email: 'testuser@example.com',
    };

    Reminder.find.mockResolvedValue([fakeReminder]);
    User.findOne.mockResolvedValue(fakeUser);

    await checkReminders();

    expect(User.findOne).toHaveBeenCalledWith({ uid: 'test-user' });
    expect(sendReminderEmail).toHaveBeenCalledWith(
      fakeUser.email,
      fakeReminder.title,
      expect.stringContaining('Test Content'),
      null,
      undefined,
    );
    expect(fakeReminder.save).toHaveBeenCalled();
  });

  it('should not send email if user not found', async () => {
    Reminder.find.mockResolvedValue([
      { createdBy: 'test-user', save: jest.fn() },
    ]);
    User.findOne.mockResolvedValue(null);

    await checkReminders();

    expect(sendReminderEmail).not.toHaveBeenCalled();
  });

  it('should handle and log errors gracefully', async () => {
    Reminder.find.mockRejectedValue(new Error('DB fail'));

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await checkReminders();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Reminder scheduler error:',
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it('should do nothing if there are no due reminders', async () => {
    Reminder.find.mockResolvedValue([]);
    await checkReminders();
    expect(sendReminderEmail).not.toHaveBeenCalled();
  });
});
