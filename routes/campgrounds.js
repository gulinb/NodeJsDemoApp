
var express = require('express')
var router = express.Router();
var Campground = require('../models/campground');
var Comments = require('../models/comment');
var middleware = require('../middleware');




router.get("/", function(req, res){
		
		Campground.find({}, function(err, allCampgrounds){
			if(err){
				console.log(err)
			}else{
			res.render("campgrounds/index", {campground : allCampgrounds});	
			}
		})
})

router.post("/", middleware.isLoggedIn, function(req, res){
	var name = req.body.camp;
	var image = req.body.url;
	var price = req.body.price;
	var description = req.body.description;
	var author = { 
					id : req.user._id,
					username : req.user.username
				 }
	var newCampground = {name : name, price : price, image : image, description : description, author : author};
	Campground.create(newCampground, function(err, campground){
	if(err){
		console.log(err);
	}else{
		res.redirect("/campgrounds");
		}
	})
})

router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
})

router.get("/:id", function(req, res){
	
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
			req.flash('error', 'Campground Not Found!');
			res.redirect('back');
		}else{
			res.render("campgrounds/show", {campground: foundCampground});
		}
	})
	
})

router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash('error', "Campground not found!");
			res.redirect('back');
		}
			res.render("campgrounds/edit", {campground : foundCampground});
	})
})

router.put('/:id', middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, foundCampground){
		if(err){
			console.log(err)
		}else{
			res.redirect('/campgrounds/'+req.params.id)
		}
	})
})

router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err, foundCampground){
		if(err){
			console.log(err);
		}else{
			for(var c of foundCampground.comments){
				Comments.findByIdAndRemove(c._id, function(err, removedComment){
					if(err){
						console.lof(err);
					}else{
						console.log("removed comment");
					}
				})
			}
			res.redirect('/campgrounds');
		}
	})
})

module.exports = router;
