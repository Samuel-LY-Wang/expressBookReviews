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
    return res.status(200).json({message: "Successfully registered!"});
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn',async function (req, res) {
    let isbn=req.query.isbn;
    if (!isbn) {
        return res.status(400).json({message: "Please put an ISBN number!"})
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
        const data=response.data
        const book=data[`ISBN:${isbn}`];
        if (book) {
            return res.status(200).json({
                title: book.title,
                author: book.authors[0].name || "Unknown"
            });
        }
        else {
            return res.status(404).json({message: "Book not found!"});
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({message: error})
    }
 });

// Get book details based on author
public_users.get('/author',async function (req, res) {
    const author=req.query.author;
    if (!author) {
        return res.status(400).json({message: "Please put an author!"})
    }
    if (author=="Unknown") {
        return res.status(200).json({message: "Author unknown!"})
    }
    let book;
    for (let i=1; i<=10; i++) {
        book=books[i];
        if (book.author == author) {
            return res.status(200).json(book);
        }
    }
    return res.status(404).json({message: "Book not found!"});
});

// Get all books based on title
public_users.get('/title',async function (req, res) {
    const title=req.query.title;
    if (!title) {
        return res.status(400).json({message: "Please put a title!"})
    }
  let book;
    for (let i=1; i<=10; i++) {
        book=books[i];
        if (book.title == title) {
            return res.status(200).json(book);
        }
    }
    return res.status(404).json({message: "Book not found!"});
});

//  Get book review
public_users.get('/review',async function (req, res) {
    const isbn=req.query.isbn;
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
                    return res.status(200).json({reviews: check_book.reviews});
                }
            }
            return res.status(404).json({message: "Book not found in database!"});
        }
        else {
            return res.status(404).json({message: "Book not found!"});
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({message: error})
    }
});

module.exports.general = public_users;
