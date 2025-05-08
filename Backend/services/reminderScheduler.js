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
        const localTime = new Date(reminder.datetime).toLocaleString('en-IE', {
          timeZone: 'Europe/Dublin',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

        const body =
          `"${reminder.title}"\n\nDue: ${localTime}` +
          (reminder.content ? `\n\nDetails:\n${reminder.content}` : '');

        await sendReminderEmail(
          user.email,
          reminder.title,
          body,
          null,
          localTime,
          reminder,
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

module.exports = { checkReminders };
