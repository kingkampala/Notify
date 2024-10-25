const Notification = require('../models/notification');
//const User = require('../models/user');
const { publishToKafka } = require('../services/kafka');

exports.createNotification = async (req, res) => {
    try {
        const { userId, message } = req.body;
        const notification = new Notification({ userId, message });
        await notification.save();
        publishToKafka('notifications', notification);
        res.status(201).json(notification);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id });
        res.json(notifications);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};