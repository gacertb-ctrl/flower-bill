const express = require('express');
require('dotenv').config();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// ──────── IMPORT ROUTES ────────
const customerRoutes = require('./routes/customerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const entryRoutes = require('./routes/entryRoutes');
const stockRoutes = require('./routes/stockRoutes');
const reportRoutes = require('./routes/reportRoutes');
const reportViewsRouter = require('./routes/reportViews');
const debitCreditRoutes = require('./routes/debitCreditRoutes');
const pool = require('./db/connection');

// ──────── CORS SETUP (FIXED!) ────────
const cors = require('cors'); // ← Make sure you have "cors" in package.json

// Add ALL your real frontend domains here
const allowedOrigins = [
  'http://localhost:3000',           // Local dev
  'http://localhost:5000',
  'https://flower-bill.onrender.com', // Your backend (optional)
  'https://your-app.vercel.app',      // ← REPLACE with your actual Vercel domain
  // Vercel preview URLs (optional – you can add them later)
  // 'https://your-app-git-main-yourname.vercel.app',
  // Allow all Vercel preview domains temporarily if you want:
  // (origin) => origin?.endsWith('.vercel.app')
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Remove this line in production if you want to see the error in browser only
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,        // Important: allows cookies & Authorization headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ──────── EXPRESS APP ────────
const app = express();
const PORT = process.env.PORT || 3001; // Render requires process.env.PORT

// Global language
global.lang = require('./language/lang_ta');

// ──────── MIDDLEWARE ────────
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fb_bill_very_strong_secret_2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true on Render/Vercel (HTTPS)
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Make DB pool available to all routes
app.use((req, res, next) => {
  req.conn = pool;
  next();
});

// Create temp directory
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// ──────── ROUTES ────────
app.use('/customer', customerRoutes);
app.use('/supplier', supplierRoutes);
app.use('/product', productRoutes);
app.use('/auth', authRoutes);
app.use('/entry', entryRoutes);
app.use('/stock', stockRoutes);
app.use('/report', reportRoutes);
app.use('/reports', reportViewsRouter);
app.use('/debit-credit', debitCreditRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Kanthimathi API is running! CORS enabled.');
});

// ──────── START SERVER ────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
