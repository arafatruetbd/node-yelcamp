var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
const { validationResult } = require('express-validator');
const errorFormatter = require('../utils/validationErrorFormatter');
const registerValidator = require('../validator/authValidator/signupValidator');
const loginValidator = require('../validator/authValidator/loginValidator');

//root route
router.get('/', function (req, res) {
  res.render('landing');
});

// show register form
router.get('/register', function (req, res) {
  res.render('register', {
    error: {},
    value: {},
  });
});

//handle sign up logic
router.post('/register', registerValidator, function (req, res) {
  const { username, password } = req.body;
  var newUser = new User({ username: req.body.username });

  let errors = validationResult(req).formatWith(errorFormatter);

  if (!errors.isEmpty()) {
    return res.render('register', {
      error: errors.mapped(),
      value: {
        username,
        password,
      },
    });
  }
  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      req.flash('error', err.message);
      res.redirect('/register');
    }
    passport.authenticate('local')(req, res, function () {
      req.flash('success', 'Welcome to YelpCamp ' + user.username);
      res.redirect('/campgrounds');
    });
  });
});

//show login form
router.get('/login', function (req, res) {
  res.render('login', {
    error: {},
  });
});

//handling login logic
router.post(
  '/login',
  loginValidator,
  (req, res, next) => {
    // Check validation.
    let errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.render('login', {
        error: errors.mapped(),
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
router.get('/logout', function (req, res) {
  req.logout();
  req.flash('success', 'Logged you out!');
  res.redirect('/campgrounds');
});

module.exports = router;
