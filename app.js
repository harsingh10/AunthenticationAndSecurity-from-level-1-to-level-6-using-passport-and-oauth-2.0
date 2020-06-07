//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({
    extended:true
}));
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true ,  useUnifiedTopology: true });

const userSchema ={
    email: String,
    password: String
};

const userData = new mongoose.model("userData", userSchema);

app.route("/")
.get(function(req,res){
    res.render("home.ejs");
});

app.route("/register")
.get(function(req,res){
   res.render("register");
})
.post(function(req,res){

    const newUser = new userData({
        email: (req.body.username),
        password: md5(req.body.password)
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

app.route("/login")
.get(function(req,res){
    res.render("login.ejs");
})
.post(function(req,res){
  const newUserPassword = md5(req.body.password);
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




const port = 3000 || process.env.Port;
app.listen(port, () => {
    console.log('server is running on port http://localhost:' + port);
} );
