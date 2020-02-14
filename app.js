require('dotenv').config();

var express 	= require("express"),
	app 		= express(),
	bodyParser 	= require("body-parser"),
	mongoose 	= require("mongoose"),
	flash 		= require("connect-flash"),
	passport 	= require("passport"),
	LocalStrategy = require("passport-local"),
	MethodOverride = require("method-override"),
	Campground 	= require("./models/campgrounds.js"),
	Comment 	= require("./models/comments"),
	User 		= require("./models/users"),
	seedDB = require("./seeds");

var commentRoutes = require("./routes/comments"),
	campgroundRoutes = require("./routes/campgrounds"),
	indexRoutes = require("./routes/index")

//	==============================
// 	PASSPORT CONFIGURATION
// ==============================
app.use(require("express-session")({
	secret: "Jeremy cute",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//mongoose app set up
mongoose.set('useNewUrlParser', true);	//avoid deprecation
mongoose.set('useUnifiedTopology', true); //avoid deprecation
mongoose.set('useFindAndModify', false);//avoid deprecation
mongoose.connect("mongodb://localhost/yelp_camp");//connect / create to db

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs") // so i dont have to write ".ejs" for file
app.use(express.static(__dirname + "/public"));
app.use(MethodOverride("_method"));
app.use(flash());


//define this to pass in currentUser variable to everything
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
})

//setup routes from files
app.use(indexRoutes);
app.use(commentRoutes);
app.use(campgroundRoutes);

// seedDB(); //remove all campgrounds from DB

app.listen(process.env.PORT || 3000, process.env.ip, function(){
	console.log("Yelp Server has started");
});



