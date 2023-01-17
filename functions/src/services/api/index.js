const express = require('express');
const { default: auth } = require('./auth');
const { default: subscriptions } = require('./subscriptions');
const { default: tasks } = require('./tasks');
const app = express();

app.use(auth);
app.use('/subscriptions', subscriptions)
app.use('/tasks', tasks)

exports.default = functions.https.onRequest(app);