// dashboard.routes.js
import express from "express";
import multer from "multer";
import { authenticationMiddleware } from "../../Middleware/authentication.middleware.js";
import { patientOnlyMiddleware } from "../../Middleware/patient-only.middleware.js";
import { requireDb } from "../../Middleware/db.middleware.js";
import {
  createScanHandler,
  getScanHistoryHandler,
  getPatientScanDetailsHandler,
  getRecommendationsHandler,
  getActivityTimelineHandler,
  getDashboardOverviewHandler,
  getAllDoctorsHandler,
  shareScanHandler,
} from "./dashboard.controller.js";
import {getDoctorByIdHandler}from"../Doctor/doctor.controller.js";

const router = express.Router();

// -------------------- Multer Configuration --------------------
import path from "path";
import fs from "fs";

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

// -------------------- Apply Middlewares --------------------
router.use(requireDb);
router.use(authenticationMiddleware());

// -------------------- Dashboard Routes --------------------

// GET /api/v1/patient/dashboard
router.get(
  "/patient/dashboard",
  patientOnlyMiddleware(),
  getDashboardOverviewHandler
);

// -------------------- Scan Routes --------------------

// POST /api/v1/patient/scans
// Only accept image in `image` field (multipart/form-data) or imageUrl
router.post(
  "/scans",
  patientOnlyMiddleware(),
  upload.fields([{ name: "image", maxCount: 1 }]), // <-- only 'image'
  createScanHandler
);

// GET /api/v1/patient/scans/history
router.get(
  "/scans/history",
  patientOnlyMiddleware(),
  getScanHistoryHandler
);

router.get(
  "/scans/:scanId",
  patientOnlyMiddleware(),
  getPatientScanDetailsHandler
);

// -------------------- Recommendation Routes --------------------

// GET /api/v1/patient/recommendations
router.get(
  "/recommendations",
  patientOnlyMiddleware(),
  getRecommendationsHandler
);

// -------------------- Activity Timeline Routes --------------------

// GET /api/v1/patient/activity
router.get(
  "/patient/activity",
  patientOnlyMiddleware(),
  getActivityTimelineHandler
);

router.get("/doctors", patientOnlyMiddleware(), getAllDoctorsHandler);
router.get("/doctors/:id",patientOnlyMiddleware(), getDoctorByIdHandler);
router.post(
  "/scans/share",
  patientOnlyMiddleware(),
  shareScanHandler
);
export default router;
