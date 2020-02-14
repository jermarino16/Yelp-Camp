var express 	= require("express");
var router 		= express.Router();
var passport	= require("passport");
var	User 		= require("../models/users");

//route for "/"
router.get("/", function(req, res){
	res.render("landing");
});

// AUTH ROUTES
// show register form
router.get("/register", function(req, res){
	res.render("register", {page: 'register'});
});

//handle sign-up logic 
router.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	if (req.body.adminCode === "ninjaman123"){
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user){	//we get this from local mongoose
		if(err){
			req.flash("error", err.message);
			return res.render("register", {error: err.message});
		}
		else{
			passport.authenticate("local")(req, res, function(){
				req.flash("success", "Welcome to YelpCamp " + req.body.username)
				res.redirect("/campgrounds");
			});
		}
	});
});

//show login form
router.get("/login", function(req, res){
	res.render("login", {page: 'login'});
});

//handle login logic
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), function(req, res){
});

//add logout route
router.get("/logout", function(req,res){
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/campgrounds");
});

module.exports = router;