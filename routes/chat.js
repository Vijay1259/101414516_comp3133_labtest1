const express = require('express');
const GroupMessage = require('../models/GroupMessage');
const router = express.Router();

// Get Messages for a Room
router.get('/messages/:room', async (req, res) => {
    const messages = await GroupMessage.find({ room: req.params.room });
    res.json(messages);
});

module.exports = router; 
