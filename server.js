var express = require('express');
var morgan = require('morgan');
var path = require('path');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var index = require('./routes/index');
var boards = require('./routes/boards');

var bodyParser = require('body-parser');
var cookieParser = require("cookie-parser");
var session = require("express-session");
var flash = require("connect-flash");
var passport = require("passport");
var setUpPassport = require("./setuppassport");
var port = process.env.PORT || 3000;
var app = express();
app.use(morgan('dev'));
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trello');
setUpPassport();

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//Set static folder
app.use(express.static(path.join(__dirname, 'client')));

//Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
  secret: "TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX",
  resave: true,
  saveUninitialized: true
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  //console.log('ahihi');
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});
app.use('/', index)
app.use('/boards', boards)

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
