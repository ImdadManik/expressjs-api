// routes/roleRoutes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken, authorizeRole } = require('../utils/authMiddleware');
const router = express.Router();

// Get all roles
router.get('/', authenticateToken, (req, res) => {
  const roles = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8')).roles;
  res.json(roles);
});

// Admin CRUD operations for roles
router.post('/', authenticateToken, authorizeRole(1), (req, res) => {
  const { name } = req.body;
  const roles = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8')).roles;
  const newRole = {
    id: roles.length ? Math.max(roles.map(r => r.id)) + 1 : 1,
    name
  };
  roles.push(newRole);
  fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify({ roles, users: JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8')).users }, null, 2));
  res.status(201).json(newRole);
});

router.put('/:id', authenticateToken, authorizeRole(1), (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const roles = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8')).roles;
  const roleIndex = roles.findIndex(r => r.id === parseInt(id));

  if (roleIndex === -1) return res.status(404).json({ message: 'Role not found' });

  const updatedRole = { ...roles[roleIndex], name };
  roles[roleIndex] = updatedRole;
  fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify({ roles, users: JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8')).users }, null, 2));
  res.json(updatedRole);
});

router.delete('/:id', authenticateToken, authorizeRole(1), (req, res) => {
  const { id } = req.params;
  const roles = JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8')).roles;
  const roleIndex = roles.findIndex(r => r.id === parseInt(id));

  if (roleIndex === -1) return res.status(404).json({ message: 'Role not found' });

  roles.splice(roleIndex, 1);
  fs.writeFileSync(path.join(__dirname, '../db.json'), JSON.stringify({ roles, users: JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8')).users }, null, 2));
  res.status(204).end();
});

module.exports = router;
