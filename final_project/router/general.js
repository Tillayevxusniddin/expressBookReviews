const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ username, password });
      return res.status(200).json({ message: "Foydalanuvchi muvaffaqiyatli ro‘yxatdan o‘tdi" });
    } else {
      return res.status(400).json({ message: "Foydalanuvchi allaqachon mavjud" });
    }
  }
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const bookList = await new Promise((resolve) => setTimeout(() => resolve(books), 100));
    return res.send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).send("Kitoblarni olishda xatolik");
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    if (books[isbn]) resolve(books[isbn]);
    else reject("Kitob topilmadi");
  })
  .then(book => res.send(book))
  .catch(error => res.status(404).send(error));
 });
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const authorBooks = await new Promise((resolve) => {
      const filtered = Object.values(books).filter(book => book.author === author);
      resolve(filtered);
    });
    res.send(authorBooks);
  } catch (error) {
    res.status(500).send("Kitoblarni olishda xatolik");
  }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  new Promise((resolve) => {
    const titleBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title));
    resolve(titleBooks);
  })
  .then(books => res.send(books))
  .catch(error => res.status(500).send("Kitoblarni olishda xatolik"));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.send(books[isbn].reviews);
});

module.exports.general = public_users;
