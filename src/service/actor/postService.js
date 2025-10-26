const Post = require("../../models/Post");
const User = require("../../models/User");
const mongoose = require("mongoose");

// Tạo bài viết
exports.createPost = async (data, userId) => {
  const user = await User.findById(userId);
  if (!user || !["ADMIN", "TRUONGBANTUVAN", "TUVANVIEN"].includes(user.role)) {
    throw { status: 403, message: "Bạn không có quyền tạo bài viết" };
  }

  // Kiểm tra chỉ được upload 1 loại
  if (data.imageUrl && data.fileUrl) {
    throw { status: 400, message: "Chỉ được upload 1 trong 2 (ảnh hoặc file)" };
  }

  const post = new Post({
    title: data.title,
    content: data.content,
    imageUrl: data.imageUrl || null,
    fileUrl: data.fileUrl || null,
    approved: data.approved || false,
    user: userId
  });

  await post.save();
  return post;
};

// Xóa bài viết
exports.deletePost = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) throw { status: 404, message: "Không tìm thấy bài viết" };

  if (String(post.user) !== String(userId)) {
    throw { status: 403, message: "Bạn chỉ được xóa bài viết của chính mình" };
  }

  await post.deleteOne();
  return true;
};

// Sửa bài viết
exports.updatePost = async (postId, userId, data) => {
  const post = await Post.findById(postId);
  if (!post) throw { status: 404, message: "Không tìm thấy bài viết" };

  if (String(post.user) !== String(userId)) {
    throw { status: 403, message: "Bạn chỉ được sửa bài viết của chính mình" };
  }

  post.title = data.title ?? post.title;
  post.content = data.content ?? post.content;

  await post.save();
  return post;
};

// Xem tất cả bài viết của mình
exports.getMyPosts = async (userId) => {
  return await Post.find({ user: userId }).sort({ createdAt: -1 });
};

// Lấy danh sách tất cả bài viết (cho admin/manager/consultant)
exports.getPosts = async (queryParams) => {
  const { page = 0, size = 10, limit = 10, isApproved } = queryParams;
  const pageNumber = parseInt(page) || 0;
  const pageSize = parseInt(size) || parseInt(limit) || 10;
  const skip = pageNumber * pageSize;
  
  let filter = {};
  if (isApproved !== undefined) {
    filter.approved = isApproved === 'true';
  }
  
  const posts = await Post.find(filter)
    .populate('user', 'fullName email avatarUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize);
  
  // Transform posts to match frontend expectations
  const transformedPosts = posts.map(post => {
    const postObj = post.toJSON(); // Use toJSON to get id instead of _id
    
    // Extract file name from fileUrl if exists
    let fileName = '';
    if (postObj.fileUrl) {
      const urlParts = postObj.fileUrl.split('/');
      fileName = urlParts[urlParts.length - 1] || '';
    }
    
    return {
      ...postObj,
      name: postObj.user?.fullName || 'Người dùng',
      avatarUrl: postObj.user?.avatarUrl || '',
      userId: postObj.user?.id || postObj.user?._id || postObj.user,
      fileName: fileName,
      imageUrl: postObj.imageUrl || '',
      fileUrl: postObj.fileUrl || '',
      views: postObj.views || 0,
      totalComments: postObj.totalComments || 0
    };
  });
    
  const total = await Post.countDocuments(filter);
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    content: transformedPosts,
    totalPages,
    totalElements: total,
    currentPage: pageNumber
  };
};

// Lấy chi tiết bài viết
exports.getPostDetail = async (postId) => {
  // Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw { status: 400, message: "ID bài viết không hợp lệ" };
  }
  
  const post = await Post.findById(postId)
    .populate('user', 'fullName email avatarUrl');
    
  if (!post) {
    throw { status: 404, message: "Không tìm thấy bài viết" };
  }
  
  // Transform data to match frontend expectations
  const postObj = post.toJSON(); // Use toJSON to get id instead of _id
  
  // Extract file name from fileUrl if exists
  let fileName = '';
  if (postObj.fileUrl) {
    const urlParts = postObj.fileUrl.split('/');
    fileName = urlParts[urlParts.length - 1] || '';
  }
  
  return {
    ...postObj,
    name: postObj.user?.fullName || 'Người dùng',
    avatarUrl: postObj.user?.avatarUrl || '',
    userId: postObj.user?.id || postObj.user?._id || postObj.user,
    fileName: fileName,
    imageUrl: postObj.imageUrl || '',
    fileUrl: postObj.fileUrl || '',
    views: postObj.views || 0,
    totalComments: postObj.totalComments || 0
  };
};

// Duyệt bài viết (admin)
exports.approvePost = async (postId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw { status: 404, message: "Không tìm thấy bài viết" };
  }
  
  post.approved = true;
  await post.save();
  return post;
};