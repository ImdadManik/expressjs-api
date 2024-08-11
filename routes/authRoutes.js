// routes/authRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const router = express.Router();
 
 
const dbPath = path.join(__dirname, "../database.json");

// Register route
router.post("/register", (req, res) => {
  const { firstname, lastname, email, password, role } = req.body;
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  const users = db.users || [];
  const userExists = users.some((u) => u.email === email);

  if (userExists)
    return res.status(400).json({ message: "Email already exists" });

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: "Server error" });

    const newUser = {
      id: users.length ? Math.max(users.map((u) => u.id)) + 1 : 1,
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role,
    };

    users.push(newUser);
    db.users = users;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    res.status(201).json(newUser);
  });
});

// Login route
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  const users = db.users;
  const user = users.find((u) => u.email === email);

  console.log(process.env.JWT_SECRET);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  bcrypt.compare(password, user.password, (err, result) => {
    if (err || !result)
      return res.status(401).json({ message: "Invalid credentials" });

    const role = db.roles.find(r => r.role === user.role);

    if (!role) {
      return res.status(500).json({ message: "Role not found" });
    }

    const permissions = [...role.permission]; // Spread to avoid mutating the original array
    permissions.push(`ROLE_${user.role}`);

    
    const _jwt_user =
    {
      id: user.id,
      email: user.email
    };
    console.log(permissions);
    const access_Token = jwt.sign(_jwt_user, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const refresh_token = jwt.sign(_jwt_user, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    console.log('access token:' +  access_Token);
    console.log('refresh token:' + refresh_token);
    // Set cookies
    res.cookie(process.env.JWT_COOKIE_NAME, access_Token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.cookie(process.env.REFRESH_TOKEN_COOKIE_NAME, refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });


    // Respond with the desired JSON structure
    res.json({
      id: user.id,
      email: user.email,
      roles: permissions,
      access_token: access_Token,
      refresh_token: refresh_token,
      token_type: "BEARER"
    });
  });
});

// Logout route
router.post('/logout', (req, res) => {
  const accessToken = req.cookies[process.env.JWT_COOKIE_NAME]; // Access token cookie name
  const refreshToken = req.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME]; // Refresh token cookie name

  // Clear cookies
  res.clearCookie(process.env.JWT_COOKIE_NAME, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.clearCookie(process.env.REFRESH_TOKEN_COOKIE_NAME, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
