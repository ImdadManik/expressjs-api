// routes/authRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const SECRET_KEY = "thisismykey";
const dbPath = path.join(__dirname, "../database.json");

// Register route
router.post("/register", (req, res) => { 
  const { FIRSTNAME, LASTNAME, EMAIL, PASSWORD, ROLE } = req.body;
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  const users = db.USERS || []; 
  const userExists = users.some((u) => u.EMAIL === EMAIL);

  if (userExists)
    return res.status(400).json({ message: "Email already exists" });

  bcrypt.hash(PASSWORD, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: "Server error" });

    const newUser = {
      ID: users.length ? Math.max(users.map((u) => u.ID)) + 1 : 1,
      FIRSTNAME,
      LASTNAME,
      EMAIL,
      PASSWORD: hashedPassword,
      ROLE,
    };

    users.push(newUser);
    db.users = users;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    res.status(201).json(newUser);
  });
});

// Login route
router.post("/login", (req, res) => {
  const { EMAIL, PASSWORD } = req.body; 
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8")); 
  const users = db.USERS; 
  const user = users.find((u) => u.EMAIL === EMAIL); 

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  bcrypt.compare(PASSWORD, user.PASSWORD, (err, result) => {
    if (err || !result)
      return res.status(401).json({ message: "Invalid credentials" });  
    
    const role = db.ROLES.find(r => r.ROLE === user.ROLE);    

    if (!role) {
      return res.status(500).json({ message: "Role not found" });
    }

    const permissions = [...role.PERMISSION]; // Spread to avoid mutating the original array
    permissions.push(`ROLE_${user.ROLE}`); 

    const _jwt_user = 
    {
      ID: user.ID,
      EMAIL: user.EMAIL
    };

    const accessToken = jwt.sign(_jwt_user, SECRET_KEY, {
      expiresIn: "1d",
    });

    const refresh_token = jwt.sign(_jwt_user, SECRET_KEY, {
      expiresIn: "1d",
    });

     // Respond with the desired JSON structure
     res.json({
      id: user.ID,
      email: user.EMAIL,
      roles: permissions,
      access_token: accessToken,
      refresh_token: refresh_token,
      token_type: "BEARER"
    }); 
  });
});

module.exports = router;
