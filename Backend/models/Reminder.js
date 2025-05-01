const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  datetime: { type: Date, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  notified: { type: Boolean, default: false },
});

module.exports = mongoose.model('Reminder', reminderSchema);
