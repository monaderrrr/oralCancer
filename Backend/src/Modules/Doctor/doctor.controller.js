import {
  getDashboardOverviewService,
  getActivityFeedService,
  getPatientDirectoryService,
  getSharedScansForReviewService,
  getScanDetailsService,
  getLatestSharedScanService,
  submitScanReviewService,
  uploadProofService,
  uploadVerificationDocsService,
  getDoctorByIdService,
  createReviewService,
  getDoctorReviewsService,
} from "./services/doctor.service.js";
import mongoose from "mongoose";


/**
 * GET /api/v1/doctor/dashboard
 * Get dashboard overview with stats and charts
 */
export const getDashboardHandler = async (req, res, next) => {
  try {
    const doctorId = req.authUser._id;
    const dashboardData = await getDashboardOverviewService(doctorId);

    return res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/doctor/activity
 * Get recent activity feed
 */
export const getActivityFeedHandler = async (req, res, next) => {
  try {
    const doctorId = req.authUser._id;

    const { limit } = req.query;
    const limitNum = Math.min(parseInt(limit) || 20, 50);

    const activities = await getActivityFeedService(limitNum, doctorId);

    return res.status(200).json({
      success: true,
      message: "Activity feed retrieved successfully",
      data: { activities, count: activities.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/doctor/patients
 * Get patient directory with search and filter
 */
export const getPatientDirectoryHandler = async (req, res, next) => {
  try {
    const { filter = "all", search = "", page = 1, limit = 10 } = req.query;
    const doctorId = req.authUser._id;

    const result = await getPatientDirectoryService(
      filter,
      search,
      parseInt(page),
      parseInt(limit),
      doctorId
    );
    return res.status(200).json({
      success: true,
      message: "Patient directory retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSharedScansForReviewHandler = async (req, res, next) => {
  try {
    const doctorId = req.authUser._id;
    console.log("[DoctorScans] GET", req.originalUrl, {
      doctorId: doctorId.toString(),
      role: req.authUser.role,
    });
    const scans = await getSharedScansForReviewService(doctorId);

    console.log("[DoctorScans] response 200", {
      count: scans.length,
      url: req.originalUrl,
    });

    return res.status(200).json({
      success: true,
      message: "Shared scans retrieved successfully",
      data: scans,
    });
  } catch (error) {
    console.error("[DoctorScans] backend error", {
      url: req.originalUrl,
      message: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

/**
 * GET /api/v1/doctor/scans/:scanId
 * Get scan details for review
 */
export const getScanDetailsHandler = async (req, res, next) => {
  try {
    const { scanId } = req.params;
    console.log("[DoctorScanDetails] GET", req.originalUrl, {
      scanId,
      doctorId: req.authUser._id.toString(),
    });
    const scanDetails = await getScanDetailsService(scanId, req.authUser._id);
    return res.status(200).json({
      success: true,
      message: "Scan details retrieved successfully",
      data: scanDetails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/doctor/scans/:scanId/review
 * Submit doctor review for a scan
 */
export const submitScanReviewHandler = async (req, res, next) => {
  try {
    const doctorId = req.authUser._id;
    const { scanId } = req.params;
    const { notes, recommendations, severity, clinicalNotes, decision, messageToPatient, prescription, treatmentPlan } = req.body;

    if (decision && !["follow-up", "biopsy", "specialist"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Invalid decision. Must be 'follow-up', 'biopsy', or 'specialist'.",
      });
    }

    const finalSeverity =
      severity ||
      (decision === "biopsy" || decision === "specialist"
        ? "High"
        : decision === "follow-up"
        ? "Moderate"
        : null);

    if (!["Low", "Mild", "Moderate", "High"].includes(finalSeverity)) {
      return res.status(400).json({
        success: false,
        message: "Invalid severity. Must be Low, Mild, Moderate, or High.",
      });
    }

    const result = await submitScanReviewService(scanId, doctorId, {
      notes,
      recommendations,
      severity: finalSeverity,
      clinicalNotes,
      decision,
      messageToPatient,
      prescription,
      treatmentPlan,
    }, req);

    return res.status(200).json({
      success: true,
      message: "Scan review submitted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/doctor/upload-proof
 * Upload proof documents for doctor verification
 */
export const uploadProofHandler = async (req, res, next) => {
  try {
    const doctorId = req.authUser?._id;
    const email = req.body?.email;
    const files = req.files?.proof || [];

    console.log('📁 Upload proof called - doctorId:', doctorId, 'email:', email, 'files:', files.length);

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one proof document is required",
      });
    }

    const result = await uploadProofService(doctorId, files, email);

    return res.status(200).json({
      success: true,
      message: "Proof documents uploaded successfully",
      data: result,
    });
  } catch (error) {
    console.error('❌ Upload handler error:', error.message);
    next(error);
  }
};

/**
 * POST /api/v1/doctor/upload-verification-docs
 * Upload verification documents for doctor
 */
export const uploadVerificationDocsHandler = async (req, res, next) => {
  try {
    console.log('📁 Upload verification docs request');
    console.log('Headers Content-Type:', req.headers['content-type']);
    console.log('Body keys:', Object.keys(req.body || {}));
    console.log('Body email:', req.body?.email);
    console.log('Files count:', req.files?.length || 0);
    console.log('Files:', req.files?.map(f => ({ originalname: f.originalname, filename: f.filename })));

    const { email } = req.body;
    const files = req.files;

    if (!email) {
      console.log('❌ No email provided');
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!files || files.length === 0) {
      console.log('❌ No files provided');
      return res.status(400).json({
        success: false,
        message: "At least one document is required",
      });
    }

    console.log('✅ Validation passed, calling service');
    const result = await uploadVerificationDocsService(email, files);

    console.log('✅ Service completed successfully');
    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        uploadedFiles: result.uploadedFiles,
      },
    });
  } catch (error) {
    console.error('❌ Upload verification docs error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
    });
  }
};


export const getDoctorByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }
    const doctor = await getDoctorByIdService(id);
    return res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    console.log("Error in getDoctorByIdHandler:", error);
    next(error);
  }
};

export const createReviewHandler = async (req, res, next) => {
  try {
    if (req.authUser?.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can review doctors",
      });
    }

    const { doctorId } = req.params;
    const { stars, comment } = req.body;
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({
        success: false,
        message: "Stars must be between 1 and 5",
      });
    }
    const patientId = req.authUser._id;
    const result = await createReviewService(doctorId, patientId, {
      stars,
      comment,
    });

    return res.status(200).json({
      success: true,
      message: "Review added successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/v1/doctor/shared-scans/:patientId/latest
 * Resolve the latest scan for a patient who shared scans with this doctor
 */
export const getLatestSharedScanHandler = async (req, res, next) => {
  try {
    const doctorId = req.authUser._id;
    const { patientId } = req.params;

    const scanDetails = await getLatestSharedScanService(doctorId, patientId);

    return res.status(200).json({
      success: true,
      message: scanDetails
        ? "Latest shared scan retrieved successfully"
        : "No scan found for this patient",
      data: scanDetails,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode !== 500) {
      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const getDoctorReviewsHandler = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const reviews = await getDoctorReviewsService(doctorId);

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
