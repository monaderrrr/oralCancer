import { Router } from 'express';
import { validationMiddleware } from '../../Middleware/validation.middleware.js';
import { createContentSchema, updateContentSchema } from '../../Validators/content.schema.js';
import { authenticationMiddleware } from '../../Middleware/authentication.middleware.js';
import { ensureOwner } from '../../Middleware/authorization.middleware.js';
import { createContentService, listContentService, getContentService, updateContentService, deleteContentService } from './services/content.service.js';
import { errorHandler } from '../../Middleware/error-handler.middleware.js';

const router = Router();

router.get('/', authenticationMiddleware(), errorHandler(listContentService));
router.get('/:id', authenticationMiddleware(), errorHandler(getContentService));
router.post('/', authenticationMiddleware(), validationMiddleware(createContentSchema), errorHandler(createContentService));
router.put('/:id', authenticationMiddleware(), ensureOwner({ model: 'Content', idParam: 'id', ownerField: 'authorId' }), validationMiddleware(updateContentSchema), errorHandler(updateContentService));
router.delete('/:id', authenticationMiddleware(), ensureOwner({ model: 'Content', idParam: 'id', ownerField: 'authorId' }), errorHandler(deleteContentService));

export default router;
