//jshint esversion:6
//requiring essential modules
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//creating server with the help of express
const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({
    extended:true
}));
//connecting to the database
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true ,  useUnifiedTopology: true });
//creating schema
const userSchema ={
    email: String,
    password: String
};
//creating model with the help of schema
const userData = new mongoose.model("userData", userSchema);
//home route to render home.ejs
app.route("/")
.get(function(req,res){
    res.render("home.ejs");
});
//register route to register the user in the database
app.route("/register")
.get(function(req,res){
   res.render("register");
})
.post(function(req,res){

    const newUser = new userData({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save(function(err){
        if(err){
            console.log(err);
        }
        else{
            res.render("secrets");
        }
    }) ;
});
//login route to authenticate user
app.route("/login")
.get(function(req,res){
    res.render("login.ejs");
})
.post(function(req,res){
  const newUserPassword = req.body.password;
  userData.findOne({email:req.body.username}, function(err,foundUser){
    if(!err){
      if(foundUser){
        if(foundUser.password === newUserPassword){
          res.render("secrets");
        }
      }
    }
    else{
      console.log(err);
    }
  })
});
//starting the server
const port = 3000 || process.env.Port;
app.listen(port, () => {
    console.log('server is running on port http://localhost:' + port);
} );
