const express = require('express');
const axios = require('axios');
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
    if (req.session.user) {
        return res.status(200).json({message: "Already logged in!"});
    }
    let token = jwt.sign({ username: uname }, "access", { expiresIn: "1h" });
    req.session.authorization = { accessToken: token }; // <-- Important
    req.session.user=uname;
    // console.log(req.session.user);
    return res.status(200).json({message: `Successfully logged in as ${uname}!`});
  }
  return res.status(400).json({message: "Username or Password was incorrect"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", async (req, res) => {
    // get the book from the ISBN
    const isbn=req.params.isbn;
    if (!isbn) {
        return res.status(400).json({message: "No ISBN entered!"})
    }
    // console.log(req.session.user);
    if (!req.session.user) {
        return res.status(403).json({message: "User not logged in!"})
    }
    if (! (isbn in books)) {
        return res.status(400).json({message: "Invalid ISBN!"})
    }
    var req_book=books[isbn];
    let reviews=req_book.reviews;
    let new_review=req.body.review;
    if (!new_review) {
        return res.status(400).json({message: "Please write a review!"});
    }
    if (req.session.user in reviews) {
        reviews[req.session.user]=new_review;
        return res.status(200).json({message: `Review successfully updated for book ${isbn}!`});
    }
    else {
        reviews[req.session.user]=new_review;
        return res.status(200).json({message: `Review successfully added for book ${isbn}!`});
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", async (req, res) => {
    // get the book from the ISBN
    const isbn=req.params.isbn;
    if (!isbn) {
        return res.status(400).json({message: "No ISBN entered!"})
    }
    // console.log(req.session.user);
    if (!req.session.user) {
        return res.status(403).json({message: "User not logged in!"})
    }
    if (!(isbn in books)) {
        return res.status(400).json({message: "Invalid ISBN!"})
    }
    let req_book=books[isbn];
    let reviews=req_book.reviews;
    if (req.session.user in reviews) {
        delete reviews[req.session.user];
        return res.status(200).json({message: "Review successfully deleted"});
    }
    else {
        return res.status(400).json({message: "You have not reviewed this book!"});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
