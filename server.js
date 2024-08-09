const express = require('express');
const jsonServer = require('json-server');
const bodyParser = require('body-parser');
const cors = require('cors');
const { authenticateToken } = require('./utils/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const resourceRoutes = require('./routes/resourceRoutes'); 
const logRequest = require('./utils/logRequest');

const app = express();
const router = jsonServer.router('database.json');
const middlewares = jsonServer.defaults();


app.use(bodyParser.json());
// Add the CORS middleware with the specified options
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(middlewares);
app.use(logRequest); //Add the logging middleware

// Authentication routes
app.use('/api/auth', authRoutes);

// Authorization middleware
app.use(authenticateToken);
 
// Protected routes
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/resources', resourceRoutes);

// Use default router for remaining CRUD operations
app.use('/api', router);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
