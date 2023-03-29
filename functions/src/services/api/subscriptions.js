
'use strict';
const express = require('express');
const { setUserSettings } = require('../../utils');
const router = express.Router;

router.post('/', async (req, res) => {
   const task = req.body;
 
   try {
     const uid = req.user.uid;
      setUserSettings(uid, {
        subscription: data,
        selectedPrice: state.selectedPrice
      });
 
     res.status(201).json(task);
   } catch(error) {
     res.sendStatus(500);
   }
});
 
exports.default = router;