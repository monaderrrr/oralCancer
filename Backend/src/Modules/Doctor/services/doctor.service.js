import Scan from "../../../DB/models/scan.model.js";
import User from "../../../DB/models/users.model.js";
import Review from "../../../DB/models/review.model.js";
import Recommendation from "../../../DB/models/recommendation.model.js";
import SharedScanAccess from "../../../DB/models/shared-scan-access.model.js";
import { createNotification } from "../../Notifications/services/notification.service.js";
import CryptoJS from "crypto-js";
/**
 * Get dashboard overview stats for doctor
 * - totalPatients (assigned)
 * - newScansToday
 * - highRiskCases
 * - upcomingAppointmentsCount
 * - verificationStatus
 * - weeklyScans (bar chart)
 */
export const getDashboardOverviewService = async (doctorId) => {
  const doctor = await User.findById(doctorId).select("status");
  if (!doctor) throw new Error("Doctor not found");

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const newScansToday = await Scan.countDocuments({
    sharedWithDoctor: doctorId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const highRiskCases = await Scan.countDocuments({
    sharedWithDoctor: doctorId,
    riskLevel: "high",
  });

  const pendingScanReviewsCount = await Scan.countDocuments({
    $or: [{ sharedWithDoctor: doctorId }, { doctorId }],
    $or: [
      { "doctorReview.reviewedAt": { $exists: false } },
      { "doctorReview.reviewedAt": null },
    ],
  });

  const uniquePatients = await Scan.distinct("patientId", { sharedWithDoctor: doctorId });

  const upcomingAppointments = await Recommendation.countDocuments({
    status: "pending",
    doctorId,
  });

  return {
    stats: {
      totalPatients: uniquePatients.length,
      newScansToday,
      highRiskCases,
      pendingScanReviewsCount,
      upcomingAppointmentsCount: upcomingAppointments,
      verificationStatus: doctor.status,
    },
    charts: {
      weeklyScans: await getWeeklyScanVolumeService(doctorId),
      riskDistribution: await getRiskDistributionService(doctorId),
      patientGrowth: await getPatientGrowthService(doctorId),
    },
    recentActivity: await getActivityFeedService(5, doctorId),
  };
};

/**
 * Get weekly scan volume (last 7 days, grouped by day of week)
 */
export const getWeeklyScanVolumeService = async (doctorId) => {
  try {
    const today = new Date();

    const startDate = new Date();
    startDate.setDate(today.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const scans = await Scan.find({
      sharedWithDoctor: doctorId,
      createdAt: { $gte: startDate },
    }).lean();

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const formatDate = (date) => {
      return date.toLocaleDateString("en-CA"); // ✅ local date
    };

    // initialize last 7 days
    const weekData = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));

      weekData.push({
        day: daysOfWeek[d.getDay()],
        date: formatDate(d),
        scans: 0,
      });
    }

    // map for fast lookup
    const map = new Map(weekData.map((d) => [d.date, d]));

    // count scans
    scans.forEach((scan) => {
      const scanDate = formatDate(new Date(scan.createdAt));

      if (map.has(scanDate)) {
        map.get(scanDate).scans += 1;
      }
    });

    return weekData.map(({ day, scans }) => ({ day, scans }));

  } catch (error) {
    throw error;
  }
};

/**
 * Get risk distribution (percentages)
 */
export const getRiskDistributionService = async (doctorId) => {
  try {
    const totalScans = await Scan.countDocuments({ sharedWithDoctor: doctorId });
    if (totalScans === 0) {
      return { low: 0, medium: 0, high: 0 };
    }

    const distribution = await Scan.aggregate([
      {
        $match: {
          sharedWithDoctor: doctorId,
        }
      },
      {
        $group: {
          _id: "$riskLevel",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = { low: 0, medium: 0, high: 0 };
    distribution.forEach((item) => {
      if (item._id && result.hasOwnProperty(item._id)) {
        result[item._id] = Math.round((item.count / totalScans) * 100);
      }
    });

    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Get patient growth (cumulative count over last 6 months)
 */
export const getPatientGrowthService = async (doctorId) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const scans = await Scan.find({
      sharedWithDoctor: doctorId,
      createdAt: { $gte: sixMonthsAgo },
    }).lean();

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // ✅ initialize last 6 months
    const monthMap = {};
    const monthOrder = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = months[d.getMonth()];
      monthMap[key] = 0;
      monthOrder.push(key);
    }

    // count scans
    scans.forEach((scan) => {
      const key = months[new Date(scan.createdAt).getMonth()];
      if (monthMap[key] !== undefined) {
        monthMap[key]++;
      }
    });

    // cumulative
    let cumulative = 0;

    return monthOrder.map((m) => {
      cumulative += monthMap[m];
      return { month: m, patients: cumulative };
    });

  } catch (error) {
    throw error;
  }
};
/**
 * Get recent activity feed for doctor
 * Combines: scans, reviews, alerts
 */
export const getActivityFeedService = async (limit = 20, doctorId) => {
  try {
    const activities = [];

    // Get recent scans
    const recentScans = await Scan.find({ sharedWithDoctor: doctorId })
      .populate("patientId", "fullName")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    recentScans.forEach((scan) => {
      activities.push({
        id: `scan_${scan._id}`,
        type: "scan",
        message: `New scan submitted - Risk Level: ${scan.riskLevel.toUpperCase()}`,
        patientName: scan.patientId?.fullName || "Unknown Patient",
        createdAt: scan.createdAt,
        metadata: { scanId: scan._id, riskLevel: scan.riskLevel },
      });

      if (scan.lesionType || scan.userAnswers?.ulcer_3_weeks === "yes") {
        activities.push({
          id: `symptom_${scan._id}`,
          type: "symptom",
          message: `Symptom Reported: ${scan.lesionType || "Ulcer/Lesion"} detected at ${scan.userAnswers?.localization || "oral area"}`,
          patientName: scan.patientId?.fullName || "Unknown Patient",
          createdAt: scan.createdAt,
          metadata: {
            scanId: scan._id,
            lesionType: scan.lesionType,
            localization: scan.userAnswers?.localization
          },
        });
      }
    });

    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Get high-risk alerts (scans with high risk from last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const highRiskScans = await Scan.find({
      sharedWithDoctor: doctorId,
      riskLevel: "high",
      createdAt: { $gte: sevenDaysAgo },
    })
      .populate("patientId", "fullName")
      .sort({ createdAt: -1 })
      .lean();

    highRiskScans.forEach((scan) => {
      activities.push({
        id: `alert_${scan._id}`,
        type: "alert",
        message: `HIGH RISK CASE - ${scan.aiResult?.diagnosis || "Uncertain"}`,
        patientName: scan.patientId?.fullName || "Unknown Patient",
        createdAt: scan.createdAt,
        metadata: { scanId: scan._id, riskLevel: "high" },
      });
    });

    // Sort by newest first and limit
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return activities.slice(0, limit);
  } catch (error) {
    throw error;
  }
};

/**
 * Get patient directory for a specific doctor
 * Returns only patients who have shared scans with this doctor
 */
export const getPatientDirectoryService = async (
  filterType = "all",
  searchQuery = "",
  page = 1,
  limit = 10,
  doctorId
) => {
  try {
    const skip = (page - 1) * limit;

    // 1. Find all scans assigned to this specific doctor
    const sharedScans = await Scan.find({ sharedWithDoctor: doctorId }).lean();

    // 2. Extract unique patient IDs from those scans
    const patientIds = [...new Set(sharedScans.map(s => s.patientId?.toString()))];

    if (!patientIds.length) {
      return {
        patients: [],
        pagination: { total: 0, page, limit, pages: 0 },
      };
    }

    // 3. Build query to fetch user details for these patients
    const query = {
      _id: { $in: patientIds },
      role: "patient",
    };

    // 4. Add search functionality (Name or Email)
    if (searchQuery) {
      query.$or = [
        { fullName: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const patients = await User.find(query)
      .select("fullName age email phone profileImage")
      .skip(skip)
      .limit(limit)
      .lean();

    // 5. Enrich patient data with their latest scan info for this doctor
    const enrichedPatients = await Promise.all(
      patients.map(async (patient) => {
        const lastScan = await Scan.findOne({
          patientId: patient._id,
          sharedWithDoctor: doctorId,
        })
          .sort({ createdAt: -1 })
          .lean();

        return {
          patientId: patient._id,
          name: patient.fullName,
          age: patient.age,
          lastScanDate: lastScan?.createdAt || null,
          currentRiskLevel: lastScan?.riskLevel || "unknown",
          lesionType: lastScan?.lesionType || null,
          diagnosis: lastScan?.aiResult?.diagnosis || null,
          imageUrl: patient.profileImage || null,
          email: patient.email,
          phone: patient.phone,
          isSharedWithDoctor: true,
        };
      })
    );

    return {
      patients: enrichedPatients,
      pagination: {
        total: patientIds.length,
        page,
        limit,
        pages: Math.ceil(patientIds.length / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get scan details for review
 */
const normalizeUserAnswers = (answers) => {
  if (!answers) return {};
  if (Array.isArray(answers)) return Object.fromEntries(answers);
  if (answers instanceof Map) return Object.fromEntries(answers);
  if (typeof answers === "object") return answers;
  return {};
};

const normalizeReview = (review) => {
  if (!review) return null;
  const doctor = review.doctorId;

  return {
    doctorId: doctor?._id || doctor || null,
    doctorName: review.doctorName || doctor?.fullName || null,
    notes: review.notes || review.clinicalNotes || "",
    recommendations: review.recommendations || review.messageToPatient || review.treatmentPlan || "",
    severity: review.severity || null,
    reviewedAt: review.reviewedAt || null,
    clinicalNotes: review.clinicalNotes || "",
    decision: review.decision || null,
    messageToPatient: review.messageToPatient || "",
    prescription: review.prescription || "",
    treatmentPlan: review.treatmentPlan || "",
  };
};

const scanDetailsPayload = (scan) => {
  const userAnswers = normalizeUserAnswers(scan.userAnswers);
  const patient = scan.patientId;
  const reviewStatus = scan.doctorReview?.reviewedAt ? "reviewed" : "pending";

  return {
    scanId: scan._id,
    _id: scan._id,
    patientId: patient?._id || scan.patientId,
    patientName: patient?.fullName || "Unknown Patient",
    patientInfo: patient,
    images: scan.imageUrl ? [scan.imageUrl] : [],
    imageUrl: scan.imageUrl || null,
    aiResult: scan.aiResult || null,
    mouthImage: scan.mouthImage || null,
    diagnosis: scan.aiResult?.diagnosis || null,
    riskLevel: scan.riskLevel || "low",
    riskScore: scan.riskScore || 0,
    confidence:
      typeof scan.aiResult?.confidence === "number"
        ? Math.round(scan.aiResult.confidence * 10000) / 100
        : 0,
    lesionType: scan.lesionType || null,
    userAnswers,
    notes: scan.notes || null,
    patientNotes: scan.notes || null,
    aiRawResponse: scan.aiRawResponse || null,
    createdAt: scan.createdAt,
    submittedAt: scan.createdAt,
    scanType: scan.scanType || null,
    analysis: scan.aiResult?.analysis || null,
    recommendations: scan.aiResult?.recommendations || null,
    reviewStatus,
    doctorReview: normalizeReview(scan.doctorReview),
    reviewStatus: scan.reviewStatus || (scan.doctorReview?.reviewedAt ? "Reviewed" : "Pending Review"),
  };
};

export const getSharedScansForReviewService = async (doctorId) => {
  console.log("[DoctorScans] collection:", Scan.collection.name);
  console.log("[DoctorScans] query doctorId/sharedWithDoctor:", doctorId.toString());

  const scans = await Scan.find({
    $or: [
      { sharedWithDoctor: doctorId },
      { doctorId },
    ],
  })
    .populate("patientId", "fullName age email phone gender")
    .sort({ createdAt: -1 })
    .lean();

  console.log("[DoctorScans] found scans:", scans.length);

  return scans.map((scan) => scanDetailsPayload(scan));
};

export const getScanDetailsService = async (scanId, doctorId = null) => {
  try {
    const query = doctorId
      ? {
          _id: scanId,
          $or: [
            { sharedWithDoctor: doctorId },
            { doctorId },
          ],
        }
      : { _id: scanId };

    console.log("[DoctorScanDetails] collection:", Scan.collection.name);
    console.log("[DoctorScanDetails] query:", JSON.stringify(query));

    const scan = await Scan.findOne(query)
      .populate("patientId", "fullName age email phone gender")
      .populate("doctorReview.doctorId", "fullName specialization")
      .lean();

    if (!scan) throw new Error("Scan not found");

    return scanDetailsPayload(scan);
  } catch (error) {
    throw error;
  }
};

export const getLatestSharedScanService = async (doctorId, patientId) => {
  try {
    // Check if scan has been shared with this doctor
    const access = await SharedScanAccess.findOne({ doctorId, patientId }).lean();

    if (!access) {
      const error = new Error("This patient has not shared any scans with you");
      error.statusCode = 404;
      throw error;
    }

    // Get the latest scan
    const scan = await Scan.findOne({ patientId, sharedWithDoctor: doctorId })
      .populate("patientId", "fullName age email phone gender")
      .sort({ createdAt: -1 })
      .lean();

    if (!scan) {
      // Access exists but no scan found - patient may not have uploaded one yet
      return null;
    }

    return scanDetailsPayload(scan);
  } catch (error) {
    throw error;
  }
};

/**
 * Submit doctor review for a scan
 */
export const submitScanReviewService = async (
  scanId,
  doctorId,
  reviewData,
  req = null
) => {
  try {
    const {
      notes,
      recommendations,
      severity,
      clinicalNotes,
      decision,
      messageToPatient,
      prescription,
      treatmentPlan,
    } = reviewData;
    const doctor = await User.findById(doctorId).select("fullName specialization").lean();
    if (!doctor) throw new Error("Doctor not found");
    const reviewDate = new Date();

    const scan = await Scan.findOneAndUpdate(
      {
        _id: scanId,
        $or: [
          { sharedWithDoctor: doctorId },
          { doctorId },
        ],
      },
      {
        $set: {
          reviewStatus: "Reviewed",
          doctorReview: {
            doctorId,
            doctorName: doctor.fullName,
            notes: notes ?? clinicalNotes ?? "",
            recommendations: recommendations ?? messageToPatient ?? treatmentPlan ?? "",
            severity,
            clinicalNotes: clinicalNotes ?? notes ?? "",
            decision,
            messageToPatient: messageToPatient ?? recommendations ?? "",
            prescription,
            treatmentPlan: treatmentPlan ?? recommendations ?? "",
            reviewedAt: reviewDate,
          },
        },
      },
      { new: true }
    ).populate("doctorReview.doctorId", "fullName specialization");

    if (!scan) throw new Error("Scan not found");

    // Create notification for patient
    if (scan.patientId) {
      await createNotification({
        userId: scan.patientId,
        type: "doctor_review",
        title: "Doctor Review Available",
        message: "Your scan has been reviewed. Open the report to view the doctor's findings.",
        actionUrl: `/patient/reports/${scanId}`,
        targetId: scanId.toString(),
        targetRoute: "/patient/scans/:scanId",
        metadata: {
          scanId,
          doctorId,
          reviewType: "scan-review",
        },
        req,
      });
    }

    // If decision is follow-up or biopsy, create/update recommendation
    if (decision === "follow-up" || decision === "biopsy") {
      const recommendation = await Recommendation.findOneAndUpdate(
        { scanId },
        {
          $set: {
            patientId: scan.patientId,
            scanId,
            doctorId,
            status: "pending",
            recommendationType: decision === "biopsy" ? "specialist-visit" : "follow-up-scan",
            message: messageToPatient || `Doctor review: ${decision}`,
            priority: decision === "biopsy" ? "high" : "medium",
          },
        },
        { upsert: true, new: true }
      );
    }

    return { scan, success: true };
  } catch (error) {
    throw error;
  }
};
/**
 * submitScanReviewService
 */

export const updateDoctorRatingService = async (doctorId) => {
  const reviews = await Review.find({ doctorId });

  if (!reviews || reviews.length === 0) {
    await User.findByIdAndUpdate(doctorId, { rating: 0 });
    return;
  }

  const avg =
    reviews.reduce((sum, r) => sum + (r.stars || 0), 0) / reviews.length;

  await User.findByIdAndUpdate(doctorId, {
    rating: Number(avg.toFixed(1)),
  });
};

export const createReviewService = async (doctorId, patientId, data) => {
  const { stars, comment } = data;

  const existing = await Review.findOne({ doctorId, patientId });

  if (existing) {
    throw new Error("You already reviewed this doctor");
  }

  const review = await Review.create({
    doctorId,
    patientId,
    stars,
    comment: comment?.trim() || "",
  });

  const reviews = await Review.find({ doctorId });

  const avg =
    reviews.reduce((sum, r) => sum + (r.stars || 0), 0) / reviews.length;

  await User.findByIdAndUpdate(doctorId, {
    rating: Number(avg.toFixed(1)),
  });

  await review.populate("patientId", "fullName");

  return {
    rating: Number(avg.toFixed(1)),
    review: {
      ...review.toObject(),
      verifiedPatient: true,
    },
  };
};

export const getDoctorReviewsService = async (doctorId) => {
  const reviews = await Review.find({ doctorId })
    .populate("patientId", "fullName")
    .sort({ createdAt: -1 })
    .lean();

  return reviews.map((review) => ({
    ...review,
    verifiedPatient: true,
    patient: {
      fullName: review.patientId?.fullName || "Patient",
    },
  }));
};
/**
 * Upload proof documents for doctor verification
 */
export const uploadProofService = async (doctorId, files, email) => {
  try {
    let doctor;

    // If doctorId is provided (from auth), use it; otherwise use email
    if (doctorId) {
      doctor = await User.findById(doctorId);
    } else if (email) {
      console.log('🔍 Looking up doctor by email:', email);
      doctor = await User.findOne({ email: email.trim().toLowerCase() });
    }

    if (!doctor) throw new Error("Doctor not found");
    if (doctor.role !== "doctor") throw new Error("Only doctors can upload proof documents");

    console.log('✅ Found doctor:', doctor.email);

    const proofUploads = files.map(file => ({
      filename: file.originalname,
      mimeType: file.mimetype,
      path: file.path,
      uploadedAt: new Date(),
    }));

    // Update doctor's licenseUploads with proof documents
    await User.findByIdAndUpdate(doctor._id, {
      $set: { licenseUploads: proofUploads }
    });

    console.log('✅ Uploaded', proofUploads.length, 'files for doctor:', doctor.email);

    return {
      uploadedFiles: proofUploads.length,
      files: proofUploads.map(f => f.filename),
    };
  } catch (error) {
    console.error('❌ Upload proof error:', error.message);
    throw error;
  }
};

/**
 * Upload verification documents for doctor
 */
export const uploadVerificationDocsService = async (email, files) => {
  try {
    const doctor = await User.findOne({ email: email.trim().toLowerCase() });
    if (!doctor) throw new Error("Doctor not found");
    if (doctor.role !== "doctor") throw new Error("User is not a doctor");
    if (!doctor.isEmailVerified) throw new Error("Email not verified");
    if (doctor.status !== "pending") throw new Error("Verification already submitted or completed");

    const uploadedFiles = files.map(file => `/uploads/${file.filename}`);

    // For simplicity, assume first file is profileImage, second is medicalProof
    doctor.profileImage = uploadedFiles[0] || null;
    doctor.medicalProof = uploadedFiles[1] || null;

    await doctor.save();

    return {
      message: "Verification documents uploaded successfully. Awaiting admin approval.",
      uploadedFiles,
    };
  } catch (error) {
    throw error;
  }
};
export const getAllDoctorsService = async (filters = {}) => {
  try {
    const query = {
      role: "doctor",
      status: "approved"
    };

    if (filters.city) {
      query.$or = [
        { clinicAddress: { $regex: filters.city, $options: "i" } },
        { hospital: { $regex: filters.city, $options: "i" } },
      ];
    }

    const doctors = await User.find({
      ...query
    })
      .select("fullName email profileImage specialization hospital clinicAddress googleMapsUrl lat lng phone rating createdAt")
      .sort({ createdAt: -1 });

    return doctors;
  } catch (error) {
    throw error;
  }
};

export const getDoctorByIdService = async (id) => {
  const doctor = await User.findById(id).select(
    "fullName email profileImage specialization hospital clinicAddress googleMapsUrl lat lng phone rating workingDays role bio yearsOfExperience consultationFee createdAt status"
  );

  if (!doctor || doctor.role !== "doctor" || doctor.status !== "approved") {
    throw new Error("Doctor not found");
  }

  // decrypt phone
  if (doctor.phone) {
    try {
      const secretKey = process.env.ENCRYPTED_KEY;

      if (secretKey) {
        const bytes = CryptoJS.AES.decrypt(doctor.phone, secretKey);
        const decryptedPhone = bytes.toString(CryptoJS.enc.Utf8);

        if (decryptedPhone) doctor.phone = decryptedPhone;
      }
    } catch (e) {
      console.error("Decryption Error:", e.message);
    }
  }

  return doctor;
};
