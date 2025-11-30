const express = require('express');
require('dotenv').config();
const session = require('express-session');
const bodyParser = require('body-parser');
const customerRoutes = require('./routes/customerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const entryRoutes = require('./routes/entryRoutes'); // For purchase, sales, credit, debit entries
const stockRoutes = require('./routes/stockRoutes');
const reportRoutes = require('./routes/reportRoutes');
const reportViewsRouter = require('./routes/reportViews');
const debitCreditRoutes = require('./routes/debitCreditRoutes');
const pool = require('./db/connection');
const path = require('path');
import cors from 'cors';

const allowedOrigins = [
  'https://flower-bill.onrender.com',  // your backend
  'http://localhost:5000',             // dev
  // Or during early testing, temporarily allow all:
  // '*' 
];

const app = express();
const port = 3001; // Or whatever port you prefer

// Global language variable (placeholder for lang_ta.php)
global.lang = require('./language/lang_ta');

// Middleware
app.use(bodyParser.json()); // To parse JSON request bodie
app.use(bodyParser.urlencoded({ extended: true })); // To parse URL-encoded bodies
app.use(session({
    secret: 'fb_bill', // Replace with a strong, random secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(cors());

// Middleware to make db connection available to routes
app.use(async (req, res, next) => {
    req.conn = pool;
    next();
});

// Create temp directory if not exists
const fs = require('fs');
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Routes
app.use('/customer', customerRoutes);
app.use('/supplier', supplierRoutes);
app.use('/product', productRoutes);
app.use('/auth', authRoutes);
app.use('/entry', entryRoutes); // For purchase, sales, credit, debit entries
app.use('/stock', stockRoutes);
app.use('/report', reportRoutes);
app.use('/reports', reportViewsRouter); // For PDF generation
app.use('/debit-credit', debitCreditRoutes);

// Root route (optional, for testing)
app.get('/', (req, res) => {
    res.send('Welcome to the Kanthimathi API!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Export the app for testing purposes
module.exports = app;
