// import required for urlsForUser()
let urlDatabase = require('./express_server');

// finds URLs in urlDatabase for given user ID
const urlsForUser = function (id) {
  let keys = Object.keys(urlDatabase);
  let userURLData = {};
  for (let value of keys) {
    if (urlDatabase[value]["userID"] === id) {
      userURLData[value] = urlDatabase[value];
    }
  }
  return userURLData;
}

// find ID from given email
const IDFinder = function(reqParam, obj) {
  let keys = Object.keys(obj);
  for (ids of keys) {
    if (obj[ids]['email'] === reqParam) {
      return obj[ids]["id"];
    }
  }
};

// checks given object/database for given email if found returns true
const emailFinder = function(email, obj) {
  let myArr = Object.keys(obj);
  for (let ids of myArr) {
    if (obj[ids]["email"] === email) {
      return true;
    }
  }
};

// generates random 6 digit alphanumeric string
const generateRandomString = function() {
  let alphNumArr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let retStr = "";
  for (i = 0; i < 6; i++) {
    retStr += alphNumArr[Math.floor(Math.random() * alphNumArr.length)];
  };
  return retStr;
};

module.exports = { IDFinder, emailFinder, generateRandomString, urlsForUser };
