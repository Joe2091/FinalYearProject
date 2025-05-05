const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdBy: { type: String, required: true },
    isFavorite: { type: Boolean, default: false },
    sharedWith: { type: [String], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Note', NoteSchema);
