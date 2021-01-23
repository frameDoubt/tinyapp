const { assert } = require('chai');

const { emailFinder } = require('../helperFunctions.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('emailFinder', function(){
  it('should return true if user email is found in object', function() {
    const user = emailFinder("user@example.com", testUsers);
    const expectedOutput = true;

    assert.equal(user, expectedOutput);
  })

  it('should return false if user email is not found in object', function() {
    const user = emailFinder("brandon@brandon.com", testUsers)
    const expectedOutput = undefined;

    assert.equal(user, expectedOutput);
  })
});