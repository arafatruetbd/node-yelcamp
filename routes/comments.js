var express = require('express');
var router = express.Router({ mergeParams: true });
var Campground = require('../models/campground');
var Comment = require('../models/comment');
const Flash = require('../utils/Flash');
const moment = require('moment');
var middleware = require('../middleware');
// ====================
// COMMENTS ROUTES
// ====================

router.get('/new', middleware.isLoggedIn, (req, res) => {
  // find campground by id
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(err);
    } else {
      res.render('comments/new', {
        campground: campground,
        flashMessage: Flash.getMessage(req),
      });
    }
  });
});

router.post('/', middleware.isLoggedIn, (req, res) => {
  //lookup campground using ID
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(err || !campground);
      res.redirect('/campgrounds');
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err || !comment) {
          console.log(err);
          req.flash('error', 'Please Check Your Form');
          res.redirect('/campgrounds/' + req.params.id + '/comments/new');
        } else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          campground.comments.push(comment);
          campground.save();
          req.flash('success', 'Successfully added comment');
          res.redirect('/campgrounds/' + campground._id);
        }
      });
    }
  });
});
router.get(
  '/:comment_id/edit',
  middleware.checkCommentOwnership,
  (req, res) => {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
      if (err) {
        res.redirect('back');
      } else {
        res.render('comments/edit', {
          campground_id: req.params.id,
          comment: foundComment,
          flashMessage: Flash.getMessage(req),
        });
      }
    });
  }
);

router.put('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndUpdate(
    req.params.comment_id,
    req.body.comment,
    (err, updatedComment) => {
      if (err) {
        res.redirect('back');
      } else {
        req.flash('success', 'Comment Edited Successfully');
        res.redirect('/campgrounds/' + req.params.id);
      }
    }
  );
});
router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, (err) => {
    if (err) {
      res.redirect('back');
    } else {
      req.flash('success', 'Comment deleted');
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});
module.exports = router;
