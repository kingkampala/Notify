const express = require('express');
const { createNotification, getNotifications, getNotificationById, markNotificationAsRead } = require('../controllers/notification');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, createNotification);

router.get('/', authenticateToken, getNotifications);

router.get('/:id', authenticateToken, getNotificationById);

router.put('/:id', authenticateToken, markNotificationAsRead);

module.exports = router;