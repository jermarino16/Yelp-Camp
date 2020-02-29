var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");
var middleware = require("../middleware"); //dont need to type /index.js because that is required by default when requiring a directory

//=========================
// Comments Routes
// ========================
//New Route - show form to create comments for a specific campground
router.get(
  "/campgrounds/:id/comments/new",
  middleware.isLoggedIn,
  (req, res) => {
    console.log(req.body);
    //find campground by id
    Campground.findById(req.params.id, function(err, campground) {
      if (err) {
        req.flash("error", err);
      } else {
        res.render("comments/new", { campground: campground }); //show form to submit a comment for this campground
      }
    });
  }
);

//CREATE Route - add new comments to specific campgrounds
router.post("/campgrounds/:id/comments", middleware.isLoggedIn, (req, res) => {
  //find specific campground by id
  Campground.findById(req.params.id, function(err, campground) {
    if (err) {
      req.flash("error", err);
    } else {
      //if we find the campground save the data from the form
      var comment_text = req.body.comment.text;
      var comment_author = req.body.comment.author;
      //i could also just use req.body.comment
      //create a comment and associate to that campground
      Comment.create(
        {
          text: comment_text,
          author: comment_author
          //i could also just use req.body.comment
        },
        function(err, comment) {
          if (err) {
            req.flash("error", err);
          } else {
            //add username and id to comment
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;
            //save comment
            comment.save();
            campground.comments.push(comment);
            campground.save();
            //redirect back to that specific campground page
            req.flash("success", "Comment created");
            res.redirect("/campgrounds/" + campground._id);
          }
        }
      );
    }
  });
});
//Edit comment route
router.get(
  "/campgrounds/:id/comments/:comment_id/edit",
  middleware.verifyCommentOwnership,
  (req, res) => {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err) {
        req.flash("error", err);
      } else {
        var campground_id = req.params.id;
        res.render("comments/edit", {
          campground_id: campground_id,
          comment: foundComment
        });
      }
    });
  }
);
//Update Comment Route
router.put(
  "/campgrounds/:id/comments/:comment_id",
  middleware.verifyCommentOwnership,
  (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(
      err,
      foundComment
    ) {
      if (err) {
        req.flash("error", err);
      } else {
        //if found redirect back to specific campground with the comment
        req.flash("success", "Comment Updated");
        res.redirect("/campgrounds/" + req.params.id);
      }
    });
  }
);
// Delete Campground route
router.delete(
  "/campgrounds/:id/comments/:comment_id",
  middleware.verifyCommentOwnership,
  (req, res) => {
    Comment.findByIdAndDelete(req.params.comment_id, function(
      err,
      deletedComment
    ) {
      if (err) {
        req.flash("error", err);
        res.redirect("/campgrounds/" + req.params.id);
      } else {
        // console.log(deletedComment);//we are deleting this from db
        req.flash("success", "Comment Deleted");
        res.redirect("/campgrounds/" + req.params.id);
      }
    });
  }
);

module.exports = router;
