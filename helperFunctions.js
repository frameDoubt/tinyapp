
const IDFinder = function(reqParam, obj) {
  let keys = Object.keys(obj);
  for (ids of keys) {
    if (obj[ids]['email'] === reqParam) {
      return obj[ids]["id"];
    }
  }
};

const emailFinder = function(email, obj) {
  let myArr = Object.keys(obj);
  for (let ids of myArr) {
    if (obj[ids]["email"] === email) {
      return true;
    }
  }
};

const generateRandomString = function() {
  let alphNumArr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let retStr = "";
  for (i = 0; i < 6; i++) {
    retStr += alphNumArr[Math.floor(Math.random() * alphNumArr.length)];
  };
  return retStr;
};

module.exports = { IDFinder, emailFinder, generateRandomString};
