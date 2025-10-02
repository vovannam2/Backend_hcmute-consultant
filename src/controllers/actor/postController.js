const postService = require("../../service/actor/postService");

exports.createPost = async (req, res) => {
    try {
        const { title, content } = req.body;

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
            return res.status(400).json({
                status: "error",
                message: "Chỉ được upload 1 loại: ảnh hoặc file"
            });
        }

        const post = await postService.createPost(
            { title, content, imageUrl, fileUrl },
            req.user.id
        );

        res.json({ status: "success", data: post });
    } catch (err) {
        res
            .status(err.status || 500)
            .json({ status: "error", message: err.message });
    }
};


exports.deletePost = async (req, res) => {
    try {
        await postService.deletePost(req.params.id, req.user.id);
        res.json({ status: "success", message: "Xóa bài viết thành công" });
    } catch (err) {
        res.status(err.status || 500).json({ status: "error", message: err.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const post = await postService.updatePost(req.params.id, req.user.id, req.body);
        res.json({ status: "success", data: post });
    } catch (err) {
        res.status(err.status || 500).json({ status: "error", message: err.message });
    }
};

exports.getMyPosts = async (req, res) => {
    try {
        const posts = await postService.getMyPosts(req.user.id);
        res.json({ status: "success", data: posts });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};
