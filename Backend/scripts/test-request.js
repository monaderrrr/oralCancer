import axios from "axios";

async function run() {
  try {
    // 1. Try public doctor route
    console.log("Requesting GET http://localhost:5000/api/v1/doctor/doctor/6a25b666b59527a77736871e...");
    const res1 = await axios.get("http://localhost:5000/api/v1/doctor/doctor/6a25b666b59527a77736871e");
    console.log("Status:", res1.status, "Data:", JSON.stringify(res1.data));
  } catch (error) {
    console.log("Error public route:", error.response?.status, error.response?.data || error.message);
  }

  try {
    // 2. Try scans route without token
    console.log("\nRequesting GET http://localhost:5000/api/v1/doctor/scans (No token)...");
    const res2 = await axios.get("http://localhost:5000/api/v1/doctor/scans");
    console.log("Status:", res2.status);
  } catch (error) {
    console.log("Error scans route (No token):", error.response?.status, error.response?.data || error.message);
  }

  try {
    // 3. Try scans route with invalid token
    console.log("\nRequesting GET http://localhost:5000/api/v1/doctor/scans (Invalid token)...");
    const res3 = await axios.get("http://localhost:5000/api/v1/doctor/scans", {
      headers: { Authorization: "Bearer invalidtoken" }
    });
    console.log("Status:", res3.status);
  } catch (error) {
    console.log("Error scans route (Invalid token):", error.response?.status, error.response?.data || error.message);
  }
}

run();
