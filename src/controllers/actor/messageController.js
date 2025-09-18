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

exports.sendMessage = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const senderId = req.user.id;

    const imageUrl = req.files?.image?.[0]?.path || null;
    const fileUrl = req.files?.file?.[0]?.path || null;

    const data = {
      message: req.body.message || "",
      imageUrl,
      fileUrl,
    };

    const message = await messageService.sendMessage(conversationId, senderId, data);

    res.status(201).json(message);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const user = req.user;
    const updated = await messageService.updateMessage(messageId, req.body, user);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const user = req.user;
    const deleted = await messageService.deleteMessage(messageId, user);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
