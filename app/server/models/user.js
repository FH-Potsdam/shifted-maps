var mongoose = require('../services/mongoose');

var userSchema = new mongoose.Schema({
  _id: Number,
  accessToken: { type: String, select: false },
  refreshToken: { type: String, select: false },
  expiresAt: Date,
  places: [{ type: Number, ref: 'Place' }],
  firstDate: Date,
  __v: { type: Number, select: false }
});

module.exports = mongoose.model('User', userSchema);