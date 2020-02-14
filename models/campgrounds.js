var	mongoose = require("mongoose");


//Schema Setup
var campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String,
	location: String,
	lat: Number,
	lng: Number,
	cost: Number,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

var Campground = mongoose.model("Campground", campgroundSchema);//create campground db

module.exports = Campground;

