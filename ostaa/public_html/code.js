/*
  Author: Jacob Williams
  Purpose: these are functions that are use when users interact with index.html
  usage: click buttons and enter info in index.html
*/

function login(){
  var httpRequest = new XMLHttpRequest();
  if(!httpRequest){
    return false;
  }
  let u = document.getElementById('username').value;
  let p = document.getElementById('password').value;
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        // response from server
        var response = httpRequest.responseText;
        if(response == 'FAILED'){
          document.getElementById('error_message').innerText = 'Issue logging in with that info';
        }else{
          window.location.href = 'home.html';
        }

      } else { alert('ERROR'); }
    }
  }
  loginUser = {'username': u, 'password':p}
  dataString = JSON.stringify(loginUser);

  let url = '/login/';
  httpRequest.open('POST',url);
  httpRequest.setRequestHeader('Content-type', 'application/json');
  httpRequest.send(dataString);
}



// addUser takes information from the text fields and sends them to server.js to be added into the db
function addUser(){
  var httpRequest = new XMLHttpRequest();
  if(!httpRequest){
    return false;
  }
  // gets info from text inputes
  let u = document.getElementById('username_create').value;
  let p = document.getElementById('password_create').value;

  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {

        console.log(httpRequest.responseText);

      } else { alert('ERROR'); }
    }
  }
  newUser = { 'username': u, 'password': p, 'listings':[], 'purchases':[]}
  dataString = JSON.stringify(newUser);

  let url = '/add/user/';
  httpRequest.open('POST',url);
  httpRequest.setRequestHeader('Content-type', 'application/json');
  httpRequest.send(dataString);
}

// addItem takes information from the text input fields and send them to server.js to be added into the db
function addItem(){
  var httpRequest = new XMLHttpRequest();
  if(!httpRequest){
    return false;
  }
  // get info
  let t = document.getElementById('title').value;
  let d = document.getElementById('desc').value;
  let i = 'temp_image/' + t + '.jpg'; //document.getElementById('image').value;
  let p = document.getElementById('price').value;
  let s = document.getElementById('status').value;

  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {

        if(httpRequest.responseText == 'SAVED ITEM'){
          window.location.href = 'home.html'
        }else{
          console.log("failed to add item");
        }

      } else { alert('ERROR'); }
    }
  }

  newItem = {'title':t,'description':d, 'image':i, 'price':p, 'status':s};
  dataString = JSON.stringify(newItem);

  let url = '/add/item/';
  httpRequest.open('POST',url);
  httpRequest.setRequestHeader('Content-type', 'application/json');
  httpRequest.send(dataString);
}

function searchListings(){
  var httpRequest = new XMLHttpRequest();
  if(!httpRequest){
    return false;
  }
  let keyword = document.getElementById('search').value;

  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        results = JSON.parse(httpRequest.responseText);
        document.getElementById('content').innerHTML = '';
        for(x in results){
          document.getElementById('content').innerHTML += createHtmlListing(results[x]);
        }
      } else { alert('ERROR'); }
    }
  }
  let url = '/search/items/'+keyword;
  httpRequest.open('GET', url);
  httpRequest.send();
}

function getUserListings(){
  var httpRequest = new XMLHttpRequest();
  if(!httpRequest){
    return false;
  }

  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        results = JSON.parse(httpRequest.responseText);
        document.getElementById('content').innerHTML = '';
        for(x in results){
          document.getElementById('content').innerHTML += createHtmlListing(results[x]);
        }
      } else { alert('ERROR'); }
    }
  }
  let url = '/get/listings/user';
  httpRequest.open('GET', url);
  httpRequest.send();
}

function getUserPurchases(){
  var httpRequest = new XMLHttpRequest();
  if(!httpRequest){
    return false;
  }

  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        results = JSON.parse(httpRequest.responseText);
        document.getElementById('content').innerHTML = '';
        for(x in results){
          document.getElementById('content').innerHTML += createHtmlListing(results[x]);
        }
      } else { alert('ERROR'); }
    }
  }
  let url = '/get/purchases/user';
  httpRequest.open('GET', url);
  httpRequest.send();
}

function addWelcome(){
  var httpRequest = new XMLHttpRequest();
  if(!httpRequest){
    return false;
  }
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {

        response = httpRequest.responseText;
        document.getElementById('welcome').innerText = 'Welcome '+response+'! What would you like to do?';

      } else { alert('ERROR'); }
    }
  }
  let url = '/get/current';
  httpRequest.open('GET', url);
  httpRequest.send();
}

function createHtmlListing(data) {
  var retString = '<div class="content_item" id="' + data._id +' ">';
  retString += '<p>'+data.title+'</p>';
  retString += '<p>'+data.image+'</p>';
  retString += '<p>'+data.description+'</p>';
  retString += '<p>'+data.price+'</p>';
  if(data.stat == 'SALE'){
    retString += '<button type="button" onclick="purchaseItem(\''+data._id+'\')">Buy Now!</button>';
  }else{
    retString += '<p> SOLD </p>';
  }
  retString += '</div>'
  return retString;
}

function purchaseItem(id){
  var httpRequest = new XMLHttpRequest();
  if(!httpRequest){
    return false;
  }
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {

        response = httpRequest.responseText;
        console.log(response);

      } else { alert('ERROR'); }
    }
  }
  let url = '/item/purchase/'+id;
  httpRequest.open('GET', url);
  httpRequest.send()

}
