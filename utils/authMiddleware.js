// utils/authMiddleware.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'thisismykey';

function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to authenticate token' });
    }

    req.userId = decoded.id;
    req.userRole = decoded.role_id;
    next();
  });
}

module.exports = authMiddleware;
