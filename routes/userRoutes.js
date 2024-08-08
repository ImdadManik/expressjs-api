// routes/userRoutes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { authenticateToken, authorizeRole } = require('../utils/authMiddleware');
const router = express.Router();

// Update user route
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, password } = req.body;
  const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8')).users;
  const userIndex = users.findIndex(u => u.id === parseInt(id));

  if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

  // Allow admin to update any user, but users can only update their own record
  if (req.user.role_id !== 1 && req.user.id !== parseInt(id)) {
    return res.sendStatus(403);
  }

  if (password) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ message: 'Server error' });

      const updatedUser = { ...users[userIndex], firstname, lastname, email, password: hashedPassword };
      users[userIndex] = updatedUser;
      fs.writeFileSync(path.join(__dirname, '../database.json'), JSON.stringify({ roles: JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8')).roles, users }, null, 2));
      res.json(updatedUser);
    });
  } else {
    const updatedUser = { ...users[userIndex], firstname, lastname, email };
    users[userIndex] = updatedUser;
    fs.writeFileSync(path.join(__dirname, '../database.json'), JSON.stringify({ roles: JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8')).roles, users }, null, 2));
    res.json(updatedUser);
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  const user = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8')).users.find(u => u.id === req.user.id);
  res.json(user);
});

// Admin CRUD operations for users
router.post('/', authenticateToken, authorizeRole(1), (req, res) => {
  const { firstname, lastname, username, password, email, role } = req.body;
  const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8')).users;
  const userExists = users.some(u => u.username === username);

  if (userExists) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    const newUser = {
      id: users.length ? Math.max(users.map(u => u.id)) + 1 : 1,
      firstname,
      lastname,
      username,
      password: hashedPassword,
      email,
      role
    };
    users.push(newUser);
    fs.writeFileSync(path.join(__dirname, '../database.json'), JSON.stringify({ roles: JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8')).roles, users }, null, 2));
    res.status(201).json(newUser);
  });
});

router.get('/', authenticateToken, authorizeRole(1), (req, res) => {
  const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8')).users;
  res.json(users);
});

router.delete('/:id', authenticateToken, authorizeRole(1), (req, res) => {
  const { id } = req.params;
  const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8')).users;
  const userIndex = users.findIndex(u => u.id === parseInt(id));

  if (userIndex === -1) return res.status(404).json({ message: 'User not found' });

  users.splice(userIndex, 1);
  fs.writeFileSync(path.join(__dirname, '../database.json'), JSON.stringify({ roles: JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8')).roles, users }, null, 2));
  res.status(204).end();
});

module.exports = router;
