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
  const { name, description, start_date, end_date, city, phone } = req.body; 
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const newProject = {
    id: db.projects.length ? Math.max(...db.projects.map(p => p.id)) + 1 : 1,
    name,
    description,
    start_date,
    end_date,
    city,
    phone
  }; 
  db.projects.push(newProject);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.status(201).json(newProject);
});

// Update project (Admin only)
router.put('/:id', authenticateToken, authorizeRole(1), (req, res) => {
  const { id } = req.params;
  const { name, description, start_date, end_date, user_ids } = req.body;
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const projectIndex = db.projects.findIndex(p => p.id === parseInt(id));

  if (projectIndex === -1) return res.status(404).json({ message: 'Project not found' });

  const updatedProject = { ...db.projects[projectIndex], name, description, start_date, end_date };
  db.projects[projectIndex] = updatedProject;
  
  // Update project-user associations
  db.project_users = db.project_users.filter(pu => pu.project_id !== parseInt(id));
  db.project_users.push(...user_ids.map(user_id => ({ project_id: updatedProject.id, user_id })));
  
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.json(updatedProject);
});

// Delete project (Admin only)
router.delete('/:id', authenticateToken, authorizeRole(1), (req, res) => {
  const { id } = req.params;
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const projectIndex = db.projects.findIndex(p => p.id === parseInt(id));

  if (projectIndex === -1) return res.status(404).json({ message: 'Project not found' });

  db.projects.splice(projectIndex, 1);
  db.project_users = db.project_users.filter(pu => pu.project_id !== parseInt(id));
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.status(204).end();
});

// Get users associated with a project (requires token)
router.get('/:id/users', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const userIds = db.project_users.filter(pu => pu.project_id === parseInt(id)).map(pu => pu.user_id);
  const users = db.users.filter(u => userIds.includes(u.id));
  res.json(users);
});

// Add users to a project (Admin only)
router.post('/:id/users', authenticateToken, authorizeRole(1), (req, res) => {
  const { id } = req.params;
  const { user_ids } = req.body;
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const project = db.projects.find(p => p.id === parseInt(id));

  if (!project) return res.status(404).json({ message: 'Project not found' });

  const existingUserIds = db.project_users.filter(pu => pu.project_id === parseInt(id)).map(pu => pu.user_id);
  const newUsers = user_ids.filter(user_id => !existingUserIds.includes(user_id)).map(user_id => ({ project_id: project.id, user_id }));

  db.project_users.push(...newUsers);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.status(201).json(newUsers);
});

// Remove users from a project (Admin only)
router.delete('/:id/users', authenticateToken, authorizeRole(1), (req, res) => {
  const { id } = req.params;
  const { user_ids } = req.body;
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const project = db.projects.find(p => p.id === parseInt(id));

  if (!project) return res.status(404).json({ message: 'Project not found' });

  db.project_users = db.project_users.filter(pu => pu.project_id !== parseInt(id) || !user_ids.includes(pu.user_id));
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.status(204).end();
});

module.exports = router;
