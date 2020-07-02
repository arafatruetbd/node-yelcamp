var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  flash = require('connect-flash'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  methodOverride = require('method-override'),
  LocalStrategy = require('passport-local'),
  User = require('./models/user'),
  moment=require('moment')
  Flash = require('./utils/Flash'),
  commentRoutes = require('./routes/comments'),
  campgroundRoutes = require('./routes/campgrounds'),
  indexRoutes = require('./routes/index');

var url = process.env.DATABASEURL || 'mongodb://localhost/yelpCamp_v1';

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
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
  res.locals.moment= time=> moment(time).fromNow()
  next();
});

app.use('/', indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);

//error handle
app.use((req, res, next) => {
  let error = new Error('404 Page Not Found');
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  if (error.status == 404) {
    return res.render('error/404');
  }
  console.log(error);
  return res.render('error/500');
});

app.listen(process.env.PORT || 3000, process.env.IP, function () {
  console.log('The YelCamp Server has started on PORT');
});
