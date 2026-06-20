import {
  getPendingDoctorsService,
  approveDoctorService,
  rejectDoctorService,
  getAllDoctorsService,
  getDoctorDetailsService,
} from "./services/admin.service.js";

export const getPendingDoctors = async (req, res) => {
  try {
    await getPendingDoctorsService(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending doctors", error: error.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    await getAllDoctorsService(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error: error.message });
  }
};

export const getDoctorDetails = async (req, res) => {
  try {
    await getDoctorDetailsService(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor details", error: error.message });
  }
};

export const approveDoctor = async (req, res) => {
  try {
    await approveDoctorService(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error approving doctor", error: error.message });
  }
};

export const rejectDoctor = async (req, res) => {
  try {
    await rejectDoctorService(req, res);
  } catch (error) {
    res.status(500).json({ message: "Error rejecting doctor", error: error.message });
  }
};
