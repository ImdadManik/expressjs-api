const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken, authorizeRole } = require('../utils/authMiddleware');
const router = express.Router();

// Get all roles
router.get('/', authenticateToken, (req, res) => {
  const roles = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8')).ROLES;
  res.json(roles);
});

// Admin CRUD operations for roles
router.post('/', authenticateToken, authorizeRole('ADMIN'), (req, res) => {
  const { ROLE, PERMISSION } = req.body;
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8'));
  const newRole = {
    ROLE,
    PERMISSION
  };
  db.ROLES.push(newRole);
  fs.writeFileSync(path.join(__dirname, '../database.json'), JSON.stringify(db, null, 2));
  res.status(201).json(newRole);
});

router.put('/:role', authenticateToken, authorizeRole('ADMIN'), (req, res) => {
  const { role } = req.params;
  const { PERMISSION } = req.body;
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8'));
  const roleIndex = db.ROLES.findIndex(r => r.ROLE === role);

  if (roleIndex === -1) return res.status(404).json({ message: 'Role not found' });

  db.ROLES[roleIndex].PERMISSION = PERMISSION;
  fs.writeFileSync(path.join(__dirname, '../database.json'), JSON.stringify(db, null, 2));
  res.json(db.ROLES[roleIndex]);
});

router.delete('/:role', authenticateToken, authorizeRole('ADMIN'), (req, res) => {
  const { role } = req.params;
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8'));
  const roleIndex = db.ROLES.findIndex(r => r.ROLE === role);

  if (roleIndex === -1) return res.status(404).json({ message: 'Role not found' });

  db.ROLES.splice(roleIndex, 1);
  fs.writeFileSync(path.join(__dirname, '../database.json'), JSON.stringify(db, null, 2));
  res.status(204).end();
});

module.exports = router;
