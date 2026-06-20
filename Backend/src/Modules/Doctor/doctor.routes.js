import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { requireDb } from "../../Middleware/db.middleware.js";
import { authenticationMiddleware } from "../../Middleware/authentication.middleware.js";

import {
  uploadVerificationDocsHandler,
  getDashboardHandler,
  getActivityFeedHandler,
  getPatientDirectoryHandler,
  getSharedScansForReviewHandler,
  getScanDetailsHandler,
  getLatestSharedScanHandler,
  submitScanReviewHandler,
  uploadProofHandler,
  getDoctorByIdHandler,
  createReviewHandler,
  getDoctorReviewsHandler
} from "./doctor.controller.js";

const router = express.Router();

router.use((req, res, next) => {
  console.log("[DoctorRoutes]", req.method, req.originalUrl, "matched doctor router path", req.path);
  next();
});

// ================= MULTER SETUP =================
const uploadPath = path.join("uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ================= DB =================
router.use(requireDb);

// ================= PUBLIC ROUTES =================
router.get("/doctor/:id", getDoctorByIdHandler);
router.get("/reviews/:doctorId", getDoctorReviewsHandler);

router.post(
  "/upload-verification-docs",
  upload.array("files", 10),
  uploadVerificationDocsHandler
);

// ================= AUTH MIDDLEWARE =================
router.use(authenticationMiddleware());

// patient reviews allowed
router.post("/review/:doctorId", createReviewHandler);

// ================= DOCTOR ONLY MIDDLEWARE =================
const doctorOnlyMiddleware = (req, res, next) => {
  if (req.authUser?.role !== "doctor") {
    return res.status(403).json({
      success: false,
      message: "Only doctors can access this resource",
    });
  }
  next();
};

router.use(doctorOnlyMiddleware);

// ================= DOCTOR ROUTES =================
router.get("/dashboard", getDashboardHandler);
router.get("/activity", getActivityFeedHandler);
router.get("/patients", getPatientDirectoryHandler);
router.get("/shared-scans/:patientId/latest", getLatestSharedScanHandler);
router.get("/scans", getSharedScansForReviewHandler);
router.get("/scans/:scanId", getScanDetailsHandler);
router.post("/scans/:scanId/review", submitScanReviewHandler);

router.post(
  "/upload-proof",
  upload.fields([{ name: "proof", maxCount: 5 }]),
  uploadProofHandler
);

export default router;
