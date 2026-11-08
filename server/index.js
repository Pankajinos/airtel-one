const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Global process exception handlers to prevent unexpected worker crashes
process.on('uncaughtException', (err) => {
  console.error('[Process Uncaught Exception]:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Process Unhandled Rejection]:', reason);
});

const store = require('./db/store');
const businessRoutes = require('./routes/business');
const productsRoutes = require('./routes/products');
const recommendationsRoutes = require('./routes/recommendations');
const kycRoutes = require('./routes/kyc');
const ordersRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static file serving for uploads & specimen KYC images
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

const kycSpecimensDir = path.resolve(__dirname, '..', 'kyc_documents');
app.use('/kyc_specimens', express.static(kycSpecimensDir));

// API Routes
app.use('/api/business', businessRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/orders', ordersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Udyam Digital API',
    mongoConnected: store.isMongo(),
    time: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  await store.initDB();
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Udyam Digital Server running on port ${PORT}`);
    console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
    console.log(`📄 KYC Specimens: http://localhost:${PORT}/kyc_specimens/`);
    console.log(`===============================================`);
  });
}

startServer();
