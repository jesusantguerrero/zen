const express = require('express');
const functions = require('firebase-functions');
const { default: auth } = require('./auth');
const { default: subscriptions } = require('./subscriptions');
const { default: tasks } = require('./tasks');
const { default: tracks } = require('./tracks');
const { default: standup } = require('./standup');
const { default: metrics } = require('./metrics');

const app = express();

// Unauthenticated health check — useful for MCP clients to verify connectivity.
app.get('/health', (req, res) => res.json({ ok: true, service: 'zen-api' }));

app.use(express.json());
app.use(auth);
app.use('/subscriptions', subscriptions);
app.use('/tasks', tasks);
app.use('/tracks', tracks);
app.use('/standup', standup);
app.use('/metrics', metrics);

exports.core = functions.https.onRequest(app);
