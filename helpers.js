// Function logic from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
const generateRandomString = function(length) {
  let result = [];
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
  }
  return result.join("");
};

const prefixURLIfNeeded = function(url) {
  let prefixOne = "http://";
  let prefixTwo = "https://";
  if (url.substr(0, prefixOne.length) !== prefixOne && url.substr(0, prefixTwo.length) !== prefixTwo) {
    url = prefixOne + url;
  }
  return url;
};

const urlsForUser = function(id) {
  let urlDatabaseUserSpecific = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urlDatabaseUserSpecific[url] = urlDatabase[url];
    }
  }
  return urlDatabaseUserSpecific;
};

const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (email === database[user].email) {
      return user;
    }
  }
  return false;
};

module.exports = { generateRandomString, prefixURLIfNeeded, urlsForUser, getUserByEmail };