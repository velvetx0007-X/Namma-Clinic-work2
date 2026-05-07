const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Google DNS to fix querySrv ECONNREFUSED

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const patientRecordRoutes = require('./routes/patientRecords');
const appointmentRoutes = require('./routes/appointments');
const vitalsRoutes = require('./routes/vitals');
const consultationRoutes = require('./routes/consultations');
const prescriptionRoutes = require('./routes/prescriptions');
const labTestRoutes = require('./routes/labTests');
const billingRoutes = require('./routes/billing');
const medicationLogRoutes = require('./routes/medicationLogs');
const communicationRoutes = require('./routes/communications');
const clinicRoutes = require('./routes/clinics');
const aiPrescriptionRoutes = require('./routes/aiPrescriptions');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const { startAIWatcher } = require('./services/aiMonitoringService');

const { setupSecurity, errorHandler } = require('./middleware/security');

// Initialize Express app
const app = express();

// Security and Logging
setupSecurity(app);

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const mongoOptions = {
    serverSelectionTimeoutMS: 30000,   // 30s to select a server
    connectTimeoutMS: 30000,           // 30s to establish connection
    socketTimeoutMS: 45000,            // 45s for socket inactivity
};

const connectWithRetry = () => {
    mongoose.connect(process.env.MONGODB_URI, mongoOptions)
        .then(() => console.log('✅ MongoDB Connected Successfully'))
        .catch((err) => {
            if (err.code === 'ETIMEOUT' || err.message?.includes('ETIMEOUT') || err.name === 'MongoServerSelectionError') {
                console.error('❌ MongoDB Connection Failed: Cannot reach Atlas cluster.');
                console.error('👉 FIX: Go to https://cloud.mongodb.com → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)');
                console.error('   Then restart this server. Retrying in 15 seconds...');
                setTimeout(connectWithRetry, 15000);
            } else {
                console.error('❌ MongoDB Connection Error:', err.message);
                console.error('   Retrying in 15 seconds...');
                setTimeout(connectWithRetry, 15000);
            }
        });
};

connectWithRetry();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient-records', patientRecordRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/medication-logs', medicationLogRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/patients', require('./routes/patients'));
app.use('/api/admins', require('./routes/admins'));
app.use('/api/ai-prescriptions', aiPrescriptionRoutes);
app.use('/api/ai-lab-tests', require('./routes/aiLabTests'));
app.use('/api/ai-health', require('./routes/aiHealth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/subscriptions', subscriptionRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Health-One Clinical App API' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

module.exports = { app, io }; // Export for services

// Attach io to app
app.set('io', io);

io.on('connection', (socket) => {
    console.log('🔌 New WebSocket connection:', socket.id);
    
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`👤 User joined room: ${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('🔌 User disconnected');
    });
});

// Update Routes - Adding Task routes
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/analytics', require('./routes/analytics'));

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    startAIWatcher(); // Start health monitoring engine
});
