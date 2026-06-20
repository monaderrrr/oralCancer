import express from "express";
import { authenticationMiddleware } from "../../Middleware/authentication.middleware.js";
import { roleCheck } from "../../Middleware/rbac.middleware.js";
import {
  getPendingDoctors,
  getAllDoctors,
  getDoctorDetails,
  approveDoctor,
  rejectDoctor,
} from "./admin.controller.js";

const router = express.Router();

/**
 * Admin Routes - All require admin role
 */

// Get all pending doctors for approval
router.get(
  "/doctors/pending",
  authenticationMiddleware(),
  roleCheck(["admin"]),
  getPendingDoctors
);

// Get all doctors (with optional status filter)
router.get(
  "/doctors",
  authenticationMiddleware(),
  roleCheck(["admin"]),
  getAllDoctors
);

// Get specific doctor details
router.get(
  "/doctors/:doctorId",
  authenticationMiddleware(),
  roleCheck(["admin"]),
  getDoctorDetails
);

// Approve a doctor
router.post(
  "/doctors/:doctorId/approve",
  authenticationMiddleware(),
  roleCheck(["admin"]),
  approveDoctor
);

// Reject a doctor
router.post(
  "/doctors/:doctorId/reject",
  authenticationMiddleware(),
  roleCheck(["admin"]),
  rejectDoctor
);

export default router;
