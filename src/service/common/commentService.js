const Comment = require("../../models/Comment");
const Post = require("../../models/Post");
const User = require("../../models/User");
const mongoose = require("mongoose");

// Tạo bình luận
exports.createComment = async (postId, text, userId) => {
    // Kiểm tra bài viết có tồn tại không
    const post = await Post.findById(postId);
    if (!post) {
        throw { status: 404, message: "Không tìm thấy bài viết" };
    }

    const comment = new Comment({
        comment: text,
        post: postId,
        userComment: userId
    });

    await comment.save();
    
    // Populate để trả về thông tin đầy đủ
    return await Comment.findById(comment._id)
        .populate('userComment', 'fullName email avatarUrl')
        .populate('post', 'title');
};

// Cập nhật bình luận
exports.updateComment = async (commentId, text, userId) => {
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw { status: 404, message: "Không tìm thấy bình luận" };
    }

    // Kiểm tra quyền sở hữu
    if (String(comment.userComment) !== String(userId)) {
        throw { status: 403, message: "Bạn chỉ được sửa bình luận của chính mình" };
    }

    comment.comment = text;
    await comment.save();
    
    return await Comment.findById(commentId)
        .populate('userComment', 'fullName email avatarUrl')
        .populate('post', 'title');
};

// Lấy bình luận theo bài viết
exports.getCommentsByPost = async (postId) => {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw { status: 400, message: "ID bài viết không hợp lệ" };
    }
    
    // Kiểm tra bài viết có tồn tại không
    const post = await Post.findById(postId);
    if (!post) {
        throw { status: 404, message: "Không tìm thấy bài viết" };
    }

    const comments = await Comment.find({ post: postId })
        .populate('userComment', 'fullName email avatarUrl')
        .sort({ createDate: -1 });

    // Transform để khớp với frontend
    return comments.map(comment => ({
        id: comment._id,
        content: comment.comment,
        name: comment.userComment?.fullName || 'Người dùng',
        avatarUrl: comment.userComment?.avatarUrl || '',
        createdAt: comment.createDate
    }));
};

// Trả lời bình luận
exports.replyComment = async (commentFatherId, text, userId) => {
    // Kiểm tra bình luận cha có tồn tại không
    const parentComment = await Comment.findById(commentFatherId);
    if (!parentComment) {
        throw { status: 404, message: "Không tìm thấy bình luận cha" };
    }

    const comment = new Comment({
        comment: text,
        post: parentComment.post,
        userComment: userId,
        parentComment: commentFatherId
    });

    await comment.save();
    
    return await Comment.findById(comment._id)
        .populate('userComment', 'fullName email avatarUrl')
        .populate('post', 'title')
        .populate('parentComment', 'comment');
};

// Xóa bình luận
exports.deleteComment = async (commentId, userId) => {
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw { status: 404, message: "Không tìm thấy bình luận" };
    }

    // Kiểm tra quyền sở hữu
    if (String(comment.userComment) !== String(userId)) {
        throw { status: 403, message: "Bạn chỉ được xóa bình luận của chính mình" };
    }

    await comment.deleteOne();
    return true;
};
