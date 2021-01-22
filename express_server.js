const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const PORT = 8080;
const { emailFinder, IDFinder, generateRandomString } = require('./helperFunctions');

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

let urlDatabase = {
  "b2xVn2": { 
    longURL: "http://www.lighthouse.ca", userID: "aJ48lW"
 },
  "9sm5xK": { 
    longURL: "http://www.google.com", userID: "aJ48lW"
 },
  "h6sie9": {
    longURL: "http://www.msn.ca", userID: "userRandomID" 
  },
  "wp2n95": {
    longURL: "http://www.yahoo.ca", userID: "user2RandomID"
  }
};

const user = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2b$10$RP24GkddyO/7CCF0nl4zHOexhAnT4E1.u6.z0LtnARYtpr6NQKr5a"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "placeholder"
  }
};

const urlsForUser = function(id) {
  let keys = Object.keys(urlDatabase);
  let userURLData = {};
  for (let value of keys) {
    if (urlDatabase[value]["userID"] === id) {
      userURLData[value] = urlDatabase[value];
    }
  }
  return userURLData;
}

app.get("/register", (req, res) => {
  if (!req.cookies["user_id"]) {
    let tempVar = { urls: urlDatabase, email: 0 };
    res.render("urls_register", tempVar);
  }
  res.render("urls_register", { 
    urls: urlDatabase, 
    user_id: req.cookies["user_id"], 
    email: user[req.cookies.user_id]["email"] });
});

app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    let tempVar = { urls: urlDatabase, email: 0 };
    res.render("urls_index", tempVar);
  }
  const templateVars = { 
    urls: urlsForUser(req.cookies["user_id"]),
    user_id: req.cookies["user_id"], 
    email: user[req.cookies.user_id]["email"]
  };
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  if (!req.cookies["user_id"]) {
    let tempVar = { urls: urlDatabase, email: 0 };
    res.render("urls_login", tempVar);
  }
  res.render("urls_login");
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    let tempVar = { urls: urlDatabase, email: 0 };
    res.render("urls_login", tempVar);
  }
  const templateVars = { 
    user_id: req.cookies["user_id"], 
    email: user[req.cookies.user_id]["email"] 
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies["user_id"]) {
    let tempVar = { urls: urlDatabase, email: 0, shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL]["longURL"] };
    res.render("urls_show", tempVar);
  }
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]["longURL"], 
    user_id: req.cookies["user_id"], 
    email: user[req.cookies.user_id]["email"] 
  };
  res.render("urls_show", templateVars);
});

app.post("/register", (req, res) => {
  let regEmail = req.body.email;
  let regPass = req.body.password;
  if (emailFinder(regEmail, user)) {
    res.status(400).send('Oops a user already has that email.');
  } else if (regEmail || req.body.password) {
    let hashedPword = bcrypt.hashSync(req.body.password, 10);
    let randUserID = generateRandomString();
    user[randUserID] = {
      id: randUserID,
      email: regEmail,
      password: hashedPword
    };
    res.cookie("user_id", randUserID);
    res.redirect("/urls");
  } else {
    res.status(400).send('Oops something went wrong.');
  }
});

app.post("/login", (req, res) => {
  let userID = IDFinder(req.body.email, user);
  let inputPass = req.body.password;
  let inputEmail = req.body.email;
  let hashMatch = bcrypt.compareSync(inputPass, user[userID]["password"]);

  if (emailFinder(inputEmail, user) && hashMatch) {
    res.cookie("user_id", userID);
    res.redirect("/urls");
  } else if (!emailFinder(req.body.email, user)) {
    res.status(403).send("Oops something went wrong. Don't worry we're on it.");
  } else {
    res.status(403).send("Sure hope you know what you're doing!");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    shortURL: shortURL,
    longURL: req.body["longURL"],
    userID: req.cookies["user_id"]
  }
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (urlDatabase[req.params.shortURL]["userID"] === req.cookies["user_id"]) {
    urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.send("Your account isn't allowed to edit this content.");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL]["userID"] === req.cookies["user_id"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    res.send("Your account isn't allowed to delete this content.");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = { urlDatabase };