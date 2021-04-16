const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["perth", "minnesota", "holocene"]
}));

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const {
  generateRandomString,
  prefixURLIfNeeded,
  urlsForUser,
  getUserByEmail
} = require('./helpers');

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt)
  }
};

app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id] === undefined) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

// Responds with a redirection to /urls/:shortURL, where shortURL is the random string we generated
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL: prefixURLIfNeeded(req.body.longURL),
    userID: users[req.session.user_id].id
  };
  res.redirect(`/urls/${shortURL}`);
});

// Redirect Short URLs
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  if (users[req.session.user_id] === undefined) {
    return res.status(401).send("URLs can not be displayed unless you <a href='/login'>login</a> or <a href='/register'>register</a> first.");
  }
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(users[req.session.user_id].id, urlDatabase)
  };
  res.render("urls_index", templateVars);
});
// A link for shortening a new URL. This will be a dead link for now (href='#') as we will build the page for this functionality later.

app.get("/urls/:shortURL", (req, res) => {
  if (users[req.session.user_id].id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(401).send("The details of this URL can not be accessed because it does not belong to you.");
  }
  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});
// Also include a link (href='#') for creating a new url.

app.post("/urls/:shortURL", (req, res) => {
  if (users[req.session.user_id].id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(401).send("This URL can not be edited because it does not belong to you.");
  }
  urlDatabase[req.params.shortURL].longURL = prefixURLIfNeeded(req.body.longURLedit);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.session.user_id].id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(401).send("This URL can not be deleted because it does not belong to you.");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let retrievedUser = getUserByEmail(req.body.email, users);
  if (retrievedUser === undefined) {
    return res.status(403).send("A user with this email address does not exist.");
  }
  if (bcrypt.compareSync(req.body.password, users[retrievedUser].password)) {
    req.session.user_id = users[retrievedUser].id;
    return res.redirect("/urls");
  }
  res.status(403).send("The password entered does not match the one associated with this email address.");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Please enter a valid email address and password.");
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("A user already exists with this email address.");
  }
  let userID = generateRandomString(6);
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, salt)
  };
  req.session.user_id = userID;
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});