import { ChangeEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, MessageSquare, Heart, Search, Plus, X } from "lucide-react";

import { TopNavigation } from "../../components/timeline/TopNavigation";
import { DoctorSidebar } from "../../components/doctor/DoctorSidebar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../contexts/AuthContext";
import API from "../../Api";

const CATEGORY_OPTIONS = [
  "Success Stories",
  "Discussion",
  "Q&A",
  "Support",
];

type LikeUser = {
  _id: string;
  fullName: string;
};

type CommunityPost = {
  _id: string;
  title: string;
  body: string;
  category: string;
  createdAt: string;
  imageUrl?: string | null;
  userId?: string;
  author?: { fullName: string };
  likes?: string[];
  likesCount?: number;
  likesUsers?: LikeUser[];
  commentsCount?: number;
};

type CommunityComment = {
  _id: string;
  body: string;
  createdAt: string;
  userId?: { fullName: string };
};

export function CommunityPage() {
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor";
  const [activeTab, setActiveTab] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  const [activePost, setActivePost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  const getErrorMessage = (error: unknown) => {
    if (typeof error === "object" && error !== null) {
      const response = (error as { response?: { data?: { message?: string } } }).response;
      return response?.data?.message || "Unable to process request.";
    }
    return "Unable to process request.";
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/v1/community/posts");
      setPosts(res.data?.posts || []);
    } catch (err) {
      console.error("Community error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user?._id]);

  const handleCreatePost = async () => {
    if (!title.trim() || !body.trim() || !category) {
      setError("Please fill in title, body, and category.");
      return;
    }

    setError("");
    setSubmitLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("body", body.trim());
      formData.append("category", category);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await API.post("/api/v1/community/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newPost = res.data?.post;
      if (newPost) {
        newPost.author = newPost.author || { fullName: user?.fullName || "User" };
        setPosts((prev) => [newPost, ...prev]);
      }

      setTitle("");
      setBody("");
      setCategory(CATEGORY_OPTIONS[0]);
      setImageFile(null);
      setShowNewPost(false);
    } catch (error) {
      console.error("Create post error:", error);
      setError(getErrorMessage(error));
    } finally {
      setSubmitLoading(false);
    }
  };

  const fetchComments = async (postId: string) => {
    setCommentsLoading(true);
    try {
      const res = await API.get(`/api/v1/community/comments?postId=${postId}`);
      setComments(res.data?.comments || []);
    } catch (error) {
      console.error("Comments fetch error:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const openComments = async (post: CommunityPost) => {
    setActivePost(post);
    setCommentError("");
    setNewComment("");
    await fetchComments(post._id);
  };

  const closeComments = () => {
    setActivePost(null);
    setComments([]);
    setNewComment("");
    setCommentError("");
  };

  const handleAddComment = async () => {
    if (!activePost) return;

    if (!newComment.trim()) {
      setCommentError("Please write a comment first.");
      return;
    }

    if (!user) {
      setCommentError("Please log in to add a comment.");
      return;
    }

    setCommentError("");
    setCommentLoading(true);

    try {
      const res = await API.post("/api/v1/community/comments", {
        postId: activePost._id,
        body: newComment.trim(),
      });

      const added = res.data?.comment;
      if (added) {
        setComments((prev) => [added, ...prev]);
        setPosts((prev) =>
          prev.map((post) =>
            post._id === activePost._id
              ? { ...post, commentsCount: (post.commentsCount || 0) + 1 }
              : post
          )
        );
        setActivePost((prev) =>
          prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : prev
        );
      }

      setNewComment("");
    } catch (error) {
      console.error("Add comment error:", error);
      setCommentError(getErrorMessage(error));
    } finally {
      setCommentLoading(false);
    }
  };

  const isPostLikedByUser = (post: CommunityPost) =>
    Boolean(user && post.likes?.some((id) => id === user._id));

  const getLikeUsersLabel = (post: CommunityPost) => {
    if (!post.likesUsers || post.likesUsers.length === 0) {
      return "No likes yet";
    }

    const visibleUsers = post.likesUsers.slice(0, 3).map((current) => current.fullName);
    const remaining = post.likesUsers.length - visibleUsers.length;
    return remaining > 0
      ? `Liked by ${visibleUsers.join(", ")} and ${remaining} more`
      : `Liked by ${visibleUsers.join(", ")}`;
  };

  const handleLikePost = async (post: CommunityPost) => {
    if (!user || !user._id) {
      console.warn("Login required to like posts.");
      return;
    }

    const userId = user._id;
    const liked = isPostLikedByUser(post);
    const request = liked
      ? API.delete(`/api/v1/community/posts/${post._id}/like`)
      : API.post(`/api/v1/community/posts/${post._id}/like`);

    try {
      await request;

      const updatedLikes = liked
        ? (post.likes || []).filter((id) => id !== userId)
        : [...(post.likes || []), userId];

      const updatedLikesUsers = liked
        ? (post.likesUsers || []).filter((likeUser) => likeUser._id !== userId)
        : [
          ...(post.likesUsers || []),
          { _id: userId, fullName: user.fullName || "User" },
        ];

      const updatedPost: CommunityPost = {
        ...post,
        likes: updatedLikes,
        likesCount: updatedLikes.length,
        likesUsers: updatedLikesUsers,
      };

      setPosts((prev) => prev.map((item) => (item._id === post._id ? updatedPost : item)));

      if (activePost?._id === post._id) {
        setActivePost(updatedPost);
      }
    } catch (error) {
      console.error("Like post error:", error);
    }
  };

  // ================= FILTER =================
  const filteredPosts = posts.filter((post) => {
    const matchesTab =
      activeTab === "All" || post.category === activeTab;

    const matchesSearch =
      post.title?.toLowerCase().includes(search.toLowerCase()) ||
      post.body?.toLowerCase().includes(search.toLowerCase()); // ✅ FIX

    return matchesTab && matchesSearch;
  });

  return (
    <div className={`min-h-screen bg-slate-50 pb-12 ${isDoctor ? "lg:flex" : ""}`}>
      {isDoctor ? (
        <DoctorSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      ) : (
        <TopNavigation />
      )}

      <div className={isDoctor ? "flex-1" : ""}>
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-start gap-3">
            {isDoctor && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="mt-1 rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm lg:hidden"
                aria-label="Open doctor navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div>
            <h1 className="text-3xl font-bold">Community Forum</h1>
            <p className="text-slate-600">
              {isDoctor
                ? "Join patients in conversation, reactions, and comments"
                : "Share experiences and learn from others"}
            </p>
            </div>
          </div>

          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowNewPost((prev) => !prev)}
          >
            {showNewPost ? "Close" : "New Post"}
          </Button>
        </div>

        {showNewPost && (
          <Card className="mb-8 p-6 bg-white border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Create a new post</h2>
                <p className="text-slate-500 text-sm">
                  Add a title, choose a category, and share your story.
                </p>
              </div>
              <button
                onClick={() => setShowNewPost(false)}
                className="rounded-full p-2 bg-slate-100 text-slate-600 hover:bg-slate-200"
                type="button"
                aria-label="Close new post form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Title"
                placeholder="Post title"
                value={title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <select
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  aria-label="Post category"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <Textarea
                label="Body"
                placeholder="Write your post..."
                value={body}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
                className="min-h-[140px]"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-700"
                aria-label="Upload an image for the post"
              />
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleCreatePost} disabled={submitLoading}>
                {submitLoading ? "Posting..." : "Create Post"}
              </Button>
              <Button variant="secondary" onClick={() => setShowNewPost(false)} type="button">
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* SEARCH */}
        <div className="relative flex-1 mb-6">
          <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search posts..."
            className="pl-10"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>

        {/* FILTER */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {["All", "Discussion", "Q&A", "Success Stories", "Support"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm ${activeTab === tab
                ? "bg-teal-600 text-white"
                : "bg-white border text-slate-600"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* POSTS */}
        <div className="space-y-4">

          {loading ? (
            <p className="text-center text-slate-500">Loading posts...</p>
          ) : filteredPosts.length === 0 ? (
            <p className="text-center text-slate-500">No posts found</p>
          ) : (
            filteredPosts.map((post) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge>{post.category}</Badge>
                    <span className="text-slate-500 text-sm">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mt-3">{post.title}</h3>

                  <p className="text-slate-600 text-sm mt-2 line-clamp-2">
                    {post.body}
                  </p>

                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="mt-4 max-h-72 w-full rounded-xl object-cover"
                    />
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-3 border-t gap-3">

                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-semibold">
                        {(post.author?.fullName || (post.userId === user?._id ? user?.fullName : "User") || "User").charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-900">
                        {post.author?.fullName || (post.userId === user?._id ? user?.fullName : "User") || "User"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-4 text-slate-500 text-sm">
                        <button
                          type="button"
                          className={`flex items-center gap-1 ${isPostLikedByUser(post) ? 'text-rose-600' : 'hover:text-teal-600'}`}
                          onClick={() => handleLikePost(post)}
                        >
                          <Heart className="w-4 h-4" />
                          {post.likesCount ?? post.likes?.length ?? 0}
                        </button>

                        <button
                          className="flex items-center gap-1 hover:text-teal-600"
                          onClick={() => openComments(post)}
                          type="button"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {post.commentsCount || 0}
                        </button>
                      </div>

                      <p className="text-xs text-slate-500">{getLikeUsersLabel(post)}</p>
                    </div>
                  </div>

                </Card>
              </motion.div>
            ))
          )}
        </div>

        {activePost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">
                    {activePost.category}
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900 mt-2">
                    {activePost.title}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {new Date(activePost.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeComments}
                  className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                  aria-label="Close comments"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6 p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-3 text-sm text-slate-700">
                  <p>{activePost.body}</p>
                  {activePost.imageUrl && (
                    <img
                      src={activePost.imageUrl}
                      alt={activePost.title}
                      className="w-full rounded-2xl object-cover"
                    />
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Comments</p>
                      <p className="text-xs text-slate-500">
                        {activePost.commentsCount || 0} total
                      </p>
                    </div>
                  </div>

                  {commentsLoading ? (
                    <p className="text-center text-slate-500">Loading comments...</p>
                  ) : comments.length === 0 ? (
                    <p className="text-center text-slate-500">No comments yet. Be the first to reply.</p>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment._id} className="rounded-2xl bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-9 w-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold">
                              {comment.userId?.fullName?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {comment.userId?.fullName || "User"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-slate-700">{comment.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t bg-slate-50 px-6 py-5">
                <div className="space-y-3">
                  <Textarea
                    label="Write a comment"
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                    className="min-h-[120px]"
                  />
                  {commentError && (
                    <p className="text-sm text-red-600">{commentError}</p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleAddComment} disabled={commentLoading}>
                      {commentLoading ? "Sending..." : "Post Comment"}
                    </Button>
                    <Button variant="secondary" onClick={closeComments} type="button">
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      </div>
    </div>
  );
}
