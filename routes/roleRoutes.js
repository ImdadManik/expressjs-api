const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken, authorizeRole } = require('../utils/authMiddleware');
const router = express.Router();

// Get all roles
router.get('/', authenticateToken, (req, res) => {
  const roles = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8')).roles;
  res.json(roles);
});

// Admin CRUD operations for roles
router.post('/', authenticateToken, authorizeRole('ADMIN'), (req, res) => {
  const { role, permission } = req.body;
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8'));
  const newRole = {
    role,
    permission
  };
  db.roles.push(newRole);
  fs.writeFileSync(path.join(__dirname, '../database.json'), JSON.stringify(db, null, 2));
  res.status(201).json(newRole);
});

router.put('/:role', authenticateToken, authorizeRole('ADMIN'), (req, res) => {
  const { role } = req.params;
  const { permission } = req.body;
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8'));
  const roleIndex = db.roles.findIndex(r => r.role === role);

  if (roleIndex === -1) return res.status(404).json({ message: 'Role not found' });

  db.roles[roleIndex].permission = permission;
  fs.writeFileSync(path.join(__dirname, '../database.json'), JSON.stringify(db, null, 2));
  res.json(db.roles[roleIndex]);
});

router.delete('/:role', authenticateToken, authorizeRole('ADMIN'), (req, res) => {
  const { role } = req.params;
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8'));
  const roleIndex = db.roles.findIndex(r => r.role === role);

  if (roleIndex === -1) return res.status(404).json({ message: 'Role not found' });

  db.roles.splice(roleIndex, 1);
  fs.writeFileSync(path.join(__dirname, '../database.json'), JSON.stringify(db, null, 2));
  res.status(204).end();
});

module.exports = router;
