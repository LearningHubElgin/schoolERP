const cluster = require('cluster');
const os = require('os');

// ─── CLUSTER SETUP (Load Balancer) ──────────────────────────────
if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  const indianTime = () => new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  console.log('\n' + '='.repeat(60));
  console.log('⚡ School ERP — Node.js Cluster Load Balancer');
  console.log('='.repeat(60));
  console.log(`🖥️  CPU Cores Available: ${numCPUs}`);
  console.log(`🔄 Starting ${numCPUs} worker processes...`);
  console.log('='.repeat(60) + '\n');

  // Fork one worker per CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Auto-restart crashed workers
  cluster.on('exit', (worker, code, signal) => {
    console.log(`\n💥 [${indianTime()}] Worker ${worker.process.pid} died (code: ${code}, signal: ${signal})`);
    console.log(`🔄 Restarting a new worker...\n`);
    cluster.fork();
  });

  // Log when a new worker comes online
  cluster.on('online', (worker) => {
    console.log(`✅ [${indianTime()}] Worker ${worker.process.pid} is online`);
  });

} else {
  // ─── WORKER PROCESS (Each worker runs the Express server) ───────

  require('dotenv').config();
  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  const jwt = require('jsonwebtoken');
  const db = require('./config/database');

  const app = express();
  const PORT = process.env.PORT || 7005;

  // Middleware
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:7005',
      'https://luhs.learninghub.ind.in',
      'https://sc.learninghub.ind.in'
    ],
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from upload folder (for school logos, etc.)
  app.use('/upload', express.static(path.join(__dirname, 'upload')));

  // Request logging middleware
  app.use((req, res, next) => {
    const indianTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Determine Emoji based on route
    let emoji = '🌐'; // Default
    if (req.path.startsWith('/api/auth')) emoji = '🔐';
    else if (req.path.startsWith('/api/student')) emoji = '🎓';
    else if (req.path.startsWith('/api/teacher')) emoji = '👨‍🏫';
    else if (req.path.startsWith('/api/admin')) emoji = '⚙️';
    else if (req.path.startsWith('/api/accounts')) emoji = '💰';
    else if (req.path.startsWith('/api/admission')) emoji = '📋';
    else if (req.path.startsWith('/api/library')) emoji = '📚';
    else if (req.path.startsWith('/api/store')) emoji = '🏪';
    else if (req.path.startsWith('/api/transport')) emoji = '🚗';
    else if (req.path.startsWith('/api/activity')) emoji = '📋';
    else if (req.path.startsWith('/api/health')) emoji = '🏥';

    // Try to extract school ID and role for logging
    let schoolId = req.body?.school_id || req.body?.schoolId || req.query?.school_id || req.query?.schoolId || req.headers['x-school-id'] || null;
    let userRole = req.body?.role || null;

    // If not found in body/query, try to peek into JWT token (fast decode)
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        if (token) {
          const decoded = jwt.decode(token);
          if (decoded) {
            if (!schoolId) schoolId = decoded.school_id;
            if (!userRole) userRole = decoded.role;
          }
        }
      } catch (err) { /* ignore */ }
    }

    const schoolLog = (schoolId && userRole !== 'superadmin') ? ` [School ID: ${schoolId}]` : '';

    console.log(`${emoji} [Worker ${process.pid}] ${indianTime}${schoolLog} - ${req.method} ${req.path}`);
    next();
  });

  // Import routes
  const authRoutes = require('./routes/auth');
  const studentRoutes = require('./routes/student');
  const teacherRoutes = require('./routes/teacher');
  const accountsRoutes = require('./routes/accounts');
  const adminRoutes = require('./routes/admin');
  const admissionRoutes = require('./routes/admission');
  const libraryRoutes = require('./routes/library');
  const commonRoutes = require('./routes/common');
  const storeRoutes = require('./routes/store');
  const marksRoutes = require('./routes/marks');
  const marksheetTemplateRoutes = require('./routes/marksheetTemplate');
  const securityGuardRoutes = require('./routes/securityGuard');
  const transportRoutes = require('./routes/transport');
  const staffRoutes = require('./routes/staff');
  const activityRoutes = require('./routes/activity');
  const superadminRoutes = require('./routes/superadmin');
  const activityLogRoutes = require('./routes/activityLog');
  const { initRetentionJob } = require('./utils/retentionCron');
  const { autoAuditLogger } = require('./middleware/activityLogger');

  // Mount Universal Auto Audit Logger across all API endpoints
  app.use('/api', autoAuditLogger);

  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/teacher', teacherRoutes);
  app.use('/api/staff', staffRoutes);
  app.use('/api/accounts', accountsRoutes);
  app.use('/api/admission', admissionRoutes);
  app.use('/api/library', libraryRoutes);
  app.use('/api/common', commonRoutes);
  app.use('/api/store', storeRoutes);
  app.use('/api/marks', marksRoutes);
  app.use('/api/marksheet-templates', marksheetTemplateRoutes);
  app.use('/api/visitors', securityGuardRoutes);
  app.use('/api/transport', transportRoutes);
  app.use('/api/activity', activityRoutes);
  app.use('/api/superadmin', superadminRoutes);
  app.use('/api/activity-logs', activityLogRoutes);

  // Initialize automated log retention job (keep 365 days)
  initRetentionJob(365);

  // Root-level health check (for easy access)
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'School ERP Backend API is running!',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Health check route (with /api prefix)
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'School ERP Backend API is running!',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  // Start server
  const server = app.listen(PORT, () => {
    // Only print the banner for the first worker to avoid log spam
    if (cluster.worker && cluster.worker.id === 1) {
      console.log(`Server is running on port ${PORT}...`);

      console.log('\n' + '='.repeat(60));
      console.log('🚀 School ERP Backend Server');
      console.log('='.repeat(60));
      console.log(`📡 Server Status: RUNNING`);
      console.log(`🔌 Port: ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`💚 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\n🏥 Health Check Endpoints:`);
      console.log(`   - http://localhost:${PORT}/health`);
      console.log(`   - http://localhost:${PORT}/api/health`);
      console.log(`\n🔐 CORS Allowed Origins:`);
      console.log(`   - http://localhost:3000`);
      console.log(`   - https://luhs.learninghub.ind.in`);
      console.log('='.repeat(60) + '\n');
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
  });

} // End of cluster worker block
