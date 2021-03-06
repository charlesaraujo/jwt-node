require("dotenv").config();

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

app.use(express.json());

//NOT USE THIS IN PRODUCTION
// Study purpose only
let refreshTokens = [];

//Refresh token
app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      deleteRefreshToken(refreshToken);
      return res.sendStatus(403);
    }
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken });
  });
});

app.delete("/logout", (req, res) => {
  deleteRefreshToken(req.body.token);
  res.sendStatus(204);
});

// Authenticate user
app.post("/login", (req, res) => {
  const username = req.body.username;
  const user = { name: username };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "40s",
  });
  refreshTokens.push(refreshToken);
  res.json({ accessToken, refreshToken });
});

function deleteRefreshToken(refreshToken) {
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "20s" });
}

app.listen(4000);
