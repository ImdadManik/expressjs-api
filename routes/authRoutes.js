// routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const SECRET_KEY = 'thisismykey';
const dbPath = path.join(__dirname, '../db.json');

// Register route
router.post('/register', (req, res) => {
  const { username, password, email, role_id } = req.body;
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const users = db.users;
  const userExists = users.some(u => u.username === username);

  if (userExists) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    const newUser = {
      id: users.length ? Math.max(users.map(u => u.id)) + 1 : 1,
      username,
      password: hashedPassword,
      email,
      role_id
    };
    users.push(newUser);
    db.users = users;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    res.status(201).json(newUser);
  });
});

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const users = db.users;
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (err || !result) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role_id: user.role_id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  });
});

module.exports = router;
