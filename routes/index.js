const express  = require('express'),
      router   = express.Router(),
      User     = require('../models/user'),
      passport = require('passport');
      require('dotenv').config();
const stripe   = require("stripe")(process.env.STRIPE_SECRET_KEY);



router.get("/", function(req, res){
	
	res.render("landing");
})



router.get('/register', function(req, res){
	
	res.render('register');
})



router.post('/register', function(req, res){
	
	let newUser = new User({username : req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			//console.log(err);
			req.flash('error', err.message);
			res.redirect('back');
		}else{
			passport.authenticate('local')(req, res, function(){
				req.flash('success', 'Welcome to YelpCamp '+user.username);
				res.redirect('/campgrounds');
			})
		}
	})
})



router.get('/login', function(req, res){
	
	res.render('login');
})



router.post('/login', passport.authenticate('local',{
	successRedirect : '/campgrounds',
	failureRedirect : '/login'
}), function(req, res){
	
})



router.get('/logout', function(req, res){
	
	req.logout();
	req.flash('success', 'Logged you out!');
	res.redirect('/campgrounds')
})



module.exports = router;