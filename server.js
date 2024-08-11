const express = require('express');
const jsonServer = require('json-server');
const bodyParser = require('body-parser');
const cors = require('cors');
const authMiddleware = require('./utils/authMiddleware');
const authRoutes = require('./routes/authRoutes');

const app = express();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

app.use(bodyParser.json());
app.use(cors());
app.use(middlewares);

// Authentication routes
app.use('/api/auth', authRoutes);

// Authorization middleware
app.use(authMiddleware);

// Use default router for CRUD operations
app.use('/api', router);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
