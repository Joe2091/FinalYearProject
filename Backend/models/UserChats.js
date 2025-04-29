const mongoose = require('mongoose');

const userChatsSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  chats: { type: Array, default: [] },
});

module.exports = mongoose.model('UserChats', userChatsSchema);
