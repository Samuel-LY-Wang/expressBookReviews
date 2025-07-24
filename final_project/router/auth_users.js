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
    return res.status(200).json({message: "Successfully logged in!"});
  }
  return res.status(400).json({message: "Username or Password was incorrect"});
});

// Add a book review
regd_users.put("/auth/review", async (req, res) => {
    // get the book from the ISBN
    const isbn=req.query.isbn;
    if (!isbn) {
        return res.status(400).json({message: "No ISBN entered!"})
    }
    // console.log(req.session.user);
    if (!req.session.user) {
        return res.status(403).json({message: "User not logged in!"})
    }
    var req_book=null;
    try {
        let response=await axios.get(
            `https://openlibrary.org/api/books`,
            {
                params: {
                    bibkeys: `ISBN:${isbn}`,
                    format: 'json',
                    jscmd: 'data'
                }
            }
        );
        const book=response.data[`ISBN:${isbn}`];
        if (book) {
            // console.log({title: book.title, author: book.authors[0].name});
            for (let i=1; i<=10; i++) {
                const check_book=books[i];
                const author = book.authors[0].name || "Unknown";
                if (book.title==check_book.title && author==check_book.author) {
                    req_book=check_book;
                }
            }
            if (!req_book) {
                return res.status(404).json({message: "Book not found in database!"});
            }
        }
        else {
            return res.status(404).json({message: "Book not found!"});
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({message: error})
    }
    let reviews=req_book.reviews;
    let new_review=req.body.review;
    if (!new_review) {
        return res.status(400).json({message: "Please write a review!"});
    }
    if (req.session.user in reviews) {
        reviews[req.session.user]=new_review;
        return res.status(200).json({message: "Review successfully updated!"});
    }
    else {
        reviews[req.session.user]=new_review;
        return res.status(200).json({message: "Review successfully added!"});
    }
});

// Delete a book review
regd_users.delete("/auth/review", async (req, res) => {
    // get the book from the ISBN
    const isbn=req.query.isbn;
    if (!isbn) {
        return res.status(400).json({message: "No ISBN entered!"})
    }
    // console.log(req.session.user);
    if (!req.session.user) {
        return res.status(403).json({message: "User not logged in!"})
    }
    try {
        let response=await axios.get(
            `https://openlibrary.org/api/books`,
            {
                params: {
                    bibkeys: `ISBN:${isbn}`,
                    format: 'json',
                    jscmd: 'data'
                }
            }
        );
        const book=response.data[`ISBN:${isbn}`];
        if (book) {
            // console.log({title: book.title, author: book.authors[0].name});
            for (let i=1; i<=10; i++) {
                const check_book=books[i];
                const author = book.authors[0].name || "Unknown";
                if (book.title==check_book.title && author==check_book.author) {
                    req_book=check_book;
                }
            }
            if (!req_book) {
                return res.status(404).json({message: "Book not found in database!"});
            }
        }
        else {
            return res.status(404).json({message: "Book not found!"});
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({message: error})
    }
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
