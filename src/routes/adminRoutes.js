const express = require("express");
const router = express.Router();
const postService = require("../service/actor/postService");
const { DataResponse, ExceptionResponse } = require("../utils/response");
const authMiddleware = require("../middleware/authMiddleware");

// Duyệt bài viết (admin)
router.post("/post/approve", authMiddleware(["ADMIN"]), async (req, res) => {
    try {
        const { id } = req.query;
        
        if (!id) {
            return res.status(400).json(new ExceptionResponse("Thiếu id bài viết", undefined, 'error'));
        }

        await postService.approvePost(id);
        return res.status(200).json(new DataResponse(null, "Duyệt bài viết thành công", 'success'));
    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
});

module.exports = router;
