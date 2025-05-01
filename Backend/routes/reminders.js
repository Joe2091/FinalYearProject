const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const verifyToken = require('../middleware/verifyToken');

// Get all reminders for user
router.get('/', verifyToken, async (req, res) => {
  const reminders = await Reminder.find({ createdBy: req.user.uid }).sort({
    datetime: 1,
  });
  res.json(reminders);
});

// Create a reminder
router.post('/', verifyToken, async (req, res) => {
  const { title, datetime, content } = req.body;
  const newReminder = await Reminder.create({
    title,
    datetime,
    content,
    createdBy: req.user.uid,
  });
  res.status(201).json(newReminder);
});

// Update a reminder
router.put('/:id', verifyToken, async (req, res) => {
  const updated = await Reminder.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user.uid },
    req.body,
    { new: true },
  );
  res.json(updated);
});

// Delete a reminder
router.delete('/:id', verifyToken, async (req, res) => {
  await Reminder.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user.uid,
  });
  res.sendStatus(204);
});

module.exports = router;
