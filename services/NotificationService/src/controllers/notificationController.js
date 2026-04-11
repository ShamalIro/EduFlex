const Notification = require('../models/notificationModel');

// ✅ Get all notifications for user
const getNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const notifications = await Notification.find({ user_id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// ✅ Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const user_id = req.user.id;
    const count = await Notification.countDocuments({ user_id, is_read: false });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
};

// ✅ Mark single notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user_id },
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

// ✅ Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const user_id = req.user.id;

    await Notification.updateMany(
      { user_id, is_read: false },
      { is_read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Failed to mark all as read' });
  }
};

// ✅ Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    await Notification.findOneAndDelete({ _id: id, user_id });

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

// ✅ Create notification (internal use — called by other services)
const createNotification = async (req, res) => {
  try {
    const { user_id, title, message, type, link, icon } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({ message: 'user_id, title and message are required' });
    }

    const notification = new Notification({
      user_id,
      title,
      message,
      type: type || 'general',
      link: link || '',
      icon: icon || '🔔'
    });

    await notification.save();

    res.status(201).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
};