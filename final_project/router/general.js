const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    let uname=req.body.username;
    let pword=req.body.password;
    if (!uname) {
        return res.status(400).json({message: "Please enter your username"})
    }
    if (!pword) {
        return res.status(400).json({message: "Please enter your password"})
    }
    // check database of users
    const numusers=users.length;
    for (let i=0; i<numusers; i++) {
        let user=users[i];
        if (user.username == uname) {
            return res.status(400).json({message: "This user already exists!"})
        }
    }
    let new_user={username: uname, password: pword};
    users.push(new_user);
    //Write your code here
    return res.status(200).json({message: "Successfully registered! as "+uname});
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    console.log("Starting");
    const get_books = new Promise((resolve, reject) => {
        resolve(res.send(JSON.stringify({books}, null, 4)))
    });
    get_books.then(() => console.log("Promise fulfilled"))
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    const isbn=req.params.isbn;
    if (!isbn) {
        return res.status(400).json({message: "Please put an ISBN number!"})
    }
    const get_books_isbn = new Promise((resolve, reject) => {
        if (isbn in books) {
            resolve(res.send(books[isbn]));
        }
        else {
            reject(res.send("Book not found!"))
        }
    });
 });

// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    const author=req.params.author;
    if (!author) {
        return res.status(400).json({message: "Please put an author!"})
    }
    const get_books_author = new Promise((resolve, reject) => {
        let booksbyauthor = [];
        let isbns=Object.keys(books);
        for (const isbn of isbns) {
            if (books[isbn]["author"]==author) {
                booksbyauthor.push({
                    isbn: isbn,
                    author: books[isbn].author,
                    title: books[isbn].title
                });
            }
        }
        if (booksbyauthor.length) {
            resolve(res.send(JSON.stringify({booksbyauthor}, null, 4)));
        }
        else {
            reject(res.send("Author does not exist!"))
        }
    });
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    const title=req.params.title;
    if (title=="") {
        return res.status(400).json({message: "Please put a title!"})
    }
    const get_books_title = new Promise((resolve, reject) => {
        let booksbytitle = []
        let isbns=Object.keys(books);
        for (const isbn of isbns) {
            if (books[isbn]["title"]==title) {
                booksbytitle.push({
                    isbn: isbn,
                    author: books[isbn].author,
                    title: books[isbn].title
                });
            }
        }
        if (booksbytitle.length) {
            resolve(res.send(JSON.stringify({booksbytitle}, null, 4)));
        }
        else {
            reject(res.send("Title does not exist!"))
        }
    });
});

//  Get book review
public_users.get('/review/:isbn',async function (req, res) {
    const isbn=req.params.isbn;
    if (isbn in books) {
        return res.status(200).json(books[isbn].reviews);
    }
    else {
        return res.status(404).json({message: "Book not found!"})
    }
});

module.exports.general = public_users;
