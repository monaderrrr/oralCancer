import Comment from '../../../DB/models/comment.model.js';
import Post from '../../../DB/models/post.model.js';

export const addCommentService = async (req, res) => {
  const { postId, body } = req.body;
  const userId = req.authUser._id;

  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const comment = await Comment.create({ postId, body, userId });
  await comment.populate('userId', 'fullName');

  return res.status(201).json({ message: 'Comment added', comment });
};

export const getCommentsService = async (req, res) => {
  const { postId } = req.query;
  if (!postId) return res.status(400).json({ message: 'postId query parameter is required' });

  const comments = await Comment.find({ postId })
    .sort({ createdAt: -1 })
    .populate('userId', 'fullName')
    .lean();

  return res.status(200).json({ message: 'OK', comments });
};

export const deleteCommentService = async (req, res) => {
  const { id } = req.params;
  await Comment.findByIdAndDelete(id);
  return res.status(200).json({ message: 'Comment deleted' });
};
