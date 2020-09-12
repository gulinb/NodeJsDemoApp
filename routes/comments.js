const express    = require('express'),
      router     = express.Router({mergeParams : true}),
      Campground = require('../models/campground'),
      Comments   = require('../models/comment'),
      middleware = require('../middleware');

router.get("/new", middleware.isLoggedIn, function(req, res){
	
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			console.log(err)
		}else{
			res.render("comments/new", {campground : foundCampground})
		}
	})
})



router.post("/", middleware.isLoggedIn, function(req, res){
	
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash('error', "Campground not found");
			res.redirect('back');
		}else{
			Comments.create(req.body.comment, function(err, comment){
				if(err || !comment){
					req.flash('error', 'Comment not found')
					res.redirect('back');
				}else{
					comment.author.id=req.user._id;
					comment.author.username=req.user.username;
					comment.save();
					foundCampground.comments.push(comment);
					foundCampground.save();
					req.flash('success', 'Successfuly created comment')
					res.redirect("/campgrounds/"+foundCampground._id);
				}
			})
		}
	})
})



router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res){
	
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash('error', "Campground not found");
			res.redirect('back');
		}else{
			Comments.findById(req.params.comment_id, function(err, foundComment){
				if(err || !foundComment){
					req.flash('error', 'Comment not found')
					res.redirect('back');
				}else{
					res.render('comments/edit', {comment : foundComment, campground: foundCampground});
				}
			})
		}
	})
})



router.put('/:comment_id', middleware.checkCommentOwnership, function(req, res){
	
	Comments.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updateComment){
		if(err || !updateComment){
			req.flash('error', 'Comment not found')
			res.redirect('back');
		}else{
			res.redirect('/campgrounds/'+req.params.id);
		}
	})
})



router.delete('/:comment_id', middleware.checkCommentOwnership, function(req, res){
	
	Comments.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			res.redirect('back')
		}else{
			req.flash('success', 'Comment deleted');
			res.redirect('/campgrounds/'+req.params.id);
		}
	})
})


module.exports = router;