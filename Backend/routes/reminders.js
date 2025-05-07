const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Reminder = require('../models/Reminder');
const verifyToken = require('../middleware/verifyToken');

// Prevents the use of invalid MongoDB IDs
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// All reminders for the logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const reminders = await Reminder.find({ createdBy: req.user.uid }).sort({
      datetime: 1,
    });
    res.json(reminders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching reminders' });
  }
});

// Create a Reminder
router.post('/', verifyToken, async (req, res) => {
  const { title, datetime, content } = req.body;

  if (typeof title !== 'string' || title.trim() === '') {
    return res
      .status(400)
      .json({ message: 'Title must be a non-empty string' });
  }

  if (!datetime || isNaN(new Date(datetime))) {
    return res.status(400).json({ message: 'Invalid datetime format' });
  }

  if (content && typeof content !== 'string') {
    return res.status(400).json({ message: 'Content must be a string' });
  }

  try {
    const newReminder = await Reminder.create({
      title: title.trim(),
      datetime: new Date(datetime),
      content: content?.trim(),
      createdBy: req.user.uid,
    });
    res.status(201).json(newReminder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating reminder' });
  }
});

// Update a reminder
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, datetime, content } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid reminder ID' });
  }

  if (!title && !datetime && !content) {
    return res
      .status(400)
      .json({ message: 'At least one field is required to update' });
  }

  try {
    const updated = await Reminder.findOneAndUpdate(
      { _id: id, createdBy: req.user.uid },
      { title, datetime, content },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating reminder' });
  }
});

// Reminder ID is validated before deleting
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid reminder ID' });
  }

  try {
    const deleted = await Reminder.findOneAndDelete({
      _id: id,
      createdBy: req.user.uid,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting reminder' });
  }
});

module.exports = router;
