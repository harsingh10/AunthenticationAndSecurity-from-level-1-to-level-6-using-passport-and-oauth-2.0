//jshint esversion:6
require('dotenv').config();//requiring .env module
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");//requiring the encryption plugin

const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({
    extended:true
}));
//connecting to the database userDB
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true ,  useUnifiedTopology: true });
//creating Schema for the user data
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
//Encrypting the passwordfield by adding the mongoose-encryption plugin to the userschema with encrypt and getting the secret key from .env files
userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ["password"]});
//creating the userModel using the userSchema
const userData = new mongoose.model("userData", userSchema);
//home route
app.route("/")
.get(function(req,res){
    res.render("home.ejs");
});
//login route
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
//register route
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

//creating server using express
const port = 3000 || process.env.Port;
app.listen(port, () => {
    console.log('server is running on port http://localhost:' + port);
});
