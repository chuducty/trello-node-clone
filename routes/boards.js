const express = require('express');
const passport = require("passport");
const mongoose = require('mongoose');
const router = express.Router();
const User = require("./../models/user");
const Board = require("./../models/board");


router.param('board_id', (req, res, next, id) => {
  id = id.trim();
  var id_reg = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i ;
  if (!id_reg.test(id)){
    return res.status(404).send('huhu wrong id');
  }
  next();
});
router.param('list_id', (req, res, next, id) => {
  id = id.trim();
  var id_reg = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i ;
  if (!id_reg.test(id)){
    return res.status(404).send('huhu wrong id');
  }
  next();
});
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("error", "You must be logged in to see this page.");

    res.redirect("/login");
  }
};

function ensureMember(req, res, next) {
  var board_id = req.params.board_id || req.body.board_id;
  if (!board_id){
    req.flash('error', 'You are not member of this group');
    return res.redirect('/boards');
  }
  Board.findById(board_id).then((board) => {
    if (!board){
      return res.send('no board found ahuhu');
    }
    //console.log(board);
    //console.log(req.user._id);
    //console.log(board.containMember(req.user._id));
    if (!board.containMember(req.user._id)) {
      req.flash('error', 'You are not member of this group');
      return res.redirect('/boards');
    }
    next();
  }).catch((e) => {
    console.log(e);
    next(e);
  })
}
// function ensureMember(req, res, next) {
//   Board.find({members: req.user._id}).then((board) => {
//     console.log(board);
//     if (board === undefined || board === null) {
//       req.flash("error", "You are not a member in this group. Ask the admin plz");
//       return res.redirect(`/boards`);
//     }
//     next();
//   }).catch((e) => {
//     console.log(e);
//     next(e);
//   })
//
// };


/////////// Board API //////////////
////////////////////////////////////
router.get('/', ensureAuthenticated, (req, res, next) => {
  Board.find({$or: [{creator: req.user._id}, {members: req.user._id}]}).sort({_id:-1}).then((boards) => {
    res.render('boards',{boards});
  });
});

router.get('/board/:board_id/members', ensureAuthenticated, ensureMember, (req, res, next) => {
  //res.send('ahihi');
  var board_id = req.params.board_id.trim();
  Board.findById(board_id).then((board) => {
    return User.findById(board.creator).then((user) => {
      //console.log(board);
      var tmp = []
      board.members.forEach(function(member_id){
        tmp.push(User.findById(member_id));
      })

      return Promise.all(tmp).then((members) => {
        res.render('board_members', {members: members , creator: user, board: board});
      })
    });
  }).catch((e) => {
    console.log(e);
    next(e);
  });
})
router.post('/board/:board_id/members/delete', ensureAuthenticated, ensureMember, (req, res, next) => {
  var board_id = req.params.board_id;
  var member_id = req.body.member_id;
  Board.findByIdAndUpdate(board_id,
    {
      $pull : { members: member_id}
    }, {new: true}).exec().then((board) => {
      console.log(board);
      req.flash('info','Successfully Delete The user ')
      res.redirect(`/boards/board/${board._id}/members`);
    }).catch((e) => {
      console.log(e);
      next(e);
    });
})
router.get('/board/:board_id', ensureAuthenticated, ensureMember, (req, res, next) => {
  var id = req.params.board_id.trim();
  //console.log(id);
  Board.findById(id).then((board) => {
    //console.log(board);
    // if (!board){
    //   return res.send('no board found ahuhu');
    // }
    // if (!board.containMember(req.user._id)) {
    //   req.flash('error', 'You are not member of this group');
    //   return res.redirect('/boards');
    // }
    //console.log(req.user._id);
    var isCreator = board.creator.equals(req.user._id) ? true : false
    // console.log(`${req.user._id}`);
    // console.log(`${board.creator}`);
    // console.log(board.creator === req.user._id);
    // console.log(`Is creator : ${isCreator}`);
    return res.render('board', {board, isCreator});
  }).catch((e) => {
    console.log(e);
    next(e);
  })
});
// router.get('/board/:board_id/:list_id', (req, res, next) => {
//   res.send('Wrong place');
// })

router.post('/board/create', ensureAuthenticated, (req, res, next) => {
  //res.send(req.body.name);
  var new_board = new Board();
  new_board.name = req.body.name;
  // testing only;
  new_board.creator = req.user._id;
  new_board.save().then((board) => {
    //console.log(board);
    return res.redirect('/boards');
  }).catch((e) => {
    console.log(e);
    next(e);
  })
});

router.post('/board/addMember', ensureAuthenticated, ensureMember, (req, res, next) => {
  //console.log(req.body.name);
  var username = req.body.name;
  var board_id = req.body.board_id;
  //console.log(board_id);
  User.findOne({username: req.body.name}).then((user) => {

    if (user === undefined || user === null) {
      req.flash("error", "No user has found");
      return res.redirect(`/boards/board/${board_id}`);
    }
    //console.log('test');
    Board.findByIdAndUpdate(req.body.board_id,
      {
        $addToSet: { members: user._id}
      }, {new: true}).exec().then((board) => {
        //console.log('test');
        console.log(board);
        req.flash('info','Successfully added to ')
        res.redirect(`/boards/board/${board._id}`);
      });
  }).catch((e) => {
    console.log(e);
    next(e);
  })

});

///////////////////////////////////
/////////// List API //////////////
///////////////////////////////////
router.post('/list/create', ensureAuthenticated, ensureMember, (req, res, next) => {
  var board_id = req.body.board_id;

  //create a new list
  var new_list = {};
  new_list._id = mongoose.Types.ObjectId(); // new id
  new_list.name = req.body.name;

  Board.findByIdAndUpdate(board_id,
    {
      //append to the beginning of the array
      $push: { lists: { $each: [new_list], $position:0} }
    },{new: true}).exec().then((board) => {
      console.log(board);
      res.redirect(`/boards/board/${board._id}`);
    }).catch((e) => {
      console.log(e);
      next(e);
    })
});
router.post('/list/delete', ensureAuthenticated, ensureMember, (req, res, next) => {
  var board_id = req.body.board_id.trim();
  var list_id = req.body.list_id.trim();
  Board.findByIdAndUpdate(board_id,
    {
      $pull: { lists: { _id: list_id} }
    },{new: true}).exec().then((board) => {
      console.log(board);
      res.redirect(`/boards/board/${board._id}`);
    }).catch((e) => {
      console.log(e);
      next(e);
    });
});

///////////////////////////////////
/////////// Todo API //////////////
///////////////////////////////////
router.post('/todo/create', ensureAuthenticated, ensureMember, (req, res, next) => {
  var board_id = req.body.board_id.trim();
  var list_id = req.body.list_id.trim();
  var new_todo = {}
  new_todo._id = mongoose.Types.ObjectId();
  new_todo.describe = req.body.name.trim();
  Board.findOneAndUpdate(

      {'lists._id' : list_id},
      { $push: { 'lists.$.todos': new_todo} },
      {new: true}
    ).exec().then((board) => {
      console.log(board);
      res.redirect(`/boards/board/${board._id}`);
    }).catch((e) => {
      console.log(e);
      next(e);
    });
});

router.post('/todo/delete', ensureAuthenticated, ensureMember, (req, res, next) => {
  // console.log(req.body.list_id);
  // console.log('ahihi');
  var board_id = req.body.board_id.trim();
  var list_id = req.body.list_id.trim();
  var todo_id = req.body.todo_id.trim();

  Board.findOneAndUpdate(

      {'lists._id' : list_id},
      { $pull: { 'lists.$.todos': {_id: todo_id} } },
      {new: true}
    ).exec().then((board) => {
      //console.log(board);
      res.redirect(`/boards/board/${board._id}`);
    }).catch((e) => {
      console.log(e);
      next(e);
    });
});

///////////////////////////////////
/////////// Login API //////////////
///////////////////////////////////
// router.get('/login', (req, res, next) => {
//   res.render('board_login');
// });
// router.post("/login", passport.authenticate("login", {
//   successRedirect: "/boards",
//   failureRedirect: "/boards/login",
//   failureFlash: true
// }));

router.get('/test', (req, res, next) => {
  // Board.findById('588905e5c12e530b52643369').then((b) => {
  //   b.lists.findById('588905e5c12e530b5264336a').then((t) => {
  //     res.send(t.todos);
  //   })
  // })
  var id1 = mongoose.Types.ObjectId();
  var id2 = mongoose.Types.ObjectId();
  console.log(id1)
  res.send(`${id1} ${id2}`);

  // var tmp = new Board();
  // tmp.name = 'Test Board 3';
  // tmp.creator = '587a0c4571501521f2a2352a';
  // //var tmp_todos = ['An', 'Uong', 'Dai', 'Ia','Coding'];
  // var tmp_todos = [{"describe":"An"},{"describe":"Uong"},{"describe":"Ia"}];
  // var tmp_obj = {};
  // tmp_obj.todos = tmp_todos;
  // tmp_obj.name = 'Daily Jobs';
  // tmp.lists = [];
  // tmp.lists.push(tmp_obj);
  // tmp.lists.push(tmp_obj);
  // tmp.save().then(() => {
  //   res.send('Succesfully add');
  // }).catch((e) => {
  //   console.log(e);
  //   res.send(e);
  // })


});
router.use((req,res,next) => {
  res.send('404 Not FOUND :(');
})

// Error router
router.use((err,req,res,next) => {
  console.log(err);
  res.send('Some err :( ');
});
module.exports = router;
