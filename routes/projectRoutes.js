// routes/projectRoutes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken, authorizeRole } = require('../utils/authMiddleware');
const router = express.Router();
const dbPath = path.join(__dirname, '../database.json');

// Get all projects
router.get('/', authenticateToken, (req, res) => {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  res.json(db.projects);
});

// Get project by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const project = db.projects.find(p => p.id === parseInt(id));
  if (project) {
    res.json(project);
  } else {
    res.status(404).json({ message: 'Project not found' });
  }
});

// Create new project (Admin only)
router.post('/', authenticateToken, authorizeRole(1), (req, res) => {
  const { name, description, start_date, end_date, user_id } = req.body;
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const newProject = {
    id: db.projects.length ? Math.max(...db.projects.map(p => p.id)) + 1 : 1,
    name,
    description,
    start_date,
    end_date,
    user_id
  };
  db.projects.push(newProject);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.status(201).json(newProject);
});

// Update project (Admin only)
router.put('/:id', authenticateToken, authorizeRole('ADMIN'), (req, res) => {
  const { id } = req.params;
  const { name, description, start_date, end_date, user_id } = req.body;
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const projectIndex = db.projects.findIndex(p => p.id === parseInt(id));

  if (projectIndex === -1) return res.status(404).json({ message: 'Project not found' });

  const updatedProject = { ...db.projects[projectIndex], name, description, start_date, end_date, user_id };
  db.projects[projectIndex] = updatedProject;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.json(updatedProject);
});

// Delete project (Admin only)
router.delete('/:id', authenticateToken, authorizeRole('ADMIN'), (req, res) => {
  const { id } = req.params;
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const projectIndex = db.projects.findIndex(p => p.id === parseInt(id));

  if (projectIndex === -1) return res.status(404).json({ message: 'Project not found' });

  db.projects.splice(projectIndex, 1);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.status(204).end();
});

module.exports = router;
