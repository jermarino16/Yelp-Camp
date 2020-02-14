var express = require("express");
var router = express.Router();
var	Campground 	= require("../models/campgrounds");
var	Comment 	= require("../models/comments");
var middleware = require("../middleware");//dont need to type /index.js because that is required by default when requiring a directory

//INDEX Route ---- show all campgrounds 
router.get("/campgrounds", function(req, res){
	//get all campgrounds from DB
	Campground.find({}, function(err, all_campgrounds){
		if(err){
			req.flash("error", err);
		}else{
			res.render("campgrounds/index", {campgrounds: all_campgrounds, currentUser: req.user});
		}
	}) 
	
});
//CREATE Route - add new campground to database
router.post("/campgrounds", middleware.isLoggedIn, function(req, res){
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
	var newCampground = {name: name, image: image, description: desc, author: author, cost:cost};
	Campground.create(newCampground, function(err, newCreated){//using the object schema defined at top to access db
		if(err){
			req.flash("error", err);
		}else{
			//console.log(newCreated);
			req.flash("success", "Campground Created");
			res.redirect("/campgrounds");//go back to campground page after create
		}
	});
});

//NEW Route - show form to create new campground
router.get("/campgrounds/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new", {currentUser: req.user});
});

//SHOW Route
router.get("/campgrounds/:id", function(req, res){
	// Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			req.flash("error", err);
		}else{
			res.render("campgrounds/show", {campground: foundCampground, currentUser: req.user});
		}
	});
});
//Edit Campground Route
router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			req.flash("error", err);
			res.redirect("/campgrounds");
		}else{
			res.render("campgrounds/edit", {campground: foundCampground});
		}
	});
});
//Update Campground Route
	//find and update the correct campground
	//redirect somewhere
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			req.flash("error", err);
			res.redirect("/campgrounds");
		}else{
			req.flash("success", "Campground updated")
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// Delete Campground route
router.delete("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndDelete(req.params.id, function(err, deletedCampground){
		if(err){
			req.flash("error", err);
			res.redirect("/campgrounds");
		}else{
			// console.log(deletedCampground);//we are deleting this from db
			req.flash("success", "Deleted Campground")
			res.redirect("/campgrounds");
		}
	});
});

module.exports = router;
