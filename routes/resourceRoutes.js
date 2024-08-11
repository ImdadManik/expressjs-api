const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole, authorizePermission } = require('../utils/authMiddleware');

const permission = [
    "TABLE_RECOVER",
    "UNLOCK_TABLE",
    "SETTINGS",
    "VIEW_HISTORY",
    "TABLE_DUPLICATE",
    "GENREPORTS",
    "UPLOAD_3DMODEL",
    "PROGRESS_COLOR",
    "TABLE_MANUAL",
    "VIEW_TABLES",
    "TABLE_EDIT",
    "VIEW_3DMODELS",
    "TABLE_UPLOAD",
    "TABLE_EDIT_3DMODEL",
    "LOCK_TABLE",
    "ASSIGNS_RIGHTS",
    "TABLE_DELETE",
    "ROLE_ADMIN"
];

// Admin Resource Routes
router.get('/admin/resource', authenticateToken, authorizeRole(['ADMIN','VIEWER','EDITOR','MANAGER']), authorizePermission(permission), (req, res) => {
    res.status(200).send("Hello, you have access to a protected resource that requires admin role and read authority.");
});

 
// router.delete('/admin/resource', authenticateToken, authorizeRole(['ADMIN']), authorizePermission(['DELETE_PRIVILEGE']), (req, res) => {
//     res.status(200).send("Hello, you have access to a protected resource that requires admin role and delete authority.");
// });

// Admin Resource Routes
router.get('/user/resource', authenticateToken, authorizeRole(['ADMIN','VIEWER','EDITOR','MANAGER']), authorizePermission(permission), (req, res) => {
    res.status(200).send("Hello, you have access to a protected resource that requires admin role and read authority.");
});


// User Resource Routes
router.post('/user/resource', authenticateToken, authorizeRole(['ADMIN','VIEWER','EDITOR','MANAGER']), authorizePermission(permission), (req, res) => {
    res.status(200).send("Hello, you have access to a protected resource that requires user role and write authority.");
});

// router.put('/user/resource', authenticateToken, authorizeRole(['ADMIN', 'USER']), authorizePermission(['UPDATE_PRIVILEGE']), (req, res) => {
//     res.status(200).send("Hello, you have access to a protected resource that requires user role and update authority.");
// });

module.exports = router;
