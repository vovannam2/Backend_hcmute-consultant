// Export tất cả models
const User = require('./User');
const Department = require('./Department');
const Field = require('./Field');
const Question = require('./Question');
const Answer = require('./Answer');
const CommonQuestion = require('./CommonQuestion');
const Conversation = require('./Conversation');
const Message = require('./Message');
const ConsultationSchedule = require('./ConsultationSchedule');
const ConsultationScheduleRegistration = require('./ConsultationScheduleRegistration');
const Post = require('./Post');
const Comment = require('./Comment');
const Rating = require('./Rating');
const Notification = require('./Notification');
const ForwardQuestion = require('./ForwardQuestion');
const DeletionLog = require('./DeletionLog');
const LikeRecord = require('./LikeRecord');
const MessageRecall = require('./MessageRecall');
const RoleAuth = require('./RoleAuth');
const Province = require('./Province');
const District = require('./District');
const Ward = require('./Ward');
const OtpToken = require('./OtpToken');

module.exports = {
  User,
  Department,
  Field,
  Question,
  Answer,
  CommonQuestion,
  Conversation,
  Message,
  ConsultationSchedule,
  ConsultationScheduleRegistration,
  Post,
  Comment,
  Rating,
  Notification,
  ForwardQuestion,
  DeletionLog,
  LikeRecord,
  MessageRecall,
  RoleAuth,
  Province,
  District,
  Ward,
  OtpToken
};
