const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {"username": "user1", "password": "pass1"},
    {"username": "user2", "password": "pass2"},
    {"username": "user3", "password": "pass3"},
    {"username": "user4", "password": "pass4"},
    {"username": "user5", "password": "pass5"},
];

let SECRET_KEY="This_is_secret_key" // insecure as this is a test app

const isValid = (username)=>{
    let numusers=users.length;
    for (let i=0; i<numusers; i++) {
        if (username==users[i].username) {
            return true
        }
    }
    return false
}

const authenticatedUser = (username,password)=>{
    let numusers=users.length;
    for (let i=0; i<numusers; i++) {
        if (username==users[i].username && password==users[i].password) {
            return true
        }
    }
    return false
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  let uname=req.body.username;
  let pword=req.body.password;
  if (!uname) {
    return res.status(400).json({message: "Please enter your username!"});
  }
  if (!pword) {
    return res.status(400).json({message: "Please enter your password!"});
  }
  if (!isValid(uname)) {
    return res.status(400).json({message: "This is not a valid user!"});
  }
  if (authenticatedUser(uname, pword)) {
    const token=jwt.sign({username: uname}, SECRET_KEY, {expiresIn: '1h'});
    return res.status(300).json({message: "Successfully logged in!", token});
  }
  return res.status(400).json({message: "Username or Password was incorrect"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
