var express = require('express');
var router = express.Router();
const Flash = require('../utils/Flash');
var Campground = require('../models/campground');
var middleware = require('../middleware');
//INDEX - show all campgrounds
router.get('/', (req, res) => {
  // Get all campgrounds from DB
  Campground.find({},(err, allCampgrounds)=> {
    if (err) {
      console.log(err);
    } else {
      res.render('campgrounds/index', {
        campgrounds: allCampgrounds,
        flashMessage: Flash.getMessage(req),
      });
    }
  });
});

//CREATE - add new campground to DB
router.post('/', middleware.isLoggedIn, (req, res) => {
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var price = req.body.price;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username,
  };
  var newCampground = {
    name: name,
    price: price,
    image: image,
    description: desc,
    author: author,
  };
  // Create a new campground and save to DB
  Campground.create(newCampground, (err, newlyCreated) => {
    if (err || !newlyCreated) {
      console.log(err);
      req.flash('error', 'Please Check Your Form');
      res.redirect('/campgrounds/new');
    } else {
      //redirect back to campgrounds page
      req.flash('success', 'Campground Posted Successfully');
      res.redirect('/campgrounds');
    }
  });
});

//NEW - show form to create new campground
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('campgrounds/new', {
    flashMessage: Flash.getMessage(req),
  });
});

// SHOW - shows more info about one campground
router.get('/:id', (req, res) => {
  //find the campground with provided ID
  Campground.findById(req.params.id)
    .populate('comments')
    .exec((err, foundCampground)=> {
      if (err || !foundCampground) {
        console.log(err);
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
      } else {
        console.log(foundCampground);
        //render show template with that campground
        res.render('campgrounds/show', {
          campground: foundCampground,
          flashMessage: Flash.getMessage(req),
        });
      }
    });
});
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err || !foundCampground) {
      console.log(err);
      req.flash('error', 'Campground Not Found');
      res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {
      campground: foundCampground,
      flashMessage: Flash.getMessage(req),
    });
  });
});

router.delete('/:id', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id,(err)=> {
    if (err) {
      req.flash('error', 'Campground Not Found');
      res.redirect('/campgrounds');
    } else {
      req.flash('success', 'Campground Deleted Successfully');
      res.redirect('/campgrounds');
    }
  });
});

router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, (
    err,
    updatedCampground
  )=> {
    if (err) {
      res.redirect('/campgrounds');
    } else {
      req.flash('success', 'Campground Updated Successfully');
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});

module.exports = router;
