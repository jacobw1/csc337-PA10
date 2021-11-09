/*
  Author: Jacob Williams
  Purpose: server.js contains the  connection to the server and DB
  Useage: node server.js
*/

//creating constant variables
const express =require('express');
const mongoose = require('mongoose');
const app = express();
//digital ocean -> 143.198.105.222
const hostname = 'localhost';
const port = 300;
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
// formating json
app.set('json spaces', 2);
// allowing res.json()
app.use(express.urlencoded({extended: true}));
app.use(express.json());
// gets all the users in a json format
app.get('/get/users', function(req, res){
  if(req.url != '/favicon.ico'){
    User.find({}).exec((err, results) =>{
      res.json(results);
    })
  }
});
// gets all the items in json format
app.get('/get/items', function(req, res){
  if(req.url != '/favicon.ico'){
    Item.find({}).exec((err, results) =>{
      res.json(results);
    })
  }
});
// given a username, this returns the listings under said username
app.get('/get/listings/:username',(req, res) =>{
  User.findOne({username: req.params.username }).exec((err, result) =>{
      if (err) return res.end('FAIL');
      if (!result) return res.end('FAIL');
      Item.find({_id: result.listings}).exec((err,listingResults) => {
        res.json(listingResults);
      });
    });
});
// given a username. this returns the purchases of said username
app.get('/get/purchases/:username',(req, res) =>{
  User.findOne({username: req.params.username }).exec((err, result) =>{
      if (err) return res.end('FAIL');
      if (!result) return res.end('FAIL');
      Item.find({_id: result.purchases}).exec((err,purchasesResults) => {
        res.json(purchasesResults);
      });
    });
});
// shows all users given a keyword substring
app.get('/search/users/:keyword', (req,res) =>{
  User.find({username: {$regex: req.params.keyword }}).exec((err,results) =>{
    res.json(results);
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
  requestData = req.body;
  var newUser = new User({
    username: requestData.username,
    password: requestData.password,
    listings: [],
    purchases: []
  });
  newUser.save(function(err) {if (err) res.send("FAILED TO ADD USER");});
  res.send('SAVED USER');
});
// given a username this adds an item to the db
app.post('/add/item/:username', (req,res) => {
  requestData = req.body;
  User.findOne({username: req.params.username})
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

    res.send('SAVED ITEM');
  })
});
// displays url for webpage in startup
app.listen(port,function () {
  console.log(`App listening at http://${hostname}:${port}`);
});
