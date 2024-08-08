// utils/authMiddleware.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'thisismykey';

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to authenticate token' });
    }

    req.user = decoded;
    next();
  });
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role_id === role) {
      next();
    } else {
      res.sendStatus(403);
    }
  };
}

function authorizeRoles(roles) {
  return (req, res, next) => {
    if (roles.includes(req.user.role_id)) {
      next();
    } else {
      res.sendStatus(403);
    }
  };
}

module.exports = { authenticateToken, authorizeRole, authorizeRoles };
