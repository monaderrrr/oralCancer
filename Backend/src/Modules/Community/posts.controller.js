import { Router } from 'express';
import { validationMiddleware } from '../../Middleware/validation.middleware.js';
import { createPostSchema, updatePostSchema } from '../../Validators/community.schema.js';
import { authenticationMiddleware } from '../../Middleware/authentication.middleware.js';
import { ensureOwner } from '../../Middleware/authorization.middleware.js';
import { createPostService, listPostsService, getPostService, updatePostService, deletePostService, likePostService, unlikePostService, favoritePostService, unfavoritePostService } from './services/posts.service.js';
import { errorHandler } from '../../Middleware/error-handler.middleware.js';
import upload from '../../config/multer.config.js';

const router = Router();

// Create post with optional image upload via Multer
router.post('/posts', 
  authenticationMiddleware(), 
  upload.single('image'), // Single image file upload with field name 'image'
  validationMiddleware(createPostSchema), 
  errorHandler(createPostService)
);

router.get('/posts', errorHandler(listPostsService));
router.get('/posts/:id', errorHandler(getPostService));
router.put('/posts/:id', authenticationMiddleware(), ensureOwner({ model: 'Post', idParam: 'id', ownerField: 'userId' }), validationMiddleware(updatePostSchema), errorHandler(updatePostService));
router.delete('/posts/:id', authenticationMiddleware(), ensureOwner({ model: 'Post', idParam: 'id', ownerField: 'userId' }), errorHandler(deletePostService));

// Like/Unlike routes
router.post('/posts/:id/like', authenticationMiddleware(), errorHandler(likePostService));
router.delete('/posts/:id/like', authenticationMiddleware(), errorHandler(unlikePostService));

// Favorite/Unfavorite routes
router.post('/posts/:id/favorite', authenticationMiddleware(), errorHandler(favoritePostService));
router.delete('/posts/:id/favorite', authenticationMiddleware(), errorHandler(unfavoritePostService));

export default router;
