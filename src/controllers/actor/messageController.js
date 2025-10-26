const messageService = require("../../service/actor/messageService");
const { DataResponse, ExceptionResponse } = require("../../utils/response");

exports.getMessages = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;
    const messages = await messageService.getMessages(conversationId, userId);
    return res.status(200).json(new DataResponse(messages, "Lấy tin nhắn thành công.", 'success'));
  } catch (err) {
    return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
  }
};
