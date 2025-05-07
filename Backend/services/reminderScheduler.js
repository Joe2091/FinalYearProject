const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { sendReminderEmail } = require('./azureEmailService');

async function checkReminders() {
  const now = new Date();
  try {
    const reminders = await Reminder.find({
      datetime: { $lte: now },
      notified: { $ne: true },
    });

    for (const reminder of reminders) {
      const user = await User.findOne({ uid: reminder.createdBy });
      if (user && user.email) {
        const body =
          `"${reminder.title}"` +
          (reminder.content ? `\n\nDetails:\n${reminder.content}` : '');

        await sendReminderEmail(
          user.email,
          reminder.title,
          body,
          null,
          reminder.datetime,
        );

        reminder.notified = true;
        await reminder.save();
      }
    }
  } catch (err) {
    console.error('Reminder scheduler error:', err);
  }
}

if (process.env.NODE_ENV !== 'test') {
  setInterval(checkReminders, 10 * 1000);
}
