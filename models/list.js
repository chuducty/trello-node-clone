var mongoose = require('mongoose');

var ListSchema = mongoose.Schema({
  todos: [String]
});

var List = mongoose.model('List', ListSchema);
module.exports = List;
