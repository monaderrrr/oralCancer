import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true, trim: true },
  imageUrl: { type: String, default: null }, // Image path from Multer
  category: {
    type: String,
    enum: ['Success Stories', 'Discussion', 'Q&A', 'Support'],
    required: true,
  },
  likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] }, // Array of user IDs who liked
  favorites: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] }, // Array of user IDs who favorited
}, { timestamps: true });

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
export default Post;
