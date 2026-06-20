import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/DB/models/users.model.js";
import Scan from "../src/DB/models/scan.model.js";

async function run() {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/oral");
    console.log("Connected successfully!");

    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections in DB:", collections.map(c => c.name));

    // Get count of users by role
    const usersCount = await User.countDocuments();
    const patientsCount = await User.countDocuments({ role: "patient" });
    const doctorsCount = await User.countDocuments({ role: "doctor" });
    console.log(`Total users: ${usersCount} (Patients: ${patientsCount}, Doctors: ${doctorsCount})`);

    const doctors = await User.find({ role: "doctor" }).lean();
    console.log("Doctors:");
    doctors.forEach(d => {
      console.log(`- ID: ${d._id}, Name: ${d.fullName}, Email: ${d.email}, Status: ${d.status}`);
    });

    const patients = await User.find({ role: "patient" }).lean();
    console.log("Patients:");
    patients.forEach(p => {
      console.log(`- ID: ${p._id}, Name: ${p.fullName}, Email: ${p.email}`);
    });

    const scansCount = await Scan.countDocuments();
    console.log(`Total scans: ${scansCount}`);

    const scans = await Scan.find({}).lean();
    console.log("Scans list:");
    scans.forEach(s => {
      console.log(`- Scan ID: ${s._id}, patientId: ${s.patientId}, doctorId: ${s.doctorId}, sharedWithDoctor: ${s.sharedWithDoctor}, riskLevel: ${s.riskLevel}, status: ${s.doctorReview?.reviewedAt ? "Reviewed" : "Pending"}`);
    });

  } catch (error) {
    console.error("Error querying DB:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from Database");
  }
}

run();
