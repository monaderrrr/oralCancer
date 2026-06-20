import { getAllDoctorsService } from "../Doctor/services/doctor.service.js";
import Scan from "../../DB/models/scan.model.js";
import {
  createScanService,
  getScanHistoryService,
  getPatientScanDetailsService,
  getRecommendationsService,
  getActivityTimelineService,
  getDashboardOverviewService,
  shareScanService,
} from "./services/dashboard.service.js";

// ==================== SCAN HANDLERS ====================
/**
 * POST /api/v1/patient/scans
 * Create a new scan with file upload or image URL
 */
export const createScanHandler = async (req, res, next) => {
  try {
    const patientId = req.authUser._id;
    const { userAnswers, doctorId } = req.body;

    // Multer fields return req.files
    const imageFile = req.files?.image?.[0]; // <-- use `image` field
    const imageUrl = req.body.imageUrl;

    // Validate that either file or URL is provided
    if (!imageFile && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image file or URL is required",
      });
    }

    // Build user answers: accept JSON string or direct form fields as fallback
    let parsedUserAnswers = {};
    try {
      parsedUserAnswers = userAnswers ? JSON.parse(userAnswers) : {};
    } catch (_) {
      parsedUserAnswers = {};
    }

    if (!userAnswers || Object.keys(parsedUserAnswers).length === 0) {
      const {
        localization,
        tobacco,
        alcohol,
        sun,
        gender,
        age,
        ulcer_3_weeks,
        ulcer_spreading,
      } = req.body || {};

      parsedUserAnswers = {
        ...(localization ? { localization } : {}),
        ...(tobacco ? { tobacco } : {}),
        ...(alcohol ? { alcohol } : {}),
        ...(sun ? { sun } : {}),
        ...(gender ? { gender } : {}),
        ...(age ? { age } : {}),
        ...(ulcer_3_weeks ? { ulcer_3_weeks } : {}),
        ...(ulcer_spreading ? { ulcer_spreading } : {}),
      };
    }

    // Call service with imageFile or imageUrl
    const result = await createScanService(patientId, {
  imageFile,
  imageUrl,
  userAnswers: parsedUserAnswers,
  doctorId,
});

    const { scan, recommendationCreated, fastApiResponse } = result;

    // Return response suitable for frontend
    return res.status(201).json({
  success: true,
  message: "Scan created successfully",
  data: {
    ...fastApiResponse,
    scanId: scan._id,
    riskLevel: scan.riskLevel,
    recommendationCreated: !!recommendationCreated,
    date: scan.createdAt || new Date(),

    findings: fastApiResponse?.findings || scan.findings || [],
    doctors: fastApiResponse?.doctors || scan.doctors || [],
    hospitals: fastApiResponse?.hospitals || scan.hospitals || [],
  },
});

  } catch (error) {
    next(error);
  }
};


/**
 * GET /api/v1/scans/history
 * Get scan history
 */
export const getScanHistoryHandler = async (req, res, next) => {
  try {
    const patientId = req.authUser._id;
    const { page = 1, limit = 10 } = req.query;

    const result = await getScanHistoryService(
      patientId,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      message: "Scan history retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientScanDetailsHandler = async (req, res, next) => {
  try {
    const patientId = req.authUser._id;
    const { scanId } = req.params;

    const result = await getPatientScanDetailsService(patientId, scanId);

    return res.status(200).json({
      success: true,
      message: "Scan details retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/scans/latest
 * Get latest scan summary
 */
// NOTE: getLatestScanHandler removed — not part of allowed API surface

// ==================== RECOMMENDATION HANDLERS ====================

/**
 * GET /api/v1/recommendations
 * Get all recommendations (pending and completed)
 */
export const getRecommendationsHandler = async (req, res, next) => {
  try {
    const patientId = req.authUser._id;

    const result = await getRecommendationsService(patientId);

    return res.status(200).json({
      success: true,
      message: "Recommendations retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/recommendations/pending/count
 * Get pending recommendations count
 */
// NOTE: pending count handler removed — not part of allowed API surface

// ==================== ACTIVITY TIMELINE HANDLER ====================

/**
 * GET /api/v1/patient/activity
 * Get unified activity timeline
 */
export const getActivityTimelineHandler = async (req, res, next) => {
  try {
    const patientId = req.authUser._id;
    const { limit = 20 } = req.query;

    const activities = await getActivityTimelineService(patientId, parseInt(limit));

    return res.status(200).json({
      success: true,
      message: "Activity timeline retrieved successfully",
      data: {
        activities,
        count: activities.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== DASHBOARD OVERVIEW HANDLER ====================

/**
 * GET /api/v1/patient/dashboard
 * Get complete dashboard overview
 */
export const getDashboardOverviewHandler = async (req, res, next) => {
  try {
    const patientId = req.authUser._id;

    const dashboard = await getDashboardOverviewService(patientId);

    return res.status(200).json({
      success: true,
      message: "Dashboard overview retrieved successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllDoctorsHandler = async (req, res, next) => {
  try {
    const doctors = await getAllDoctorsService({ city: req.query.city });
    return res.status(200).json({
      success: true,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/patient/scans/share
 * Share the latest scan with a specific doctor
 */
export const shareScanHandler = async (req, res, next) => {
  try {
    const patientId = req.authUser._id;
    const { doctorId, scanId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "doctorId is required",
      });
    }

    const sharedScan = await shareScanService(patientId, doctorId, scanId, req);

    return res.status(200).json({
      success: true,
      message: "Scan shared successfully",
      data: sharedScan,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * POST /api/v1/ai/health-insights
 * Accepts { scans: [{ date, riskScore }] } or uses patient's scans if absent
 */
// NOTE: health insights endpoint removed — not part of allowed API surface
