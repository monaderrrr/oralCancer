import Post from '../DB/models/post.model.js';
import Comment from '../DB/models/comment.model.js';
import Content from '../DB/models/content.model.js';

// Middleware to ensure authenticated user has one of allowed roles
export const allowRoles = (roles = []) => {
  return async (req, res, next) => {
    try {
      const userRole = req.authUser?.role;
      // If auth middleware doesn't attach role, fetch it (best-effort)
      if (!userRole) {
        // skip fetching for brevity; assume auth attaches role in future
      }
      if (!roles.length) return next();
      if (!userRole || !roles.includes(userRole)) {
        return res.status(403).json({ message: 'Forbidden: insufficient role' });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

// Generic owner check middleware factory
export const ensureOwner = ({ model, idParam = 'id', ownerField = 'userId' }) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam] || req.body[idParam] || req.body[`${idParam}`];
      if (!resourceId) return res.status(400).json({ message: 'Missing resource identifier' });

      let resource;
      if (model === 'Post') resource = await Post.findById(resourceId);
      else if (model === 'Comment') resource = await Comment.findById(resourceId);
      else if (model === 'Content') resource = await Content.findById(resourceId);
      else return res.status(500).json({ message: 'Invalid owner check configuration' });

      if (!resource) return res.status(404).json({ message: 'Resource not found' });

      if (!req.authUser?._id) {
        return res.status(401).json({ message: 'Unauthorized: user id not found' });
      }

      if (!resource[ownerField]) {
        return res.status(500).json({ message: 'Owner field missing on resource' });
      }

      if (resource[ownerField].toString() !== req.authUser._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: not the owner' });
      }

      // attach resource to request for handler convenience
      req.resource = resource;
      next();
    } catch (err) {
      next(err);
    }
  };
};
