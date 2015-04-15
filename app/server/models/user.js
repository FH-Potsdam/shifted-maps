var mongoose = require('../services/mongoose'),
  //moves = require('../services/moves'),
  moment = require('moment');

var userSchema = new mongoose.Schema({
  _id: Number,
  accessToken: String,
  refreshToken: String,
  expiresAt: Date,
  valid: { type: Boolean, 'default': true },
  token: String
});

userSchema.methods.expiresIn = function(expiresIn) {
  this.expiresAt = moment().add(expiresIn, 'seconds').toDate();
};

/*User.prototype.updateAccess = function(access) {
  user.accessToken = access.accessToken;
  user.refreshToken = access.refreshToken;
  user.expiresAt = moment().add(access.expiresIn, 'seconds').toDate();
};

User.prototype.refreshAccess = function(callback) {
  var user = this;

  moves.refresh_token(user.refreshToken, function(error, response, body) {
    if (!error) {
      user.updateAccess({
        accessToken: body.access_token,
        refreshToken: body.refresh_token,
        expiresIn: body.expires_in
      });
    } else {
      user.valid = false;
    }

    callback(error, response, body);
  });
};*/

module.exports = mongoose.model('User', userSchema);