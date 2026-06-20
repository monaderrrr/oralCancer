import Scan from "../../../DB/models/scan.model.js";
import Recommendation from "../../../DB/models/recommendation.model.js";
import Message from "../../../DB/models/message.model.js";
import User from "../../../DB/models/users.model.js";
import Conversation from "../../../DB/models/conversation.model.js";
import { createNotification } from "../../Notifications/services/notification.service.js";
import SharedScanAccess from "../../../DB/models/shared-scan-access.model.js";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const FASTAPI_SERVICE_URL = process.env.FASTAPI_SERVICE_URL || "http://localhost:8000";

// Helper: call FastAPI /predict with multipart/form-data
const callFastAPIPredictService = async (imageFile, userAnswers) => {
  try {
    const formData = new FormData();

    if (typeof imageFile === "string") {
      const response = await axios.get(imageFile, { responseType: "stream" });
      formData.append("file", response.data, "scan-image.jpg");
    } else {
      formData.append("file", fs.createReadStream(imageFile.path));
    }

    formData.append("localization", userAnswers?.localization || "tongue");
    formData.append("tobacco", userAnswers?.tobacco || "no");
    formData.append("alcohol", userAnswers?.alcohol || "no");
    formData.append("sun", userAnswers?.sun || "no");
    formData.append("gender", userAnswers?.gender || "male");
    formData.append("age", userAnswers?.age || "between_41_and_60_years");
    formData.append("ulcer_3_weeks", userAnswers?.ulcer_3_weeks || "no");
    formData.append("ulcer_spreading", userAnswers?.ulcer_spreading || "no");

    const response = await axios.post(`${FASTAPI_SERVICE_URL}/predict`, formData, {
      headers: formData.getHeaders(),
      timeout: 30000,
    });
console.log("FastAPI raw response:", response.data);
    const fastApiResult = response.data || {};

    // Handle new response structure with status field (be tolerant to case)
    const statusRaw = fastApiResult.status || "SUCCESS";
    const status = typeof statusRaw === "string" ? statusRaw.toUpperCase() : "SUCCESS";
    const diagnosis = fastApiResult.diagnosis ?? null; // keep original for outward response
    const lesionType = fastApiResult.lesion_type ?? null;
    const confidencePercent = typeof fastApiResult.confidence === "number" ? fastApiResult.confidence : 0;
    const explanation = fastApiResult.explanation ?? null;
    const confidenceDecimal = confidencePercent / 100;

    // Map new response structure to internal format
    let mappedDiagnosis = "Uncertain";
    let cancerProbability = 0.5;
    let nonCancerProbability = 0.5;

    const normalizedDiagnosis = typeof diagnosis === "string" ? diagnosis.toLowerCase() : null;

    if (status === "UNCERTAIN") {
      // Uncertain cases: diagnosis is null
      mappedDiagnosis = "Uncertain";
      cancerProbability = 0.5;
      nonCancerProbability = 0.5;
    } else if (status === "SUCCESS") {
      if (normalizedDiagnosis === "cancer") {
        mappedDiagnosis = "Cancer (OSCC)";
        cancerProbability = confidenceDecimal;
        nonCancerProbability = 1 - cancerProbability;
      } else if (normalizedDiagnosis === "pre-cancer" || normalizedDiagnosis === "precancer" || normalizedDiagnosis === "pre_cancer") {
        mappedDiagnosis = "Pre-Cancer";
        cancerProbability = confidenceDecimal;
        nonCancerProbability = 1 - cancerProbability;
      } else if (normalizedDiagnosis === "non-cancer" || normalizedDiagnosis === "noncancer" || normalizedDiagnosis === "non_cancer") {
        mappedDiagnosis = "Non-Cancer";
        cancerProbability = 1 - confidenceDecimal;
        nonCancerProbability = confidenceDecimal;
      } else {
        // Fallback for unexpected diagnosis values
        mappedDiagnosis = "Uncertain";
        cancerProbability = 0.5;
        nonCancerProbability = 0.5;
      }
    }

    return {
      // Return exact FastAPI response structure
      status: status,
      diagnosis: diagnosis, // Keep original diagnosis from FastAPI (not mapped)
      lesion_type: lesionType,
      confidence: confidencePercent, // Keep as percentage (0-100)
      explanation: explanation,
      // Internal fields for database storage
      mappedDiagnosis: mappedDiagnosis,
      cancerProbability: Math.round(cancerProbability * 100) / 100,
      nonCancerProbability: Math.round(nonCancerProbability * 100) / 100,
      confidenceDecimal: confidenceDecimal,
      rawFastApiResponse: fastApiResult,
    };
  } catch (error) {
    console.error("FastAPI Service Error:", error?.message || error);
    return {
      // Return error response in FastAPI format
      status: "UNCERTAIN",
      diagnosis: null,
      lesion_type: null,
      confidence: 0,
      explanation: "Error communicating with AI service.",
      // Internal fields
      mappedDiagnosis: "Uncertain",
      cancerProbability: 0.5,
      nonCancerProbability: 0.5,
      confidenceDecimal: 0.5,
      error: error?.message || String(error),
    };
  }
};

// Allowed services: createScanService, getScanHistoryService, getRecommendationsService,
// getActivityTimelineService, getDashboardOverviewService

export const createScanService = async (patientId, scanData, req = null) => {
  try {
    const { imageFile, imageUrl, userAnswers } = scanData;

    if (!imageFile && !imageUrl) throw new Error("Image file or URL is required");

    const imageInput = imageFile || imageUrl;
    const aiResult = await callFastAPIPredictService(imageInput, userAnswers || {});

    let riskLevel = "low";
    if (aiResult.mappedDiagnosis === "Cancer (OSCC)") riskLevel = "high";
    else if (aiResult.mappedDiagnosis === "Pre-Cancer" || aiResult.mappedDiagnosis === "Uncertain") riskLevel = "medium";
    else if (aiResult.mappedDiagnosis === "Non-Cancer") riskLevel = "low";

    // Build notes field with explanation and lesion type if available
    let notes = [];
    if (aiResult.explanation) {
      notes.push(aiResult.explanation);
    }
    if (aiResult.lesion_type) {
      notes.push(`Lesion Type: ${aiResult.lesion_type}`);
    }
    const notesString = notes.length > 0 ? notes.join(". ") : null;

    const scan = new Scan({
      patientId,
      riskLevel,
      reviewStatus: "Pending Review",
      doctorId: scanData.doctorId || null,
      scanType: "routine",
      imageUrl: imageFile
  ? `/uploads/${imageFile.filename}`
  : imageUrl,
      aiResult: {
        diagnosis: aiResult.mappedDiagnosis, // Use mapped diagnosis for internal storage
        cancerProbability: aiResult.cancerProbability,
        nonCancerProbability: aiResult.nonCancerProbability,
        confidence: aiResult.confidenceDecimal, // Store as decimal (0-1)
      },
      lesionType: aiResult.lesion_type || null,
      aiRawResponse: aiResult.rawFastApiResponse || null,
      riskScore: typeof aiResult.confidence === "number" ? aiResult.confidence : null, // Store as percentage
      userAnswers: userAnswers || {},
      notes: notesString,
    });

    await scan.save();

    if (scanData.doctorId) {
      const patient = await User.findById(patientId).select("fullName").lean();
      await createNotification({
        userId: scanData.doctorId,
        type: "scan_review",
        title: `New scan submitted by ${patient?.fullName || "a patient"}`,
        message: `A patient is waiting for your review. Open the scan to provide feedback.`,
        actionUrl: `/doctor/scans/${scan._id}`,
        targetId: scan._id.toString(),
        targetRoute: "/doctor/scans/:scanId",
        metadata: { scanId: scan._id, patientId, latest: true },
        req,
      });
    }

    let recommendationCreated = false;
    if (riskLevel === "high") {
      const recommendation = new Recommendation({
        patientId,
        scanId: scan._id,
        status: "pending",
        recommendationType: "specialist-visit",
        message: `URGENT: Your scan shows ${aiResult.mappedDiagnosis} (confidence: ${aiResult.confidence}%). Please consult a specialist.`,
        priority: "high",
      });
      await recommendation.save();
      recommendationCreated = true;
    } else if (riskLevel === "medium") {
      const recommendation = new Recommendation({
        patientId,
        scanId: scan._id,
        status: "pending",
        recommendationType: "follow-up-scan",
        message: `Your scan shows ${aiResult.mappedDiagnosis} (confidence: ${aiResult.confidence}%). A follow-up scan is recommended.`,
        priority: "medium",
      });
      await recommendation.save();
      recommendationCreated = true;
    }

    // Build exact FastAPI response (only include explanation if it exists in raw response)
    const fastApiResponse = {
      status: aiResult.status,
      diagnosis: aiResult.diagnosis,
      lesion_type: aiResult.lesion_type,
      confidence: aiResult.confidence,
    };
    
    // Only include explanation if it exists in the FastAPI response
    if (aiResult.rawFastApiResponse?.explanation !== undefined) {
      fastApiResponse.explanation = aiResult.rawFastApiResponse.explanation;
    }

    return { 
      scan, 
      recommendationCreated,
      fastApiResponse,
    };
  } catch (error) {
    throw error;
  }
};

export const getScanHistoryService = async (patientId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const scansRaw = await Scan.find({ patientId })
      .sort({ createdAt: -1 })
      .lean();

    const totalScans = scansRaw.length;

    // =========================
    // CALCULATIONS
    // =========================

    let totalRisk = 0;
    let totalConfidence = 0;
    let lowRiskScans = 0;

    scansRaw.forEach((scan) => {
      const riskScore =
        typeof scan.riskScore === "number"
          ? scan.riskScore
          : scan.aiResult?.confidence
          ? Math.round(scan.aiResult.confidence * 100)
          : 0;

      const confidence =
        typeof scan.aiResult?.confidence === "number"
          ? Math.round(scan.aiResult.confidence * 100)
          : 0;

      totalRisk += riskScore;
      totalConfidence += confidence;

      if (scan.riskLevel === "low") lowRiskScans++;
    });

    const avgRiskScore =
      totalScans > 0 ? Math.round(totalRisk / totalScans) : 0;

    const avgConfidence =
      totalScans > 0 ? Math.round(totalConfidence / totalScans) : 0;

    // =========================
    // RISK TREND (Last 6 Months)
    // =========================

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const riskTrend = scansRaw
      .filter((scan) => new Date(scan.createdAt) >= sixMonthsAgo)
      .map((scan) => ({
        date: scan.createdAt,
        riskScore:
          typeof scan.riskScore === "number"
            ? scan.riskScore
            : scan.aiResult?.confidence
            ? Math.round(scan.aiResult.confidence * 100)
            : 0,
      }))
      .reverse(); // oldest → newest

    // =========================
    // PAGINATED SCANS LIST
    // =========================

    const paginatedScans = scansRaw
      .slice(skip, skip + limit)
      .map((scan) => ({
        scanId: scan._id,
        riskLevel: scan.riskLevel,
        reviewStatus: scan.reviewStatus || (scan.doctorReview?.reviewedAt ? "Reviewed" : "Pending Review"),
        doctorReview: normalizeDoctorReview(scan.doctorReview),
        diagnosis: scan.aiResult?.diagnosis,
        lesionType: scan.lesionType || null,
        riskScore:
          typeof scan.riskScore === "number"
            ? scan.riskScore
            : scan.aiResult?.confidence
            ? Math.round(scan.aiResult.confidence * 100)
            : 0,
        confidence:
          typeof scan.aiResult?.confidence === "number"
            ? Math.round(scan.aiResult.confidence * 100)
            : 0,
        createdAt: scan.createdAt,
      }));

    // =========================
    // HEALTH INSIGHTS
    // =========================

    let insightMessage = "";
    let recommendationMessage = "";

    if (avgRiskScore < 20) {
      insightMessage =
        "Your risk scores have been consistently low over the past 6 months. This is excellent!";
      recommendationMessage =
        "Schedule your next screening in 6 months to maintain continuous monitoring.";
    } else if (avgRiskScore < 50) {
      insightMessage =
        "Your risk levels are moderate. Regular monitoring is recommended.";
      recommendationMessage =
        "Consider a follow-up scan within the next 3 months.";
    } else {
      insightMessage =
        "Your recent scans indicate elevated risk levels.";
      recommendationMessage =
        "Please consult a specialist as soon as possible.";
    }

    return {
      summary: {
        totalScans,
        avgRiskScore,
        lowRiskScans,
        avgConfidence,
      },
      riskTrend,
      scans: paginatedScans,
      healthInsights: {
        message: insightMessage,
        recommendation: recommendationMessage,
      },
      pagination: {
        total: totalScans,
        page,
        limit,
        pages: Math.ceil(totalScans / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

const normalizeUserAnswers = (answers) => {
  if (!answers) return {};
  if (Array.isArray(answers)) return Object.fromEntries(answers);
  if (answers instanceof Map) return Object.fromEntries(answers);
  if (typeof answers === "object") return answers;
  return {};
};

const normalizeDoctorReview = (review) => {
  if (!review) return null;
  const doctor = review.doctorId;

  return {
    doctorId: doctor?._id || doctor || null,
    doctorName: review.doctorName || doctor?.fullName || null,
    notes: review.notes || review.clinicalNotes || "",
    recommendations: review.recommendations || review.messageToPatient || review.treatmentPlan || "",
    severity: review.severity || null,
    reviewedAt: review.reviewedAt || null,
  };
};

export const getPatientScanDetailsService = async (patientId, scanId) => {
  const scan = await Scan.findOne({ _id: scanId, patientId })
    .populate("doctorReview.doctorId", "fullName specialization")
    .lean();

  if (!scan) throw new Error("Scan not found");

  return {
    scanId: scan._id,
    _id: scan._id,
    imageUrl: scan.imageUrl || null,
    images: scan.imageUrl ? [scan.imageUrl] : [],
    riskLevel: scan.riskLevel || "low",
    reviewStatus: scan.reviewStatus || (scan.doctorReview?.reviewedAt ? "Reviewed" : "Pending Review"),
    riskScore:
      typeof scan.riskScore === "number"
        ? scan.riskScore
        : scan.aiResult?.confidence
        ? Math.round(scan.aiResult.confidence * 100)
        : 0,
    confidence:
      typeof scan.aiResult?.confidence === "number"
        ? Math.round(scan.aiResult.confidence * 10000) / 100
        : 0,
    diagnosis: scan.aiResult?.diagnosis || null,
    lesionType: scan.lesionType || null,
    aiResult: scan.aiResult || null,
    aiRawResponse: scan.aiRawResponse || null,
    userAnswers: normalizeUserAnswers(scan.userAnswers),
    notes: scan.notes || null,
    patientNotes: scan.notes || null,
    doctorReview: normalizeDoctorReview(scan.doctorReview),
    createdAt: scan.createdAt,
    scanType: scan.scanType || null,
  };
};

export const getRecommendationsService = async (patientId) => {
  try {
    const recommendations = await Recommendation.find({ patientId }).populate("scanId", "riskLevel createdAt scanType aiResult").sort({ createdAt: -1 }).lean();
    const pending = recommendations.filter((r) => r.status === "pending");
    const completed = recommendations.filter((r) => r.status === "completed");
    return { pending, completed, total: recommendations.length };
  } catch (error) {
    throw error;
  }
};

export const getActivityTimelineService = async (patientId, limit = 20) => {
  try {
    const activities = [];

    // ================= SCANS =================
    const scans = await Scan.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const sharedScans = await Scan.find({
      patientId,
      sharedWithDoctor: { $ne: null },
    })
      .sort({ sharedAt: -1 })
      .limit(limit)
      .lean();

    // Shared scans activity
    sharedScans.forEach((scan) => {
      activities.push({
        id: `shared_${scan._id}`,
        type: "SCAN_SHARED",
        title: "Scan Shared With Doctor",
        description: "You shared a scan with a doctor",
        status: "completed",
        timestamp: scan.sharedAt,
        metadata: {
          scanId: scan._id,
          doctorId: scan.sharedWithDoctor,
        },
      });
    });

    // Scan completed activity
    scans.forEach((scan) => {
      activities.push({
        id: `scan_${scan._id}`,
        type: "AI_ORAL_SCAN_COMPLETED",
        title: "AI Oral Scan Completed",
        description: `Risk Level: ${scan.riskLevel?.toUpperCase() || "UNKNOWN"}`,
        status: "completed",
        timestamp: scan.createdAt,
        metadata: {
          scanId: scan._id,
          riskLevel: scan.riskLevel || "unknown",
          diagnosis: scan.aiResult?.diagnosis || "Unknown",
          lesionType: scan.lesionType || "Unknown",
        },
      });
    });

    // ================= RECOMMENDATIONS =================
    const recommendations = await Recommendation.find({
      patientId,
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 2))
      .lean();

    recommendations.forEach((rec) => {
      activities.push({
        id: `recommendation_${rec._id}`,
        type: "RECOMMENDATION_PENDING",
        title: "Recommendation",
        description: rec.message,
        status: "pending",
        timestamp: rec.createdAt,
        metadata: {
          recommendationId: rec._id,
          scanId: rec.scanId,
        },
      });
    });

    // ================= DOCTOR MESSAGES =================
    const conversations = await Conversation.find({
      participants: patientId,
    })
      .select("_id")
      .lean();

    const conversationIds = conversations.map((c) => c._id);

    let doctorMessages = [];

    if (conversationIds.length > 0) {
      doctorMessages = await Message.find({
        conversationId: { $in: conversationIds },
      })
        .populate("senderId", "fullName role")
        .sort({ createdAt: -1 })
        .limit(Math.floor(limit / 2))
        .lean();
    }

    doctorMessages.forEach((msg) => {
      if (msg.senderId?.role === "doctor") {
        activities.push({
          id: `message_${msg._id}`,
          type: "DOCTOR_MESSAGE",
          title: "Doctor Message",
          description: msg.text,
          status: msg.isRead ? "read" : "unread",
          timestamp: msg.createdAt,
          metadata: {
            messageId: msg._id,
            doctorName: msg.senderId.fullName,
            isRead: msg.isRead,
          },
        });
      }
    });

    activities.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    return activities.slice(0, limit);
  } catch (error) {
    throw error;
  }
};

export const getDashboardOverviewService = async (patientId) => {
  try {
    const patient = await User.findById(patientId).select("fullName email phone gender age dateOfBirth");
    if (!patient) throw new Error("Patient not found");

    const totalScans = await Scan.countDocuments({ patientId });
    const pendingRecommendations = await Recommendation.countDocuments({ patientId, status: "pending" });

    const latestScanRaw = await Scan.findOne({ patientId }).sort({ createdAt: -1 }).select("riskLevel createdAt scanType aiResult lesionType riskScore").lean();

    const latestScan = latestScanRaw
      ? {
          scanId: latestScanRaw._id,
          riskLevel: latestScanRaw.riskLevel,
          riskScore: latestScanRaw.riskScore,
          confidence: typeof latestScanRaw.aiResult?.confidence === "number" ? Math.round(latestScanRaw.aiResult.confidence * 10000) / 100 : null,
          diagnosis: latestScanRaw.aiResult?.diagnosis,
          lesionType: latestScanRaw.lesionType || null,
          createdAt: latestScanRaw.createdAt,
        }
      : null;

    const recentActivity = await getActivityTimelineService(patientId, 5);

    return {
      profile: {
        fullName: patient.fullName,
        email: patient.email,
        phone: patient.phone,
        gender: patient.gender,
        age: patient.age,
        dateOfBirth: patient.dateOfBirth,
      },
      summary: {
        totalScans,
        pendingRecommendations,
        latestScan,
      },
      recentActivity,
    };
  } catch (error) {
    throw error;
  }
};

export const shareScanService = async (patientId, doctorId, scanId, req = null) => {
  const scanQuery = scanId
    ? { _id: scanId, patientId }
    : { patientId };

  const scan = await Scan.findOne(scanQuery).sort({ createdAt: -1 });

  if (!scan) throw new Error("Scan not found");

  await SharedScanAccess.findOneAndUpdate(
    { patientId, doctorId },
    { $set: { sharedAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  scan.sharedWithDoctor = doctorId;
  scan.sharedAt = new Date();

  await scan.save();

  const patient = await User.findById(patientId).select("fullName").lean();

  await createNotification({
    userId: doctorId,
    type: "scan_review",
    title: `New scan submitted by ${patient?.fullName || "a patient"}`,
    message: `A patient is waiting for your review. Open the scan to provide medical feedback.`,
    actionUrl: `/doctor/scans/${scan._id}`,
    targetId: scan._id.toString(),
    targetRoute: "/doctor/scans/:scanId",
    metadata: { scanId: scan._id, patientId, latest: true },
    req,
  });

  return scan;
};

