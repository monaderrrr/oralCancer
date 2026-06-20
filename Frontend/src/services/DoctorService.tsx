import API from "../Api";

// Normalize API response safely
const extractData = (res: any) => {
  if (res?.data?.data) return res.data.data;
  if (res?.data) return res.data;
  return res;
};
export const getDoctorDashboard = async () => {
  const res = await API.get("/api/v1/doctor/dashboard");
  return extractData(res);
};

export const getDoctorActivity = async () => {
  const res = await API.get("/api/v1/doctor/activity");
  return extractData(res);
};

export const getPatients = async (params = {}) => {
  const res = await API.get("/api/v1/doctor/patients", { params });
  return extractData(res);
};

export const getScanDetails = async (scanId: string) => {
  const res = await API.get(`/api/v1/doctor/scans/${scanId}`);
  return extractData(res);
};

export const submitReview = async (scanId: string, data: any) => {
  const res = await API.post(
    `/api/v1/doctor/scans/${scanId}/review`,
    data
  );
  return extractData(res);
};