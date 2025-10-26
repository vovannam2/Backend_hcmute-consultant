const LikeRecord = require("../../models/LikeRecord");
const User = require("../../models/User");
const mongoose = require("mongoose");

// Like post
exports.likePost = async (postId, userId) => {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw { status: 400, message: "ID bài viết không hợp lệ" };
    }

    // Check if already liked
    const existingLike = await LikeRecord.findOne({
        targetId: postId,
        userId: userId,
        type: 'POST'
    });

    if (existingLike) {
        throw { status: 400, message: "Bạn đã thích bài viết này" };
    }

    const likeRecord = new LikeRecord({
        targetId: postId,
        userId: userId,
        type: 'POST'
    });

    await likeRecord.save();
    return likeRecord;
};

// Unlike post
exports.unlikePost = async (postId, userId) => {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw { status: 400, message: "ID bài viết không hợp lệ" };
    }

    const result = await LikeRecord.deleteOne({
        targetId: postId,
        userId: userId,
        type: 'POST'
    });

    if (result.deletedCount === 0) {
        throw { status: 404, message: "Không tìm thấy lượt thích" };
    }

    return true;
};

// Count likes of post
exports.countLikeOfPost = async (postId) => {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw { status: 400, message: "ID bài viết không hợp lệ" };
    }

    const count = await LikeRecord.countDocuments({
        targetId: postId,
        type: 'POST'
    });

    return count;
};

// Get like record of post for current user
exports.getPostRecord = async (postId, userId) => {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw { status: 400, message: "ID bài viết không hợp lệ" };
    }

    const record = await LikeRecord.find({
        targetId: postId,
        userId: userId,
        type: 'POST'
    });

    return record;
};

// Get users who liked the post
exports.getLikeUsersOfPost = async (postId) => {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw { status: 400, message: "ID bài viết không hợp lệ" };
    }

    const likes = await LikeRecord.find({
        targetId: postId,
        type: 'POST'
    }).populate('userId', 'fullName avatarUrl email');

    const users = likes.map(like => ({
        id: like.userId._id,
        fullName: like.userId.fullName,
        avatarUrl: like.userId.avatarUrl,
        email: like.userId.email
    }));

    return users;
};

