const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { sendReminderEmail } = require('./azureEmailService'); //email function using Azure

//Function checking for due reminders to send email notification
async function checkReminders() {
  const now = new Date(); //get current date/time
  try {
    //Find all reminders that are due and not notified
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

        //reminder notified field set to true to avoid repeat notifications.
        reminder.notified = true;
        await reminder.save();

        // reminder email sent using Azure Commmunication Services
        await sendReminderEmail(
          user.email,
          `Reminder: ${reminder.title}`,
          body,
          null,
          localTime,
          reminder,
        );
      }
    }
  } catch (err) {
    console.error('Reminder scheduler error:', err);
  }
}

// check every 10 seconds for reminder (unless testing)
if (process.env.NODE_ENV !== 'test') {
  setInterval(checkReminders, 10 * 1000);
}

module.exports = { checkReminders };
