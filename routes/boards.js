const express = require('express');
const passport = require("passport");
const router = express.Router();
const User = require("./../models/user");
const Board = require("./../models/board");
router.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});

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
    req.flash("info", "You must be logged in to see this page.");
    res.redirect("/login");
  }
};
router.get('/', (req, res, next) => {
  Board.find().then((boards) => {
    res.render('boards',{boards});
  });
});

router.get('/board/:board_id', (req, res, next) => {
  var id = req.params.board_id.trim();
  Board.findById(id).then((board) => {
    if (!board){
      return res.send('no board found ahuhu');
    }
    res.render('board', {board});
  })
});
router.get('/board/:board_id/:list_id', (req, res, next) => {
  res.send('Wrong place');
})
router.post('/delete/:board_id/:list_id', (req, res, next) => {
  var board_id = req.params.board_id.trim();
  var list_id = req.params.list_id.trim();
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

router.get('/test', (req, res, next) => {
  // Board.findById('588905e5c12e530b52643369').then((b) => {
  //   b.lists.findById('588905e5c12e530b5264336a').then((t) => {
  //     res.send(t.todos);
  //   })
  // })

  // res.send('ahihi');
  // var tmp = new Board();
  // tmp.name = 'Test Board 3';
  // tmp.creator = '587a0c4571501521f2a2352a';
  // var tmp_todos = ['An', 'Uong', 'Dai', 'Ia','Coding'];
  // var tmp_obj = {};
  // tmp_obj.todos = tmp_todos;
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
  res.send('Some err :( ');
});
module.exports = router;
