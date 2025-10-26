const postService = require("../../service/actor/postService");
const { DataResponse, ExceptionResponse } = require("../../utils/response");

// Export dữ liệu
exports.exportData = async (req, res) => {
    try {
        const { dataType, exportType, ...queryParams } = req.query;
        
        if (!dataType || !exportType) {
            return res.status(400).json(new ExceptionResponse("Thiếu dataType hoặc exportType", undefined, 'error'));
        }

        let data = [];
        let fileName = '';

        // Lấy dữ liệu theo loại
        if (dataType === 'post') {
            const result = await postService.getPosts(queryParams);
            data = result.content;
            fileName = `posts_${new Date().toISOString().split('T')[0]}`;
        } else {
            return res.status(400).json(new ExceptionResponse("Loại dữ liệu không được hỗ trợ", undefined, 'error'));
        }

        if (exportType === 'csv') {
            return await exportToCSV(res, data, fileName);
        } else {
            return res.status(400).json(new ExceptionResponse("Chỉ hỗ trợ export CSV", undefined, 'error'));
        }

    } catch (err) {
        return res.status(err.status || 500).json(new ExceptionResponse(err.message, undefined, 'error'));
    }
};

// Export to CSV
async function exportToCSV(res, data, fileName) {
    let csvContent = 'STT,Tiêu đề,Tác giả,Ngày tạo,Trạng thái,Nội dung\n';
    
    data.forEach((post, index) => {
        const row = [
            index + 1,
            `"${post.title}"`,
            `"${post.user?.name || 'N/A'}"`,
            new Date(post.createdAt).toLocaleDateString('vi-VN'),
            post.approved ? 'Đã duyệt' : 'Chưa duyệt',
            `"${post.content.substring(0, 200).replace(/"/g, '""')}..."`
        ].join(',');
        csvContent += row + '\n';
    });
    
    // Set headers
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
    
    res.send(csvContent);
}
