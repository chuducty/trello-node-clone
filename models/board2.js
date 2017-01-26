var mongoose = require('mongoose');
var list = require('./list');

var BoardSchema = mongoose.Schema({
  name: { type: String, required: true},
  creator: {type: mongoose.Schema.Types.ObjectId, required: true },

  lists: [list]
});

var Board = mongoose.model('Board', BoardSchema);

module.exports = Board;
