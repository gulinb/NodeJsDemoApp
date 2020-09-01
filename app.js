var express       = require("express"),
    app           = express(),
    bodyParser    = require("body-parser"),
	mongoose      = require("mongoose"),
	Comments      = require("./models/comment"),
	Campground    = require("./models/campground"),
	seedDB        = require("./seeds"),
	passport      = require("passport"),
	LocalStrategy = require('passport-local'),
	User          = require('./models/user'),
	methodOverride= require('method-override'),
	flash         = require('connect-flash')
	
var campgroundRoutes = require('./routes/campgrounds'),
	commentRoutes    = require('./routes/comments'),
	authRoutes       = require('./routes/index')


mongoose.connect('mongodb+srv://gulinb:99JMQ3uFmongodb!@cluster0.oq5pq.mongodb.net/yelp_camp?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() =>{
	console.log('Connected DB!');
}).catch(err =>{
	console.log('ERROR: ', err.message);
})


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(flash());

app.use(require('express-session')({
	secret : 'this is the encoding string',
	resave : false,
	saveUninitialized : false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error       = req.flash('error');
	res.locals.success     = req.flash('success');
	next();
})

app.use(authRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);
app.use("/campgrounds", campgroundRoutes);

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});