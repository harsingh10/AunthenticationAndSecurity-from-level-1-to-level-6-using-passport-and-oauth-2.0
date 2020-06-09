//jshint esversion:6
//requiring essential modules
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

//creating server with the help of express
const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(session({
  secret: "this is our secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//connecting to the database
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true ,  useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);
//creating schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);
//creating model with the help of schema
const User = new mongoose.model("User", userSchema);

//below code in comments is not working
//----------------------------------------------------
passport.use(User.createStrategy());
//
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
//-----------------------------------------------------
//this one is fine
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

//home route to render home.ejs
app.route("/")
.get(function(req,res){
    res.render("home");
});

app.route("/secrets")
.get(function(req, res){
  if (req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});
//register route to register the user in the database
app.route("/register")
.get(function(req,res){
   res.render("register");
})
.post(function(req,res){

    User.register({username: req.body.username}, req.body.password, function(err, user){
      if(err){
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate('local')(req, res, function(){
          res.redirect("/secrets");
        });
      }
    });
});
//login route to authenticate user
app.route("/login")
.get(function(req,res){
    res.render("login");
})
.post(function(req,res){
  const user = new User({
    email: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
    } else {

      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });
});
//starting the server
const port = 3000 || process.env.Port;
app.listen(port, () => {
    console.log('server is running on port http://localhost:' + port);
} );
