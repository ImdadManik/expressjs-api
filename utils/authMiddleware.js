// utils/authMiddleware.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer token"
  console.log('roles token: '+ token);
  if (!token) return res.status(403).json({ message: 'No token provided' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Failed to authenticate token' });

    /*
    this commented section will implemented when goes to deploy it should blacklist the token after logout
    Check if the token is blacklisted (optional)
    const blacklistedTokens = JSON.parse(fs.readFileSync(dbPath)).blacklistedTokens || [];
    if (blacklistedTokens.includes(token)) return res.sendStatus(403);
     */
    req.user = decoded;  
    next();
  }); 
}
 
// Middleware to authorize based on roles
const authorizeRole = (roles) => {
  return (req, res, next) => {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const userRole = req.user.role; // assuming user's role is set as req.user.role 
    console.log("authorize roles: " + userRole);
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
 
// Middleware to check if user has at least one of the required permissions
function authorizePermission(requiredPermissions) {
  return (req, res, next) => { 
      // Extract the permissions from the user's token (or however you're storing them)
      const userPermissions = req.user.permissions || [];
      console.log("user permission: " + userPermissions);
      // Check if userPermissions contains at least one of the requiredPermissions
      const hasPermission = requiredPermissions.some(permission => userPermissions.includes(permission));

      if (hasPermission) {
          return next();
      }

      return res.status(403).send('Forbidden: Insufficient permissions');
  };
}

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizePermission
};
  
module.exports = { authenticateToken, authorizeRole, authorizePermission };
