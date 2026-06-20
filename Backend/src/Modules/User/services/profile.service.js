import { compareSync, hashSync } from "bcryptjs";
import BlackListTokens from "../../../DB/models/black-list-tokens.model.js";
import User from "../../../DB/models/users.model.js";
import { decryption, encryption } from "../../../utils/encryption.utils.js";
import jwt from "jsonwebtoken";
import { emailEmitter } from "../../../Services/send-email.service.js";

/* =========================
   Get Profile
========================= */
export const profileService = async (req, res) => {
  const { _id } = req.authUser;

  const user = await User.findById(_id).select("-password -__v");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.phone && process.env.ENCRYPTED_KEY) {
    try {
      user.phone = await decryption({
        cipher: user.phone,
        secretKey: process.env.ENCRYPTED_KEY,
      });
    } catch (err) {
      console.error("Phone decryption failed:", err.message);}}

  return res.status(200).json({
    message: "User found successfully",
    user,
  });
};
/* =========================
   Update Password
========================= */
export const updatePasswordService = async (req, res) => {
  const { _id } = req.authUser;
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
    return res.status(409).json({ message: "Passwords do not match" });
  }

  const user = await User.findById(_id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const isPasswordMatch = compareSync(oldPassword, user.password);
  if (!isPasswordMatch) {
    return res.status(400).json({ message: "Invalid old password" });
  }

  user.password = hashSync(newPassword, +process.env.SALT);
  await user.save();

  try {
    const accessTokenId = req.authUser?.token?.tokenId;
    if (accessTokenId) {
      await BlackListTokens.collection.insertOne({
        tokenId: String(accessTokenId),
        expiryDate: String(req.authUser.token.expiryDate),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  } catch (err) {
    console.log("Blacklist skipped safely to avoid 500 error");
  }

  return res.status(200).json({
    message: "Password updated successfully ✅",
  });
};
/* =========================
   Update Profile
========================= */
export const updateProfileService = async (req, res) => {
  const { _id } = req.authUser;
  const {
    fullName, phone, specialization, hospital, bio,
    address, workingDays, consultationFee, yearsOfExperience, email
  } = req.body;

  const user = await User.findById(_id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (fullName) user.fullName = fullName;
  if (specialization) user.specialization = specialization;
  if (hospital) user.hospital = hospital;
  if (bio) user.bio = bio;
  if (address) user.address = address;
  if (workingDays) user.workingDays = workingDays; 
  
  if (yearsOfExperience !== undefined) user.yearsOfExperience = yearsOfExperience;
  if (consultationFee !== undefined) user.consultationFee = consultationFee;
  if (phone) {
    user.phone = await encryption({
      value: phone,
      secretKey: process.env.ENCRYPTED_KEY,
    });
  }

  if (email) {
    const isEmailExists = await User.findOne({ email });
    if (isEmailExists && isEmailExists._id.toString() !== _id.toString()) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const token = jwt.sign(
      { email, userId: _id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const encodedToken = encodeURIComponent(token);
    const confirmationLink = `${req.protocol}://${req.headers.host}/auth/verify/${encodedToken}`;

    console.info("[Profile] Email verification link:", confirmationLink);

    const verifyEmailHtml = `
      <div style="background:#f4f4f4;padding:20px;font-family:Arial,sans-serif;">
        <div style="background:#ffffff;padding:30px;border-radius:8px;max-width:500px;margin:0 auto;">
          <h2 style="color:#111827;margin-bottom:20px;">Verify Your Email Address</h2>
          <p style="color:#6b7280;font-size:16px;line-height:1.6;margin-bottom:20px;">
            You've requested to update your email address on OralScan AI. Click the button below to verify this new email address.
          </p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${confirmationLink}" style="
              display:inline-block;
              padding:14px 32px;
              background:linear-gradient(135deg,#1e3a8a 0%,#1e40af 100%);
              color:#ffffff;
              text-decoration:none;
              border-radius:6px;
              font-weight:600;
              font-size:16px;
              box-shadow:0 4px 12px rgba(30,64,175,0.3);
            ">
              Verify Email Address
            </a>
          </div>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin-top:20px;">
            Or copy and paste this link in your browser:<br/>
            <code style="background:#f3f4f6;padding:4px 8px;border-radius:4px;word-break:break-all;font-size:12px;">
              ${confirmationLink}
            </code>
          </p>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin-top:20px;">
            This link will expire in 1 hour. If you didn't request this change, please ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
          <p style="color:#9ca3af;font-size:12px;text-align:center;">© 2026 OralScan AI. All rights reserved.</p>
        </div>
      </div>
    `;

       emailEmitter.emit("sendEmail", {
      to: email,
      subject: "Verify your email",
      html: verifyEmailHtml,
    });

    user.email = email;
    user.isEmailVerified = false;
  }

  await user.save();

  return res.status(200).json({
    message: "Profile updated successfully",
    user,
  });
};

/* =========================
   Get All Users
========================= */
export const getAllUsersService = async (req, res) => {

  const users = await User.find().select("-password -__v");

  if (!users.length) {
    return res.status(404).json({
      message: "No users found"
    });
  }

  return res.status(200).json({
    message: "Users found successfully",
    users,
  });
};