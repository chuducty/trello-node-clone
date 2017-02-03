var mongoose = require('mongoose');


var BoardSchema = mongoose.Schema({
  name: { type: String, required: true},
  creator: {type: mongoose.Schema.Types.ObjectId, required: true },
  members : [mongoose.Schema.Types.ObjectId],
  lists: [{
    name:String,
    todos: [{
      describe: String
    }]
  }]
});

BoardSchema.methods.containMember = function(member_id){

  var a = this;
  if (a.creator.equals(member_id)){
    return true;
  }

  for (var i = 0; i < a.members.length; i++) {
    //console.log(`members: ${a.members[i]}`);
        if (a.members[i].equals(member_id)) {
            return true;
        }
    }
  return false;
};

var Board = mongoose.model('Board', BoardSchema);

module.exports = Board;
