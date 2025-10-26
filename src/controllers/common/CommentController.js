const commentService = require("../../service/common/commentService");
const { DataResponse, ExceptionResponse } = require("../../utils/response");

// Tạo bình luận
exports.createComment = async (req, res) => {
    try {
        const { postId, text } = req.query;
        
        if (!postId || !text) {
            return res.status(400).json(new ExceptionResponse("Thiếu postId hoặc text", undefined, 'error'));
        }

        const comment = await commentService.createComment(postId, text, req.user.id);
        return res.status(201).json(new DataResponse(comment, "Tạo bình luận thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};

// Cập nhật bình luận
exports.updateComment = async (req, res) => {
    try {
        const { commentId, text } = req.query;
        
        if (!commentId || !text) {
            return res.status(400).json(new ExceptionResponse("Thiếu commentId hoặc text", undefined, 'error'));
        }

        const comment = await commentService.updateComment(commentId, text, req.user.id);
        return res.status(200).json(new DataResponse(comment, "Cập nhật bình luận thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};

// Lấy bình luận theo bài viết
exports.getComments = async (req, res) => {
    try {
        const { postId } = req.query;
        
        if (!postId) {
            return res.status(400).json(new ExceptionResponse("Thiếu postId", undefined, 'error'));
        }

        const comments = await commentService.getCommentsByPost(postId);
        return res.status(200).json(new DataResponse(comments, "Lấy bình luận thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};

// Trả lời bình luận
exports.replyComment = async (req, res) => {
    try {
        const { commentFatherId, text } = req.query;
        
        if (!commentFatherId || !text) {
            return res.status(400).json(new ExceptionResponse("Thiếu commentFatherId hoặc text", undefined, 'error'));
        }

        const comment = await commentService.replyComment(commentFatherId, text, req.user.id);
        return res.status(201).json(new DataResponse(comment, "Trả lời bình luận thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};

// Xóa bình luận
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.query;
        
        if (!commentId) {
            return res.status(400).json(new ExceptionResponse("Thiếu commentId", undefined, 'error'));
        }

        await commentService.deleteComment(commentId, req.user.id);
        return res.status(200).json(new DataResponse(null, "Xóa bình luận thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};
