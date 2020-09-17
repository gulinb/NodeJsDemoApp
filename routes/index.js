const express  = require('express'),
      router   = express.Router(),
      User     = require('../models/user'),
	  bodyParser       = require("body-parser"),
      passport = require('passport');
      require('dotenv').config();
const stripe   = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.use(bodyParser.urlencoded({extended:true}));

router.get("/", function(req, res){
	
	res.render("landing");
})



router.get('/register', function(req, res){
	
	res.render('register');
})



router.post('/register', function(req, res){
	
	let newUser = new User({username : req.body.username, subscribed : false});
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

router.get('/checkout', function(req, res){
	
	res.render("payments/checkout");
})

router.get('/success', function(req, res){
	
	res.render('payments/success');
})

router.post('/create-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Stubborn Attachments',
            images: ['https://i.imgur.com/EHyR2nP.png'],
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `https://mongodb-ykwbx.run-eu-central1.goorm.io/success`,
    cancel_url: `https://mongodb-ykwbx.run-eu-central1.goorm.io/campgrounds`,
	client_reference_id: req.user.id,
	
  });

  console.log('user ID: '+req.user.id);
  res.json({ id: session.id });
});


const endpointSecret = process.env.ENDPOINT_SECRET;


router.post('/webhook', bodyParser.raw({type: 'application/json'}), (request, response) => {
  const payload = request.body;
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Fulfill the purchase...
	  console.log(session.client_reference_id)
	  
    if(session.payment_status==='paid'){
	User.findById(session.client_reference_id, function(err, foundUser){
		if(err){
			console.log(err)
		}else{
			console.log(foundUser.subscribed)
			foundUser.subscribed= true;
			console.log(foundUser.subscribed)
			foundUser.save();
		}
	})
	}
	 
  }
	response.redirect('/campgrounds');
});





module.exports = router;