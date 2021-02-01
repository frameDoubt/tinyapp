const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');
const PORT = 8080;
const { emailFinder, IDFinder, generateRandomString, urlsForUser } = require('./helperFunctions');

// ejs html js hybrid template system
app.set("view engine", "ejs");

// parses incoming request body
app.use(bodyParser.urlencoded({ extended: true }));

// library used to hash cookie data
app.use(cookieSession({
  name: "user_name",
  keys: ['secret-cypher', "superFunFun", "happy-happy-joy-joy"]
}));

// tester code url database
const urlDatabase = {
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
// tester code user objects
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
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "winterfell@theNorth.com",
    password: "$2b$10$RP24GkddyO/7CCF0nl4zHOexhAnT4E1.u6.z0LtnARYtpr6NQKr5a"
  }
};

// root route handler redirects to login 
// if user has no cookie else redirects urls/index page
app.get("/", (req, res) => {
  if (!req.session["user_id"]) {
    res.redirect("/login");
  }
  res.redirect("/urls");
});

// register route handler
app.get("/register", (req, res) => {
  // checks for cookie if none user assigned default value
  if (!req.session["user_id"]) {
    let tempVar = { urls: urlDatabase, email: 0 };
    res.render("urls_register", tempVar);
  }
  res.render("urls_register", {
    urls: urlDatabase,
    user_id: req.session["user_id"],
    email: user[req.session.user_id]["email"]
  });
});

// urls index page route handler
app.get("/urls", (req, res) => {
  // checks for cookie if none user assigned default value
  if (!req.session["user_id"]) {
    let tempVar = { urls: urlDatabase, email: 0 };
    res.render("urls_index", tempVar);
  } else {  
  // this part represents the success route
  const templateVars = {
    urls: urlsForUser(req.session["user_id"], urlDatabase),
    user_id: req.session["user_id"],
    email: user[req.session.user_id]["email"]
  };
  console.log(templateVars['urls']);
  res.render("urls_index", templateVars);
  };
});

// login route handler
app.get("/login", (req, res) => {
  // checks for cookie if none user assigned default value
  if (!req.session["user_id"]) {
    let tempVar = { urls: urlDatabase, email: 0 };
    res.render("urls_login", tempVar);
  }
  res.redirect("/urls");
});

// new URL page route handler
app.get("/urls/new", (req, res) => {
  // if no cookie is detected redirected to login page
  if (!req.session["user_id"]) {
    res.redirect("/login");
  }
  // else cookie parameters passed template variables
  // and template is urls_new template rendered
  const templateVars = {
    user_id: req.session["user_id"],
    email: user[req.session.user_id]["email"]
  };
  res.render("urls_new", templateVars);
});

// uses endpoint to search for shortURL
app.get("/u/:shortURL", (req, res) => {
  let userShortSearch = req.params.shortURL;
  if (!urlDatabase[userShortSearch]) {
    res.send("Sorry that URL doesn't exist")
  } else {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    res.redirect(longURL);
  }
});

// direct get of shortURL
app.get("/urls/:shortURL", (req, res) => {
  // checks for cookie if none user assigned default value
  if (!req.session["user_id"]) {
    let tempVar = {
      urls: urlDatabase, email: 0, shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"]
    };
    res.render("urls_show", tempVar);
  }
  if (!Object.values(urlDatabase).indexOf(req.params.shortURL) > 0) {
    res.send("Sorry that URL, doesn't exist");
  }
  if (urlDatabase[req.params.shortURL]["userID"] === req.session["user_id"]) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      user_id: req.session["user_id"],
      email: user[req.session.user_id]["email"]
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("Your account isn't allowed to view this content.");
  }
});

app.post("/register", (req, res) => {
  let regEmail = req.body.email;
  let regPass = req.body.password;
  if (emailFinder(regEmail, user)) {
    res.status(400).send('Oops a user already has that email.');
  } else if (!regEmail || !regPass) {
    res.send("Please fill fields before submission");
  } else if (regEmail || regPass) {
    let hashedPword = bcrypt.hashSync(regPass, 10);
    let randUserID = generateRandomString();
    user[randUserID] = {
      id: randUserID,
      email: regEmail,
      password: hashedPword
    };
    req.session.user_id = randUserID;
    res.redirect("/urls");
  }
});

// login post request handler
app.post("/login", (req, res) => {
  // variables recieved from form post request
  // and hash comparison result
  let inputPass = req.body.password;
  let inputEmail = req.body.email;
  if (!emailFinder(inputEmail, user)) {
    res.send("Oops something went wrong. Don't worry we're on it. email");
  }
  let userID = IDFinder(req.body.email, user);
  let hashMatch = bcrypt.compareSync(inputPass, user[userID]["password"]);
  if (!hashMatch) {
    res.send("Oops something went wrong. Don't worry we're on it. pWord");
  };
  // if emailFinder() and password input comparison evaluate to true
  // cookie is given to user else if given email or password is not in data
  //  403 status is sent back with a message
  if (emailFinder(inputEmail, user) && hashMatch) {
    req.session.user_id = userID;
    res.redirect("/urls");
  } 
});

// logout post handler
app.post("/logout", (req, res) => {
  // recieves post request from button
  // removes user's cookie
  req.session.user_id = null;
  res.redirect("/urls");
});

// new url post request handler
app.post("/urls", (req, res) => {
  // if user has no cookie user is asked is sent to login page
  if (!req.session["user_id"]) {
    res.redirect("/login");
  }
  // random 6 digit alphanumeric string
  const shortURL = generateRandomString();
  // new url with shortURL added to database
  urlDatabase[shortURL] = {
    shortURL: shortURL,
    longURL: req.body["longURL"],
    userID: req.session["user_id"]
  }
  // redirected to newly created URL viewing page
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (urlDatabase[req.params.shortURL]["userID"] === req.session["user_id"]) {
    urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.send("Your account isn't allowed to edit this content.");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL]["userID"] === req.session["user_id"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    res.send("Your account isn't allowed to delete this content.");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
