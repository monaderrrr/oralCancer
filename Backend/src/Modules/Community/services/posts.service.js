import Post from '../../../DB/models/post.model.js';

export const createPostService = async (req, res) => {
  const { title, body, category } = req.body;
  const userId = req.authUser._id;

  // Get image path from Multer if file uploaded
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const post = await Post.create({ title, body, category, userId, imageUrl });
  return res.status(201).json({ message: 'Post created', post });
};

import Comment from '../../../DB/models/comment.model.js';

export const listPostsService = async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate('userId', 'fullName')
    .populate('likes', 'fullName')
    .lean();

  const commentCounts = await Comment.aggregate([
    { $group: { _id: '$postId', count: { $sum: 1 } } }
  ]);

  const commentCountMap = commentCounts.reduce((acc, item) => {
    acc[item._id.toString()] = item.count;
    return acc;
  }, {});

  const postsWithMeta = posts.map((post) => {
    const likeUsers = Array.isArray(post.likes)
      ? post.likes
        .map((like) => {
          if (!like) return null;
          if (typeof like === 'string') {
            return { _id: like, fullName: 'User' };
          }
          if (typeof like === 'object' && 'fullName' in like) {
            return {
              _id: like._id?.toString?.() || String(like._id),
              fullName: like.fullName || 'User',
            };
          }
          if (typeof like === 'object' && '_id' in like) {
            return {
              _id: like._id?.toString?.() || String(like._id),
              fullName: 'User',
            };
          }
          return null;
        })
        .filter(Boolean)
      : [];

    const likeIds = likeUsers.map((user) => user._id);

    return {
      ...post,
      commentsCount: commentCountMap[post._id.toString()] || 0,
      author: { fullName: post.userId?.fullName || 'User' },
      likes: likeIds,
      likesCount: likeUsers.length,
      likesUsers: likeUsers,
    };
  });

  return res.status(200).json({ message: 'OK', posts: postsWithMeta });
};

export const getPostService = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id).lean();
  if (!post) return res.status(404).json({ message: 'Post not found' });
  return res.status(200).json({ message: 'OK', post });
};

export const updatePostService = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const post = await Post.findByIdAndUpdate(id, updates, { new: true }).lean();
  if (!post) return res.status(404).json({ message: 'Post not found' });
  return res.status(200).json({ message: 'Post updated', post });
};

export const deletePostService = async (req, res) => {
  const { id } = req.params;
  await Post.findByIdAndDelete(id);
  return res.status(200).json({ message: 'Post deleted' });
};

/**
 * Like a post
 * POST /api/v1/community/posts/:id/like
 */
export const likePostService = async (req, res) => {
  const { id } = req.params;
  const userId = req.authUser._id;

  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  // Check if user already liked
  if (post.likes.includes(userId)) {
    return res.status(400).json({ message: 'Post already liked by this user' });
  }

  post.likes.push(userId);
  await post.save();

  return res.status(200).json({
    message: 'Post liked successfully',
    post: {
      ...post.toObject(),
      likesCount: post.likes.length,
      favoritesCount: post.favorites.length,
      userLiked: true,
      userFavorited: post.favorites.includes(userId),
    },
  });
};

/**
 * Unlike a post
 * DELETE /api/v1/community/posts/:id/like
 */
export const unlikePostService = async (req, res) => {
  const { id } = req.params;
  const userId = req.authUser._id;

  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  // Check if user hasn't liked
  if (!post.likes.includes(userId)) {
    return res.status(400).json({ message: 'Post not liked by this user' });
  }

  post.likes = post.likes.filter(id => !id.equals(userId));
  await post.save();

  return res.status(200).json({
    message: 'Post unliked successfully',
    post: {
      ...post.toObject(),
      likesCount: post.likes.length,
      favoritesCount: post.favorites.length,
      userLiked: false,
      userFavorited: post.favorites.includes(userId),
    },
  });
};

/**
 * Favorite a post
 * POST /api/v1/community/posts/:id/favorite
 */
export const favoritePostService = async (req, res) => {
  const { id } = req.params;
  const userId = req.authUser._id;

  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  // Check if user already favorited
  if (post.favorites.includes(userId)) {
    return res.status(400).json({ message: 'Post already favorited by this user' });
  }

  post.favorites.push(userId);
  await post.save();

  return res.status(200).json({
    message: 'Post favorited successfully',
    post: {
      ...post.toObject(),
      likesCount: post.likes.length,
      favoritesCount: post.favorites.length,
      userLiked: post.likes.includes(userId),
      userFavorited: true,
    },
  });
};

/**
 * Unfavorite a post
 * DELETE /api/v1/community/posts/:id/favorite
 */
export const unfavoritePostService = async (req, res) => {
  const { id } = req.params;
  const userId = req.authUser._id;

  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  // Check if user hasn't favorited
  if (!post.favorites.includes(userId)) {
    return res.status(400).json({ message: 'Post not favorited by this user' });
  }

  post.favorites = post.favorites.filter(id => !id.equals(userId));
  await post.save();

  return res.status(200).json({
    message: 'Post unfavorited successfully',
    post: {
      ...post.toObject(),
      likesCount: post.likes.length,
      favoritesCount: post.favorites.length,
      userLiked: post.likes.includes(userId),
      userFavorited: false,
    },
  });
};
