import {
  setConsultationFeeService,
  initiateConsultationService,
  handlePaymentSuccessService,
  getPatientConsultationsService,
  getDoctorConsultationsService,
  getActiveConsultationService,
} from './services/consultation.service.js';

/**
 * Controller: Doctor sets/updates consultation fee
 * PUT /api/v1/consultation/fee
 */
export const setConsultationFeeController = async (req, res) => {
  try {
    const doctorId = req.authUser._id;
    const { fee } = req.body;

    if (fee === undefined || fee === null) {
      return res.status(400).json({
        success: false,
        message: 'Consultation fee is required',
      });
    }

    const result = await setConsultationFeeService(doctorId, fee);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update consultation fee',
    });
  }
};

/**
 * Controller: Patient initiates paid chat consultation
 * POST /api/v1/consultation/initiate
 */
export const initiateConsultationController = async (req, res) => {
  try {
    const patientId = req.authUser._id;
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required',
      });
    }

    const result = await initiateConsultationService(patientId, doctorId);

    return res.status(200).json({
      success: true,
      message: 'Checkout session created successfully',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to initiate consultation',
    });
  }
};

/**
 * Controller: Get patient's consultations
 * GET /api/v1/consultation/my-consultations
 */
export const getPatientConsultationsController = async (req, res) => {
  try {
    const patientId = req.authUser._id;
    const consultations = await getPatientConsultationsService(patientId);

    return res.status(200).json({
      success: true,
      message: 'Consultations retrieved successfully',
      data: consultations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve consultations',
    });
  }
};

/**
 * Controller: Get doctor's consultations
 * GET /api/v1/consultation/doctor-consultations
 */
export const getDoctorConsultationsController = async (req, res) => {
  try {
    const doctorId = req.authUser._id;
    const consultations = await getDoctorConsultationsService(doctorId);

    return res.status(200).json({
      success: true,
      message: 'Consultations retrieved successfully',
      data: consultations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve consultations',
    });
  }
};

/**
 * Controller: Get active consultation
 * GET /api/v1/consultation/active/:doctorId
 */
export const getActiveConsultationController = async (req, res) => {
  try {
    const patientId = req.authUser._id;
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required',
      });
    }

    const consultation = await getActiveConsultationService(patientId, doctorId);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'No active consultation found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Active consultation retrieved successfully',
      data: consultation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve active consultation',
    });
  }
};

