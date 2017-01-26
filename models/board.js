var mongoose = require('mongoose');


var BoardSchema = mongoose.Schema({
  name: { type: String, required: true},
  creator: {type: mongoose.Schema.Types.ObjectId, required: true },

  lists: [{
    todos: [String]
  }]
});

var Board = mongoose.model('Board', BoardSchema);

module.exports = Board;
