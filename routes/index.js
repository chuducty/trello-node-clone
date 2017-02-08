var express = require('express');
var passport = require("passport");
var router = express.Router();
var User = require("./../models/user");


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("info", "You must be logged in to see this page.");
    res.redirect("/login");
  }
}
router.get('/', (req, res) => {
  res.redirect('/login');

});

router.get("/signup", function(req, res) {
  res.render("signup");
});

router.post('/signup', (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;
  // console.log(username);
  User.findOne({username}, (err, user) => {
    if (err) { return next(err); }
    if (user) {
      req.flash("error", "User already exists");
      return res.redirect("/signup");
    }
    var newUser = new User({
      username: username,
      password: password
    });
    newUser.save(() => {
      next();
    });
  });
}, passport.authenticate("login",{
  successRedirect: "/",
  failureRedirect: "/signup",
  failureFlash: true
}));

router.get("/users/:username", function(req, res, next) {
  User.findOne({ username: req.params.username }, function(err, user) {
    if (err) { return next(err); }
    if (!user) { return next(404); }
    res.render("profile", { user: user });
  });
});

router.get("/login", function(req, res) {
  res.render("login");
});
router.post("/login", passport.authenticate("login", {
  successRedirect: "/boards",
  failureRedirect: "/login",
  failureFlash: true
}));
router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/login");
});

router.get('/edit', ensureAuthenticated, (req, res) => {
  res.render('edit');
});
router.post('/edit', ensureAuthenticated, (req, res, next) => {
  req.user.displayName = req.body.displayname;
  req.user.bio = req.body.bio;
  req.user.save(function(err) {
    if (err) {
      next(err);
      return;
    }
    req.flash("info", "Profile updated!");
    res.redirect(`/users/${req.user.username}`);
  });
});

module.exports = router;
