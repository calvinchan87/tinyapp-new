const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Responds with a redirection to /urls/:shortURL, where shortURL is the random string we generated
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Redirect Short URLs
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
// A link for shortening a new URL. This will be a dead link for now (href='#') as we will build the page for this functionality later.

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});
// Also include a link (href='#') for creating a new url.

app.post("/urls/:shortURL", (req, res) => {
  let prefixOne = "http://";
  let prefixTwo = "https://";
  if (req.body.longURLedit.substr(0, prefixOne.length) !== prefixOne && req.body.longURLedit.substr(0, prefixTwo.length) !== prefixTwo) {
    req.body.longURLedit = prefixOne + req.body.longURLedit;
  }
  urlDatabase[req.params.shortURL] = req.body.longURLedit;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
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