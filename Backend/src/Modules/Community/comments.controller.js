import { Router } from 'express';
import { validationMiddleware } from '../../Middleware/validation.middleware.js';
import { createCommentSchema } from '../../Validators/community.schema.js';
import { authenticationMiddleware } from '../../Middleware/authentication.middleware.js';
import { ensureOwner } from '../../Middleware/authorization.middleware.js';
import { addCommentService, deleteCommentService, getCommentsService } from './services/comments.service.js';
import { errorHandler } from '../../Middleware/error-handler.middleware.js';

const router = Router();

router.get('/comments', errorHandler(getCommentsService));
router.post('/comments', authenticationMiddleware(), validationMiddleware(createCommentSchema), errorHandler(addCommentService));
router.delete('/comments/:id', authenticationMiddleware(), ensureOwner({ model: 'Comment', idParam: 'id', ownerField: 'userId' }), errorHandler(deleteCommentService));

export default router;
