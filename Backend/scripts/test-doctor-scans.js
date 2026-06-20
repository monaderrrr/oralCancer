import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import axios from "axios";
import User from "../src/DB/models/users.model.js";

async function run() {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/oral");
    console.log("Connected successfully!");

    const doctorEmail = "52cd45e158@emailinbo.live";
    const doctor = await User.findOne({ email: doctorEmail });
    if (!doctor) {
      console.error("Doctor not found!");
      process.exit(1);
    }

    // Set password to "Password@123"
    const newPassword = "Password@123";
    const saltValue = process.env.SALT ? +process.env.SALT : 10;
    const hashedPassword = bcrypt.hashSync(newPassword, saltValue);

    doctor.password = hashedPassword;
    // ensure email verified and status is approved
    doctor.isEmailVerified = true;
    doctor.status = "approved";
    await doctor.save();
    console.log("Updated doctor password, verification, and status in DB.");

    await mongoose.disconnect();
    console.log("Disconnected from DB. Now testing signIn and API request...");

    // Log in
    const loginRes = await axios.post("http://localhost:5000/auth/signIn", {
      email: doctorEmail,
      password: newPassword
    });

    console.log("Login Status:", loginRes.status);
    const token = loginRes.data.accessToken;
    console.log("Access Token retrieved:", token ? "YES (starts with " + token.substring(0, 10) + "...)" : "NO");

    // Request scans
    const scansRes = await axios.get("http://localhost:5000/api/v1/doctor/scans", {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Scans API status:", scansRes.status);
    console.log("Response data:", JSON.stringify(scansRes.data, null, 2));

  } catch (error) {
    console.error("Error occurred:", error.response?.status, error.response?.data || error.message);
  }
}

run();
