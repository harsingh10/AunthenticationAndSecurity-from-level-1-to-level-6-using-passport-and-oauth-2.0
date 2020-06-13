//jshint esversion:6
//requiring essential modules
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");
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
const mongoDBConnectionUrl = process.env.URL_DB;
mongoose.connect(mongoDBConnectionUrl, {useNewUrlParser: true ,  useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
//creating schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String

});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
//creating model with the help of schema
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
// passport.serializeUser(function(user, done) {
//   done(null, user);
// });
//
// passport.deserializeUser(function(user, done) {
//   done(null, user);
// });
//google login strategy
console.log(process.env.CLIENT_ID);
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
//facebook login Strategy
// passport.use(new FacebookStrategy({
//     clientID: process.env.APP_ID,
//     clientSecret: process.env.APP_SECRET,
//     callbackURL: "http://localhost:3000/auth/facebook/secrets",
//     enableProof: true
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));
//home route to render home.ejs
app.route("/")
.get(function(req,res){
    res.render("home.ejs");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
        // Successful authentication, redirect home.
    res.redirect('/secrets');
  });


app.get("/logout", function(req,res){

  req.logout();
  res.redirect("/");

});

app.route("/secrets")
.get(function(req, res){
  User.find({"secret": {$ne:null}}, function(err,foundUsers){
    if(err){
      console.log(err);
    }else{
      if(foundUsers){
        res.render("secrets", {usersWithSecrets:foundUsers});
      }
    }
  });
});
app.route("/submit")
.get(function(req,res){
  if(req.isAuthenticated()){
    res.render("submit");
  }else{
    res.redirect("/login");
  }
})
.post(function(req,res){
  const submittedSecret = req.body.secret;

  User.findById(req.user.id, function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        foundUser.secret=submittedSecret;
        foundUser.save(function(){
          res.redirect("/secrets");
        });

      }

    }

  });
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
      }else{
          passport.authenticate("local")(req,res, function(){
          res.redirect("/secrets");
        })
      }

    });
});
//login route to authenticate user
app.route("/login")
.get(function(req,res){
    res.render("login.ejs");
})
.post(function(req,res){
  const user = new User({
    email: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res, function(){
        res.redirect("/secrets");
      })
    }

  });
});
//starting the server
const port = 3000 || process.env.Port;
app.listen(port, () => {
    console.log('server is running on port http://localhost:' + port);
} );
