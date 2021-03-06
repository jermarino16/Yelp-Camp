var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");
var middleware = require("../middleware"); //dont need to type /index.js because that is required by default when requiring a directory
var NodeGeocoder = require("node-geocoder");

var options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder = NodeGeocoder(options);

//INDEX Route ---- show all campgrounds
router.get("/campgrounds", (req, res) => {
  //get all campgrounds from DB
  Campground.find({}, function(err, all_campgrounds) {
    if (err) {
      req.flash("error", err);
    } else {
      res.render("campgrounds/index", {
        campgrounds: all_campgrounds,
        currentUser: req.user,
        page: "campgrounds"
      });
    }
  });
});
//CREATE Route - add new campground to database
router.post("/campgrounds", middleware.isLoggedIn, (req, res) => {
  //console.log(req.body);
  //get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var cost = req.body.cost;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  geocoder.geocode(req.body.location, function(err, data) {
    if (err || !data.length) {
      console.log(err);
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {
      name: name,
      image: image,
      description: desc,
      author: author,
      cost: cost,
      location: location,
      lat: lat,
      lng: lng
    };
    Campground.create(newCampground, function(err, newCreated) {
      //using the object schema defined at top to access db
      if (err) {
        req.flash("error", err);
      } else {
        req.flash("success", "Campground Created");
        res.redirect("/campgrounds"); //go back to campground page after create
      }
    });
  });
});

//NEW Route - show form to create new campground
router.get("/campgrounds/new", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/new", { currentUser: req.user });
});

//SHOW Route
router.get("/campgrounds/:id", (req, res) => {
  // Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
  Campground.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundCampground) {
      if (err) {
        req.flash("error", err);
      } else {
        res.render("campgrounds/show", {
          campground: foundCampground,
          currentUser: req.user
        });
      }
    });
});
//Edit Campground Route
router.get(
  "/campgrounds/:id/edit",
  middleware.checkCampgroundOwnership,
  (req, res) => {
    Campground.findById(req.params.id, function(err, foundCampground) {
      if (err) {
        req.flash("error", err);
        res.redirect("/campgrounds");
      } else {
        res.render("campgrounds/edit", { campground: foundCampground });
      }
    });
  }
);
//Update Campground Route
//find and update the correct campground
//redirect somewhere
router.put(
  "/campgrounds/:id",
  middleware.checkCampgroundOwnership,
  (req, res) => {
    //update this route so it checks if the campground location has even changed
    Campground.findById(req.params.id, function(err, foundCampground) {
      if (err) {
        //if error flash error and send the user back
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        //we found a campground, lets check if location has been changed
        //if the location is the same dont do the api call, just update the campground
        //this can be refactored for code to be DRY but it works
        if (foundCampground.location == req.body.campground.location) {
          // req.flash("success", "location is the same");
          Campground.findByIdAndUpdate(
            req.params.id,
            req.body.campground,
            function(err, updatedCampground) {
              if (err) {
                req.flash("error", err.message);
                res.redirect("/campgrounds");
              } else {
                req.flash("success", "Campground updated");
                res.redirect("/campgrounds/" + req.params.id);
              }
            }
          );
        } else {
          //if the location is different do the apicall
          // req.flash("error", "location is different");
          geocoder.geocode(req.body.campground.location, function(err, data) {
            if (err || !data.length) {
              console.log(err);
              req.flash("error", "Invalid address");
              return res.redirect("back");
            }
            req.body.campground.lat = data[0].latitude;
            req.body.campground.lng = data[0].longitude;
            req.body.campground.location = data[0].formattedAddress;
            //after doing api call or not update the campground
            Campground.findByIdAndUpdate(
              req.params.id,
              req.body.campground,
              function(err, updatedCampground) {
                if (err) {
                  req.flash("error", err.message);
                  res.redirect("/campgrounds");
                } else {
                  req.flash("success", "Campground updated");
                  res.redirect("/campgrounds/" + req.params.id);
                }
              }
            );
          });
        }
      }
    });
  }
);

// Delete Campground route
router.delete(
  "/campgrounds/:id",
  middleware.checkCampgroundOwnership,
  (req, res) => {
    Campground.findByIdAndDelete(req.params.id, function(
      err,
      deletedCampground
    ) {
      if (err) {
        req.flash("error", err);
        res.redirect("/campgrounds");
      } else {
        // console.log(deletedCampground);//we are deleting this from db
        req.flash("success", "Deleted Campground");
        res.redirect("/campgrounds");
      }
    });
  }
);

module.exports = router;
