const postService = require("../../service/actor/postService");
const { DataResponse, ExceptionResponse } = require("../../utils/response");

exports.createPost = async (req, res) => {
    try {
        const { title, content, approved } = req.body;

        let imageUrl = null;
        let fileUrl = null;

        if (req.file) {
            if (req.file.mimetype.startsWith("image/")) {
                imageUrl = req.file.path;
            } else {
                fileUrl = req.file.path;
            }
        }

        // Nếu có cả imageUrl và fileUrl thì không hợp lệ
        if (imageUrl && fileUrl) {
            return res.status(400).json(new ExceptionResponse("Chỉ được upload 1 loại: ảnh hoặc file", undefined, 'error'));
        }

        const post = await postService.createPost(
            { title, content, imageUrl, fileUrl, approved: approved === 'true' || approved === true },
            req.user.id
        );

        return res.status(201).json(new DataResponse(post, "Tạo bài viết thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};


exports.deletePost = async (req, res) => {
    try {
        await postService.deletePost(req.params.id, req.user.id);
        return res.status(200).json(new DataResponse(null, "Xóa bài viết thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};

// Xóa bài viết (query params) - Frontend gọi post/delete
exports.deletePostByQuery = async (req, res) => {
    try {
        const { id } = req.query;
        
        if (!id) {
            return res.status(400).json(new ExceptionResponse("Thiếu id bài viết", undefined, 'error'));
        }

        await postService.deletePost(id, req.user.id);
        return res.status(200).json(new DataResponse(null, "Xóa bài viết thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};

exports.updatePost = async (req, res) => {
    try {
        const post = await postService.updatePost(req.params.id, req.user.id, req.body);
        return res.status(200).json(new DataResponse(post, "Cập nhật bài viết thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};

exports.getMyPosts = async (req, res) => {
    try {
        const posts = await postService.getMyPosts(req.user.id);
        return res.status(200).json(new DataResponse(posts, "Lấy danh sách bài viết thành công", 'success'));
    } catch (err) {
        return res.status(500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};

// Lấy danh sách tất cả bài viết (cho admin/manager)
exports.getPosts = async (req, res) => {
    try {
        const posts = await postService.getPosts(req.query);
        return res.status(200).json(new DataResponse(posts, "Lấy danh sách bài viết thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};

// Lấy chi tiết bài viết
exports.getPostDetail = async (req, res) => {
    try {
        const { id } = req.query;
        
        if (!id) {
            return res.status(400).json(new ExceptionResponse("Thiếu id bài viết", undefined, 'error'));
        }
        
        const post = await postService.getPostDetail(id);
        return res.status(200).json(new DataResponse(post, "Lấy chi tiết bài viết thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};

// Duyệt bài viết (admin)
exports.approvePost = async (req, res) => {
    try {
        await postService.approvePost(req.query.id);
        return res.status(200).json(new DataResponse(null, "Duyệt bài viết thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};