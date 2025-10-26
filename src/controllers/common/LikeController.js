const likeService = require("../../service/common/likeService");
const { DataResponse, ExceptionResponse } = require("../../utils/response");

// Like post
exports.likePost = async (req, res) => {
    try {
        const { postId } = req.query;
        
        console.log('Like request - postId:', postId, 'userId:', req.user?.id);
        
        if (!postId) {
            return res.status(400).json(new ExceptionResponse("Thiếu postId", undefined, 'error'));
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json(new ExceptionResponse("Chưa đăng nhập", undefined, 'error'));
        }

        await likeService.likePost(postId, req.user.id);
        return res.status(200).json(new DataResponse(null, "Đã thích bài viết thành công", 'success'));
    } catch (err) {
        console.error('Like error:', err);
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};

// Unlike post
exports.unlikePost = async (req, res) => {
    try {
        const { postId } = req.query;
        
        if (!postId) {
            return res.status(400).json(new ExceptionResponse("Thiếu postId", undefined, 'error'));
        }

        await likeService.unlikePost(postId, req.user.id);
        return res.status(200).json(new DataResponse(null, "Đã bỏ thích bài viết thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};

// Count likes of post
exports.countLikeOfPost = async (req, res) => {
    try {
        const { postId } = req.query;
        
        if (!postId) {
            return res.status(400).json(new ExceptionResponse("Thiếu postId", undefined, 'error'));
        }

        const count = await likeService.countLikeOfPost(postId);
        return res.status(200).json(new DataResponse(count, "Lấy số lượt thích thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};

// Get like record of post for current user
exports.getPostRecord = async (req, res) => {
    try {
        const { postId } = req.query;
        
        if (!postId) {
            return res.status(400).json(new ExceptionResponse("Thiếu postId", undefined, 'error'));
        }

        if (!req.user || !req.user.id) {
            return res.status(200).json(new DataResponse([], "Chưa đăng nhập", 'success'));
        }

        const records = await likeService.getPostRecord(postId, req.user.id);
        return res.status(200).json(new DataResponse(records, "Lấy thông tin like thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};

// Get users who liked the post
exports.getLikeUsersOfPost = async (req, res) => {
    try {
        const { postId } = req.query;
        
        if (!postId) {
            return res.status(400).json(new ExceptionResponse("Thiếu postId", undefined, 'error'));
        }

        const users = await likeService.getLikeUsersOfPost(postId);
        return res.status(200).json(new DataResponse(users, "Lấy danh sách người thích thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};

