var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  flash = require('connect-flash'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  methodOverride = require('method-override'),
  LocalStrategy = require('passport-local'),
  User = require('./models/user'),
  commentRoutes = require('./routes/comments'),
  campgroundRoutes = require('./routes/campgrounds'),
  indexRoutes = require('./routes/index');

var url = process.env.DATABASEURL || 'mongodb://localhost/yelp_camp';

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());

// seedDB();

app.use(
  require('express-session')({
    secret: 'Hard Work is everything',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');

  next();
});

app.use('/', indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);
app.listen(process.env.PORT || 3000, process.env.IP, function () {
  console.log('The YelCamp Server has started');
});
