//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
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
  //bcrypt is used as a hash function and salting is done to protect the password more and salting is done for 10 rounds and the hash created after that will be stored in the database
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser = new userData({
        email: req.body.username,
        password: hash
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
        //bcrypt compare is used to compare the newuserpassword and the hash stored in database
        bcrypt.compare(newUserPassword, foundUser.password, function(err, result) {
    // result == true
              if(result === true){
                res.render("secrets");
              }
              });
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
