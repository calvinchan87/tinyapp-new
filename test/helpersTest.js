const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert(testUsers[user].id === expectedOutput, "User ID does not match expected output");
  });
  it('should return undefined if we pass in an email that is not in our users database', function() {
    const user = getUserByEmail("user3@example.com", testUsers);
    assert.isUndefined(user, "Non-existant User is returning undefined as expected");
  });
});