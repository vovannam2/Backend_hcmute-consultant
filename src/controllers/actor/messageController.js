const messageService = require("../../service/actor/messageService");

exports.getMessages = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;
    const messages = await messageService.getMessages(conversationId, userId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
