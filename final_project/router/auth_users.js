const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Foydalanuvchi nomi va parol kiritilishi shart" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ // Tokenni javobda qaytarish
            message: "Foydalanuvchi muvaffaqiyatli kirdi",
            accessToken: accessToken
        });
  } else {
    return res.status(401).json({ message: "Noto‘g‘ri ma’lumotlar" });
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;
  if (books[isbn]) {
    books[isbn].reviews[username] = review;
    res.send(`ISBN ${isbn} ga sharh qo‘shildi/yangilandi`);
  } else {
    res.status(404).send("Kitob topilmadi");
  }
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (books[isbn] && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    res.send(`ISBN ${isbn} uchun sharh o‘chirildi`);
  } else {
    res.status(404).send("Sharh topilmadi");
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
