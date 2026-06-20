import express from "express";
import {
  createCheckoutSession,
  checkSessionStatus,
  cancelSubscription,
} from "./services/subscription.service.js";
import { authenticationMiddleware } from "../Middleware/authentication.middleware.js";

const router = express.Router();

router.post(
  "/payment",
  authenticationMiddleware(),
  createCheckoutSession
);
router.get("/session-status", checkSessionStatus);
router.post(
  "/cancel",
  authenticationMiddleware(),
  cancelSubscription
);

export default router;
