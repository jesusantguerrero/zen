'use strict';
const express = require('express');

const router = express.Router();

// Stub — subscription flow is being rebuilt (Stripe migration, see cycle.md).
// Returning 501 keeps the Express app bootable without crashing on import.
router.post('/', (req, res) => {
  res.status(501).json({ error: 'subscription endpoint not implemented yet' });
});

exports.default = router;
