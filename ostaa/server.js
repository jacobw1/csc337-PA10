/*
  Author: Jacob Williams
  Purpose: server.js contains the  connection to the server and DB
  Useage: node server.js
*/

//creating constant variables
const express =require('express');
const mongoose = require('mongoose');
const parser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
// Tell the express app to pare any body type and to use a cookie parser
app.use(parser.text({type: '*/*'}));
app.use(cookieParser());
//digital ocean -> 143.198.105.222
const hostname = 'localhost';
const port = 300;

// map usernames to timestamp
var sessions = {};
const LOGIN_TIME = 60000;

function filterSessions() {
  var now = Date.now();
  console.log(sessions);
  for (x in sessions) {
    username = x;
    time = sessions[x];
    if (time + LOGIN_TIME < now) {
      console.log('delete user session: ' + username);
      delete sessions[username];
    }
  }
}

setInterval(filterSessions, 2000);

function addSession(username) {
  var now = Date.now();
  sessions[username] = now;
}

function doesUserHaveSession(username) {
  return username in sessions;
}



function authenticate(req, res, next) {
  console.log('called authenticate');
  var c = req.cookies;
  if (c && c.login)  {
    var username = c.login.username;
    if (doesUserHaveSession(username)) {
      addSession(username);
      next();
    } else {
      res.redirect('public_html/index.html');
    }
  } else {
    res.redirect('public_html/index.html');
  }
}

// degine mongoose and DBURL
const db = mongoose.connection;
const mongoDBURL = 'mongodb://localhost/ostaa';
// get Schema object
var Schema = mongoose.Schema;
// define item
var itemSchema = new Schema({
  title: String,
  description: String,
  image: String,
  price: Number,
  stat: String
});
// create noew model
var Item = mongoose.model('Item', itemSchema);
// do same for user
var userSchema = new Schema({
  username: String,
  password: String,
  listings: [{ type : mongoose.Types.ObjectId, ref: 'Item' }],
  purchases: [{ type : mongoose.Types.ObjectId, ref: 'Item' }],
})
var User = mongoose.model('User', userSchema);
// connect mongoose with mongoDB
mongoose.connect(mongoDBURL, { useNewUrlParser: true});
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// define folder with static files
app.use(express.static('public_html'));

// NOTE could not figure out how to authenticate using app.use();
//app.use('/*/', authenticate);

// formating json
app.set('json spaces', 2);
// allowing res.json()
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// given a username, this returns the listings under said username
app.get('/get/listings/user',(req, res) =>{
  var c = req.cookies;
  var u;
  if(c && c.login){
    u = c.login.username;
  }
  User.findOne({username: u }).exec((err, result) =>{
      if (err) return res.end('FAIL');
      if (!result) return res.end('FAIL');
      Item.find({_id: result.listings}).exec((err,listingResults) => {
        if (err) return res.end('FAIL');
        if (!listingResults) return res.end('FAIL');
        res.json(listingResults);
      });
    });
});

// given a username. this returns the purchases of said username
app.get('/get/purchases/user',(req, res) =>{
  var c = req.cookies;
  var u;
  if(c && c.login){
    u = c.login.username;
  }
  User.findOne({username: u }).exec((err, result) =>{
      if (err) return res.end('FAIL');
      if (!result) return res.end('FAIL');
      Item.find({_id: result.purchases}).exec((err,purchasesResults) => {
        if (err) return res.end('FAIL');
        if (!purchasesResults) return res.end('FAIL');
        res.json(purchasesResults);
      });
    });
});

// shows all items with a keyword substring in the description
app.get('/search/items/:keyword', (req,res) =>{
  Item.find({description: {$regex: req.params.keyword }}).exec((err,results) =>{
    res.json(results);
  });
});

// post addes a new user to the db
app.post('/add/user/', (req,res) => {
  requestData = JSON.parse(req.body);
  User.findOne({username: requestData.username}).exec((err,result)=>{
    if(result){
       return res.end('DUPLICATE');
     }else{
      var newUser = new User({
        username: requestData.username,
        password: requestData.password,
        listings: [],
        purchases: []
      });
      newUser.save(function(err) {if (err) res.send("FAILED TO ADD USER");});
      res.send('SAVED USER');
    }
  });
});

// given a username this adds an item to the db
app.post('/add/item/', (req,res) => {
  var c = req.cookies;
  var u;
  if(c && c.login){
    u = c.login.username;
  }
  requestData = JSON.parse(req.body);
  User.findOne({username: u})
  .exec(function(err,result){
    if (err) return res.end('FAIL');
    if (!result) return res.end('FAIL');
    var newItem = new Item({
      title: requestData.title,
      description: requestData.description,
      image: requestData.image,
      price: requestData.price,
      stat: requestData.status
    });
    // adds item id to username's listings array
    result.listings.push(newItem._id);
    result.save();

    newItem.save(function(err) {if (err) res.send('FAILED TO ADD ITEM')});

    res.end('SAVED ITEM');
  })
});

app.post('/login/', (req,res) => {
  requestData = JSON.parse(req.body);
  var u = requestData.username;
  var p = requestData.password;
  User.find({username: u, password: p})
    .exec(function(err,result){
      if(err || result.length != 1){
        res.end('FAILED');
      }else{
        addSession(u);
        res.cookie('login', {username: u}, {maxAge: 120000});
        res.end(u);
      }
    });
});

app.get('/get/current', (req,res) => {
  var c = req.cookies;
  if(c && c.login){
    res.end(c.login.username);
  }
})

app.get('/item/purchase/:id', (req,res) =>{
  var c = req.cookies;
  var u;
  if(c && c.login){
    u = c.login.username;
  }
  var id = req.params.id;
  Item.findOne({_id: id}).exec(function(err,result){
    result.stat = 'SOLD';
    result.save();
  });
  User.findOne({username: u}).exec(function(err,result){
    result.purchases.push(id);
    result.save();
  });
  res.end('SOLD ITEM')
})

// displays url for webpage in startup
app.listen(port,function () {
  console.log(`App listening at http://${hostname}:${port}`);
});
