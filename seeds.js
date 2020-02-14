var mongoose = require("mongoose");
var Campground = require("./models/campgrounds");
var Comment = require("./models/comments");
var seeds = [
	{
		name: "Cool cat Camp",
		image: "https://images.unsplash.com/photo-1541716937436-7a2bcc09aaf5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description: "Maecenas a odio neque. Suspendisse ornare varius dictum. Phasellus nisi lacus, rutrum vel nibh in, semper lobortis lacus. Sed ac lectus in odio dignissim laoreet. In hac habitasse platea dictumst. Nam sit amet augue sed nibh posuere accumsan. Etiam egestas et mauris id eleifend.",
		cost: 5,
		location: "Yosemite National Park",
		author: {
			id: mongoose.Types.ObjectId(),
			username: "dirtdude"
		}
	},
	{
		name: "Down dog dirt",
		image: "https://images.unsplash.com/photo-1565234141124-fc0d882e5592?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description: "Maecenas a odio neque. Suspendisse ornare varius dictum. Phasellus nisi lacus, rutrum vel nibh in, semper lobortis lacus. Sed ac lectus in odio dignissim laoreet. In hac habitasse platea dictumst. Nam sit amet augue sed nibh posuere accumsan. Etiam egestas et mauris id eleifend.",
		author: {
			id: mongoose.Types.ObjectId(),
			username: "bobbyy"
		}
	},
	{
		name: "Mountains Motion",
		image: "https://images.unsplash.com/photo-1535646058247-2de46e113965?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
		description: "Maecenas a odio neque. Suspendisse ornare varius dictum. Phasellus nisi lacus, rutrum vel nibh in, semper lobortis lacus. Sed ac lectus in odio dignissim laoreet. In hac habitasse platea dictumst. Nam sit amet augue sed nibh posuere accumsan. Etiam egestas et mauris id eleifend.",
		author: {
			id: mongoose.Types.ObjectId(),
			username: "womper"
		}
	}
]

//remove campgrounds from DB and then add campgrounds
async function seedDB(){
	try{
		await Comment.deleteMany({});
		await Campground.deleteMany({});

		for(const seed of seeds){
			let campground = await Campground.create(seed);
			let comment = await Comment.create({
				text: "This place is great but no internet",
				author: {
					id: mongoose.Types.ObjectId(),
					username: "Homer"
				}
			});
			campground.comments.push(comment);
			campground.save();
		}
	
	}catch(err){
		console.log(err);	
	}
}

module.exports = seedDB;







