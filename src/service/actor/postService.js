const Post = require("../../models/Post");
const User = require("../../models/User");

// Tạo bài viết
exports.createPost = async (data, userId) => {
  const user = await User.findById(userId);
  if (!user || user.role !== "TRUONGBANTUVAN") {
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
