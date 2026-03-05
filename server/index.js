/**
 * index.js — Travel Mint API Server entry point
 */
require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(morgan('dev'));

// ── Health check ───────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── 404 ────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    logger.error('Unhandled error', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Start ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    logger.ok(`Travel Mint API Server running on http://localhost:${PORT}`);
});
