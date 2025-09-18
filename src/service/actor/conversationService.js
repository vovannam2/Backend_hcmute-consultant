const Conversation = require("../../models/Conversation");
const User = require("../../models/User");
// const mongoose = require("mongoose");
// const notificationService = require("../common/notificationService");

exports.createConversation = async (data, user, file) => {
  const { name, consultantId, departmentId } = data;

  const conversation = new Conversation({
    name,
    avatarUrl: file ? file.path : null,
    user: user._id,
    consultant: consultantId,
    department: departmentId,
    members: [
      { user: user._id },
      { user: consultantId }
    ],
  });

  await conversation.save();
  return conversation;
};

exports.updateConversation = async (conversationId, data, user, file) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error("Không tìm thấy cuộc trò chuyện");
  }

  // Kiểm tra quyền: chỉ user hoặc consultant tham gia mới được update
  if (
    conversation.user.toString() !== user._id.toString() &&
    conversation.consultant.toString() !== user._id.toString()
  ) {
    throw new Error("Bạn không có quyền cập nhật cuộc trò chuyện này");
  }

  // Cập nhật thông tin
  if (data.name) {
    conversation.name = data.name;
  }

  if (file) {
    conversation.avatarUrl = file.path;
  }

  if (typeof data.statusActive !== "undefined") {
    conversation.statusActive = data.statusActive;
  }

  await conversation.save();
  return conversation;
};

exports.deleteConversation = async (conversationId, user) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error("Không tìm thấy cuộc trò chuyện");
  }

  // Chỉ user hoặc consultant của conversation mới được xóa
  if (
    conversation.user.toString() !== user._id.toString() &&
    conversation.consultant.toString() !== user._id.toString()
  ) {
    throw new Error("Bạn không có quyền xóa cuộc trò chuyện này");
  }

  await conversation.deleteOne();
  return true;
};

// list conversations for a user
exports.listConversations = async (userId) => {
  return Conversation.find({
    $or: [
      { user: userId },
      { consultant: userId },
      { "members.user": userId }
    ]
  })
    .populate({
      path: "members.user",
      select: "firstName lastName email avatarUrl"
    })
    .populate({
      path: "user",
      select: "firstName lastName email avatarUrl"
    })
    .populate({
      path: "consultant",
      select: "firstName lastName email avatarUrl"
    })
    .populate({
      path: "department",
      select: "name"
    })
    .sort({ updatedAt: -1 });
};

exports.getConversationDetail = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId)
    .populate({
      path: "members.user",
      select: "firstName lastName email avatarUrl"
    })
    .populate({
      path: "user",
      select: "firstName lastName email avatarUrl"
    })
    .populate({
      path: "consultant",
      select: "firstName lastName email avatarUrl"
    })
    .populate({
      path: "department",
      select: "name"
    });

  if (!conversation) {
    throw new Error("Không tìm thấy cuộc trò chuyện");
  }

  const userIdStr = userId.toString();

  const isMember =
    conversation.user._id.toString() === userIdStr ||
    conversation.consultant._id.toString() === userIdStr ||
    conversation.members.some(m => m.user._id.toString() === userIdStr);

  if (!isMember) {
    throw new Error("Bạn không có quyền xem cuộc trò chuyện này");
  }

  return conversation;
};


// exports.approveMember = async (conversationId, memberId, approver) => {
//   const conversation = await Conversation.findById(conversationId);
//   if (!conversation) throw new Error("Không tìm thấy cuộc trò chuyện");

//   if (!approver.isConsultant() && !approver.isDepartmentHead()) {
//     throw new Error("Bạn không có quyền duyệt thành viên");
//   }

//   // Nếu member đã tồn tại thì không thêm nữa
//   if (conversation.members.some(m => m.user.toString() === memberId)) {
//     throw new Error("Thành viên đã tồn tại trong cuộc trò chuyện");
//   }

//   conversation.members.push({ user: memberId });
//   await conversation.save();

//   return conversation;
// };

// exports.removeMember = async (conversationId, memberId, user) => {
//   const conversation = await Conversation.findById(conversationId);
//   if (!conversation) throw new Error("Không tìm thấy cuộc trò chuyện");

//   if (!user.isConsultant() && !user.isDepartmentHead()) {
//     throw new Error("Bạn không có quyền xóa thành viên");
//   }

//   conversation.members = conversation.members.filter(
//     m => m.user.toString() !== memberId
//   );

//   await conversation.save();
//   return conversation;
// };

// exports.listMembers = async (conversationId, userId) => {
//   const conversation = await Conversation.findById(conversationId)
//     .populate("members.user");

//   if (!conversation) throw new Error("Không tìm thấy cuộc trò chuyện");

//   const isMember = conversation.members.some(
//     m => m.user._id.toString() === userId.toString()
//   ) || conversation.user.toString() === userId.toString()
//     || conversation.consultant.toString() === userId.toString();

//   if (!isMember) {
//     throw new Error("Bạn không có quyền xem danh sách thành viên");
//   }

//   return conversation.members;
// };

// exports.listUsers = async (filters) => {
//   const query = {};

//   if (filters.role) {
//     query.role = filters.role;
//   }
//   if (filters.departmentId) {
//     query.department = filters.departmentId;
//   }

//   return User.find(query).select("-password -refreshToken");
// };

// exports.addMemberToConversation = async (conversationId, memberIdentifier, actorUser) => {
//   const conversation = await Conversation.findById(conversationId);
//   if (!conversation) throw new Error("Không tìm thấy cuộc trò chuyện");

//   // Quyền: creator (user), consultant, hoặc trưởng ban
//   const actorId = actorUser._id.toString();
//   const isCreatorOrConsultant =
//     conversation.user.toString() === actorId ||
//     conversation.consultant.toString() === actorId;
//   const isDepartmentHead = actorUser.role === "TRUONGBANTUVAN";

//   if (!isCreatorOrConsultant && !isDepartmentHead) {
//     throw new Error("Bạn không có quyền thêm thành viên vào cuộc trò chuyện này");
//   }

//   // Tìm user theo id hoặc email
//   let member = null;
//   if (mongoose.isValidObjectId(memberIdentifier)) {
//     member = await User.findById(memberIdentifier);
//   } else {
//     member = await User.findOne({
//       email: memberIdentifier.trim().toLowerCase(),
//     });
//   }
//   if (!member) throw new Error("Người dùng cần thêm không tồn tại");

//   const memberIdStr = member._id.toString();

//   // Nếu là creator hoặc consultant thì báo đã là thành viên
//   if (
//     conversation.user.toString() === memberIdStr ||
//     conversation.consultant.toString() === memberIdStr
//   ) {
//     throw new Error(
//       "Người dùng này đã là một thành viên chính của cuộc trò chuyện"
//     );
//   }

//   // Kiểm tra đã có trong members chưa
//   const already = conversation.members.some(
//     (m) => m.user.toString() === memberIdStr
//   );
//   if (already) throw new Error("Người dùng đã là thành viên trong cuộc trò chuyện");

//   // Thêm member
//   conversation.members.push({ user: member._id });

//   // Nếu trước đó không phải group, khi thêm thành viên thì chuyển thành group
//   if (!conversation.isGroup) conversation.isGroup = true;

//   await conversation.save();

//   // Gửi notification
//   await notificationService.sendNotification({
//     senderId: actorUser._id,
//     receiverId: member._id,
//     content: `${actorUser.lastName || actorUser.username || actorUser.email
//       } đã thêm bạn vào cuộc trò chuyện "${conversation.name || ""}"`,
//     notificationType: "CONSULTATION",
//   });

//   // populate đơn giản members.user để trả về thông tin member
//   await conversation.populate({
//     path: "members.user",
//     select: "firstName lastName email avatarUrl role",
//   });

//   return conversation;
// };