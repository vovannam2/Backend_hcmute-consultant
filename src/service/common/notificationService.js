// const Notification = require('../models/Notification');
// const User = require('../models/User');

// const notificationService = {
//   async sendNotification({ senderId, receiverId, content, notificationType }) {
//     try {
//       const notification = await Notification.create({
//         senderId,
//         receiverId,
//         content,
//         notificationType
//       });
//       return notification;
//     } catch (err) {
//       console.error('Error sending notification:', err);
//       throw err;
//     }
//   },

//   /**
//    * Lấy danh sách thông báo của 1 user
//    */
//   async getUserNotifications(userId) {
//     return Notification.find({ receiverId: userId })
//       .sort({ createdAt: -1 })
//       .populate('senderId', 'firstName lastName email avatarUrl')
//       .lean();
//   },

//   /**
//    * Đánh dấu đã đọc
//    */
//   async markAsRead(notificationId) {
//     return Notification.findByIdAndUpdate(notificationId, { status: 'READ' }, { new: true });
//   }
// };

// module.exports = notificationService;
