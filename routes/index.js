const router = require('express').Router();
var middleware = require('../middleware');
var passport = require('passport');
var User = require('../models/user');
const Flash = require('../utils/Flash');
const { validationResult } = require('express-validator');
const errorFormatter = require('../utils/validationErrorFormatter');
const registerValidator = require('../validator/authValidator/signupValidator');
const loginValidator = require('../validator/authValidator/loginValidator');

//root route
router.get('/', function (req, res) {
  res.render('landing', {
    flashMessage: Flash.getMessage(req),
  });
});

// show register form
router.get('/register', middleware.isLogged, (req, res) => {
  res.render('register', {
    error: {},
    value: {},
    flashMessage: Flash.getMessage(req),
  });
});

//handle sign up logic
router.post('/register', middleware.isLogged, registerValidator, (req, res) => {
  const { username, password } = req.body;
  var newUser = new User({ username: req.body.username });

  let errors = validationResult(req).formatWith(errorFormatter);

  if (!errors.isEmpty()) {
    req.flash('fail', 'Please Check Your Form');
    return res.render('register', {
      error: errors.mapped(),
      value: {
        username,
        password,
      },
      flashMessage: Flash.getMessage(req),
    });
  }
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      req.flash('error', 'Username Already Exist');
      res.redirect('/register');
    }
    passport.authenticate('local')(req, res, () => {
      req.flash('success', 'Welcome to YelpCamp ' + user.username);
      res.redirect('/campgrounds');
    });
  });
});

//show login form
router.get('/login', middleware.isLogged, (req, res) => {
  res.render('login', {
    error: {},
    flashMessage: Flash.getMessage(req),
  });
});

//handling login logic
router.post(
  '/login',
  middleware.isLogged,
  loginValidator,
  (req, res, next) => {
    // Check validation.
    let errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      req.flash('fail', 'Please Check Your Form');
      return res.render('login', {
        error: errors.mapped(),
        flashMessage: Flash.getMessage(req),
      });
    }
    // if validation is successful, call next() to go on with passport authentication.
    next();
  },
  passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login',
    failureFlash: true,
  })
);

// logout route
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Logged you out!');
  res.redirect('/campgrounds');
});

module.exports = router;
