import { Router } from "express";
import {
  getAllUsersService,
  profileService,
  updatePasswordService,
  updateProfileService
} from "./services/profile.service.js";import { authenticationMiddleware, checkRefreshToken } from "../../Middleware/authentication.middleware.js";
import { errorHandler } from "../../Middleware/error-handler.middleware.js";
import { validationMiddleware } from "../../Middleware/validation.middleware.js";
import { updatePasswordSchema, updateProfileSchema } from "../../Validators/profile.schema.js";
import { requireDb } from "../../Middleware/db.middleware.js";

const userController = Router();

// ensure DB is connected before any authenticated user routes
userController.use(requireDb);
userController.use(errorHandler(authenticationMiddleware()));

userController.get('/profile', errorHandler(profileService));

userController.patch("/updatePassword", errorHandler(checkRefreshToken()), errorHandler(validationMiddleware(updatePasswordSchema)), errorHandler(updatePasswordService));
userController.put('/updateProfile', errorHandler(validationMiddleware(updateProfileSchema)), errorHandler(updateProfileService));

userController.get('/listUsers', errorHandler(getAllUsersService));
export default userController;
