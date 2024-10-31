const Notification = require('../models/notification');
const { publishToKafka } = require('../services/kafka');

exports.createNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { message } = req.body;

        const notification = new Notification({ userId, message });
        await notification.save();

        try {
            await publishToKafka('notifications', notification);
            res.status(201).json(notification);
        } catch (kafkaError) {
            console.error('Failed to publish to Kafka:', kafkaError);
            // even if Kafka fails, we return success since notification was saved
            res.status(201).json({ 
                ...notification.toJSON(), 
                warning: 'notification saved but queuing system temporarily unavailable'
            });
        }
    } catch (err) {
        console.error('error creating notification:', err);
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

exports.getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });

        if (!notification) {
            return res.status(404).json({ error: 'notification not found' });
        }

        res.json(notification);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'notification not found' });
        }

        res.json(notification);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};