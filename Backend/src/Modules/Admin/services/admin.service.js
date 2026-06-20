import User from "../../../DB/models/users.model.js";
import { createNotification } from "../../Notifications/services/notification.service.js";

/**
 * Get all doctors with pending approval status
 */
export const getPendingDoctorsService = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const doctors = await User.find({ role: "doctor", status: "pending" })
      .select("-password -otp -__v")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const totalDoctors = await User.countDocuments({ role: "doctor", status: "pending" });

    return res.status(200).json({
      success: true,
      message: "Pending doctors retrieved successfully",
      data: {
        doctors,
        pagination: {
          total: totalDoctors,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalDoctors / limit),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching pending doctors",
      error: error.message,
    });
  }
};

/**
 * Get all doctors (all statuses)
 */
export const getAllDoctorsService = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const status = req.query.status; // Filter by status: pending, approved, rejected
    const skip = (page - 1) * limit;

    const filter = { role: "doctor" };
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const doctors = await User.find(filter)
      .select("-password -otp -__v")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const totalDoctors = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "Doctors retrieved successfully",
      data: {
        doctors,
        pagination: {
          total: totalDoctors,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalDoctors / limit),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching doctors",
      error: error.message,
    });
  }
};

/**
 * Get specific doctor details with license uploads
 */
export const getDoctorDetailsService = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await User.findById(doctorId).select("-password -otp -__v");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (doctor.role !== "doctor") {
      return res.status(400).json({
        success: false,
        message: "User is not a doctor",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor details retrieved successfully",
      data: { doctor },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching doctor details",
      error: error.message,
    });
  }
};

/**
 * Approve a doctor account
 */
export const approveDoctorService = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { notes } = req.body; // Optional notes from admin

    const doctor = await User.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (doctor.role !== "doctor") {
      return res.status(400).json({
        success: false,
        message: "User is not a doctor",
      });
    }

    if (doctor.status === "approved") {
      return res.status(409).json({
        success: false,
        message: "Doctor is already approved",
      });
    }

    // Update doctor status to approved
    doctor.status = "approved";
    await doctor.save();

    await createNotification({
      userId: doctor._id,
      type: "doctor_approved",
      title: "Your doctor account is approved",
      message: "Admin approved your profile. You can now receive patient messages and manage consultations.",
      actionUrl: "/doctor/dashboard",
      targetId: doctor._id.toString(),
      targetRoute: "/doctor/dashboard",
      req,
    });

    // TODO: Send email notification to doctor
    console.log(`Doctor ${doctorId} approved by admin. Notes: ${notes || "None"}`);

    return res.status(200).json({
      success: true,
      message: "Doctor approved successfully",
      data: {
        doctor: {
          _id: doctor._id,
          email: doctor.email,
          fullName: doctor.fullName,
          status: doctor.status,
          role: doctor.role,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error approving doctor",
      error: error.message,
    });
  }
};

/**
 * Reject a doctor account
 */
export const rejectDoctorService = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { reason } = req.body; // Reason for rejection (required)

    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const doctor = await User.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (doctor.role !== "doctor") {
      return res.status(400).json({
        success: false,
        message: "User is not a doctor",
      });
    }

    if (doctor.status === "rejected") {
      return res.status(409).json({
        success: false,
        message: "Doctor is already rejected",
      });
    }

    // Update doctor status to rejected
    doctor.status = "rejected";
    doctor.rejectionReason = reason;
    await doctor.save();

    // TODO: Send email notification to doctor with rejection reason
    console.log(`Doctor ${doctorId} rejected by admin. Reason: ${reason}`);

    return res.status(200).json({
      success: true,
      message: "Doctor rejected successfully",
      data: {
        doctor: {
          _id: doctor._id,
          email: doctor.email,
          fullName: doctor.fullName,
          status: doctor.status,
          role: doctor.role,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error rejecting doctor",
      error: error.message,
    });
  }
};
