const express = require('express');
const path = require('path');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Frontend Files (Folder public)
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: true,
    message: 'student attendance api is running'
  });
});

// Fallback ke index.html untuk root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);
});