var mongoose = require('mongoose');
var bcrypt = require("bcrypt-nodejs");
var SALT_FACTOR = 10;

var UserSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  displayName: String,
  bio: String,
  boards: [mongoose.Schema.Types.ObjectId]
});

UserSchema.methods.name = function() {
  return this.displayName || this.username;
};

UserSchema.methods.checkPassword = function(pass, next) {
  bcrypt.compare(pass, this.password, (err, isMatch) => {
    next(err, isMatch);
  });
};

var noop = function() {};
UserSchema.pre('save', function(next){
  var user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, noop, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});


var User = mongoose.model('User', UserSchema);

module.exports = User;
