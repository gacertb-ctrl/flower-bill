// index.js — FINAL WORKING VERSION FOR RENDER + VERCEL
const express = require('express');
const cors = require('cors');           // ← NOW USING require()
require('dotenv').config();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Routes
const customerRoutes = require('./routes/customerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const entryRoutes = require('./routes/entryRoutes');
const stockRoutes = require('./routes/stockRoutes');
const reportRoutes = require('./routes/reportRoutes');
const reportViewsRouter = require('./routes/reportViews');
const debitCreditRoutes = require('./routes/debitCreditRoutes');
const orgRoutes = require('./routes/orgRoutes');
const userRoutes = require('./routes/userRoutes');

const pool = require('./db/connection');
const cron = require('node-cron'); // Import cron
const { backupDatabase } = require('./utils/backupService'); // Import your new service

// ──────── CORS: Allow Vercel + localhost ────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://flower-bill.onrender.com',
  'https://flower-bill.vercel.app',           // ← CHANGE THIS TO YOUR REAL VERCEL DOMAIN
  // Add more Vercel preview domains if needed
];

// ──────── Express setup ────────
const app = express();
const PORT = process.env.PORT || 3001;

// Global language
global.lang = require('./language/lang_ta');

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      console.log('CORS blocked:', origin);
      callback(null, true); // ← TEMPORARILY ALLOW ALL until you confirm it works
      // callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fb_bill_super_secret_2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true on Render
    httpOnly: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// DB pool
app.use((req, res, next) => {
  req.conn = pool;
  next();
});

// Create temp directory if not exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Routes
app.use('/customer', customerRoutes);
app.use('/supplier', supplierRoutes);
app.use('/product', productRoutes);
app.use('/auth', authRoutes);
app.use('/entry', entryRoutes);
app.use('/stock', stockRoutes);
app.use('/report', reportRoutes);
app.use('/reports', reportViewsRouter);
app.use('/debit-credit', debitCreditRoutes);
app.use('/org', orgRoutes);
app.use('/users', userRoutes);

// Root route (optional, for testing)
app.get('/', (req, res) => {
    res.send('Welcome to the Kanthimathi API!');
});

// Schedule task to run every day at 11:55 PM
// Format: Minute Hour Day Month DayOfWeek
cron.schedule('55 23 * * *', () => {
    console.log('⏰ Running Daily Backup Job...');
    backupDatabase();
});

// ──────── Start server ────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server live on port ${PORT}`);
});

module.exports = app;
