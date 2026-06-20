import User from "../../../DB/models/users.model.js";
import bcrypt from "bcryptjs";
import { emailEmitter, sendVerificationOTP, sendForgotPasswordOTP } from "../../../Services/send-email.service.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import BlackListTokens from "../../../DB/models/black-list-tokens.model.js";
import { emailTemplate } from "../../../utils/emailtemplate.utils.js";
import { createNotification } from "../../Notifications/services/notification.service.js";


/* ========================= SIGN UP ========================= */
export const signUpService = async (req, res) => {
  try {
    const { 
      email, password, confirmPassword, fullName, role, phone,
      specialization, hospital, clinicAddress, googleMapsUrl, lat, lng, workingDays 
    } = req.body;

    if (role === "admin")
      return res.status(403).json({ message: "Admin registration not allowed" });

    if (password !== confirmPassword)
      return res.status(409).json({ message: "Passwords do not match" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "Email already exists" });

    const saltValue = process.env.SALT ? +process.env.SALT : 10;
    const hashedPassword = bcrypt.hashSync(password, saltValue);

    const userPayload = {
  email,
  password: hashedPassword,
  role,
  fullName,
  phone,
  isEmailVerified: false,
  licenseUploads: [],
  specialization: specialization || null,
  hospital: hospital || null,
  clinicAddress: clinicAddress || null, 
  googleMapsUrl: googleMapsUrl || null,
  lat: typeof lat === "number" ? lat : null,
  lng: typeof lng === "number" ? lng : null,
  workingDays: workingDays || null,

  rating: 0, 
};

    const user = await User.create(userPayload);

    await createNotification({
      userId: user._id,
      type: "welcome",
      title: "Welcome to OralScan AI",
      message: role === "doctor"
        ? "Your doctor account has been created. Verify your email and upload your documents so the admin can review your profile."
        : "Welcome to OralScan AI. You can now track scans, contact doctors, and follow your oral health progress.",
      actionUrl: role === "doctor" ? "/doctor/verification-upload" : "/patient/dashboard",
      targetId: user._id.toString(),
      targetRoute: role === "doctor" ? "/doctor/verification-upload" : "/patient/dashboard",
      req,
    });

    // Send OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHtml = `
      <div style="background:#f4f4f4;padding:20px;font-family:Arial,sans-serif;">
        <div style="background:#ffffff;padding:30px;border-radius:8px;max-width:500px;margin:0 auto;">
          <h2 style="color:#111827;margin-bottom:20px;">Email Verification</h2>
          <p style="color:#6b7280;font-size:16px;line-height:1.6;margin-bottom:20px;">
            Welcome to OralScan AI! Please verify your email address using the code below.
          </p>
          <div style="background:#f0f9ff;border-left:4px solid #1e40af;padding:20px;border-radius:6px;text-align:center;margin:30px 0;">
            <p style="color:#6b7280;font-size:12px;text-transform:uppercase;margin-bottom:10px;">Your Verification Code</p>
            <div style="background:#ffffff;padding:15px;border-radius:6px;font-size:36px;letter-spacing:8px;font-weight:700;color:#1e40af;font-family:'Courier New',monospace;">
              ${otp}
            </div>
            <p style="color:#dc2626;font-size:12px;margin-top:10px;">⏱ This code expires in 10 minutes</p>
          </div>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;">
            If you didn't sign up for this account, you can safely ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
          <p style="color:#9ca3af;font-size:12px;text-align:center;">© 2026 OralScan AI. All rights reserved.</p>
        </div>
      </div>
    `;
    
    console.log('🔔 Emitting email event for:', email, 'OTP:', otp);
    emailEmitter.emit("sendEmail", {
      to: email,
      subject: "Verify your email - OralScan AI",
      html: otpHtml,
    });
    user.otp = bcrypt.hashSync(otp, saltValue);
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    return res.status(201).json({
      message: "User created successfully. Please check your email for the verification code!",
      user: {
        email: user.email,
        role: user.role,
        fullName: user.fullName
      }
    });

  } catch (err) {
    console.error("🔥 FULL ERROR:", err);
    console.error("🔥 STACK:", err.stack);
    console.error("SignUp Service Error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
};
/* ========================= VERIFY EMAIL ========================= */
export const verifyEmailService = async (req, res) => {
  try {
    const { emailToken } = req.params;
    const decoded = jwt.verify(decodeURIComponent(emailToken), process.env.JWT_SECRET);

    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      { isEmailVerified: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    const accessToken = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET_LOGIN,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
    message: "Email verified successfully",
    user: {
       _id: user._id,
       fullName: user.fullName,
       role: user.role,
       specialization: user.specialization, 
       hospital: user.hospital
    },
    accessToken
  });

  } catch (err) {
    console.error("Verify Email Error:", err);
    return res.status(401).json({ message: "Invalid or expired verification token" });
  }
};

/* ========================= SIGN IN ========================= */
export const signInService = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for admin login
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const adminUser = {
        _id: "admin",
        email: process.env.ADMIN_EMAIL,
        role: "admin",
        fullName: "Admin",
        status: "approved",
        isEmailVerified: true
      };

      const accessToken = jwt.sign(
        { _id: adminUser._id, email: adminUser.email, role: adminUser.role },
        process.env.JWT_SECRET_LOGIN,
        { expiresIn: "1h", jwtid: uuidv4() }
      );

      const refreshToken = jwt.sign(
        { _id: adminUser._id, email: adminUser.email, role: adminUser.role },
        process.env.JWT_SECRET_REFRESH,
        { expiresIn: "2d", jwtid: uuidv4() }
      );

      return res.status(200).json({
        message: "Admin logged in successfully",
        accessToken,
        refreshToken,
        user: adminUser
      });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return res.status(401).json({ message: "Invalid email or password" });
    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account is deactivated" });
    }

    if (user.role === "doctor") {
      if (user.status === "rejected") {
        return res.status(403).json({
          message: "Your application was rejected. Please contact support.",
        });
      }

      if (user.status === "pending" && user.isEmailVerified) {
        return res.status(403).json({
          message: "Your account is pending admin approval.",
        });
      }
    }

    if (!user.isEmailVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHtml = `
        <div style="background:#f4f4f4;padding:20px;font-family:Arial,sans-serif;">
          <div style="background:#ffffff;padding:30px;border-radius:8px;max-width:500px;margin:0 auto;">
            <h2 style="color:#111827;margin-bottom:20px;">Email Verification</h2>
            <p style="color:#6b7280;font-size:16px;line-height:1.6;margin-bottom:20px;">
              Please verify your email address using the code below.
            </p>
            <div style="background:#f0f9ff;border-left:4px solid #1e40af;padding:20px;border-radius:6px;text-align:center;margin:30px 0;">
              <p style="color:#6b7280;font-size:12px;text-transform:uppercase;margin-bottom:10px;">Your Verification Code</p>
              <div style="background:#ffffff;padding:15px;border-radius:6px;font-size:36px;letter-spacing:8px;font-weight:700;color:#1e40af;font-family:'Courier New',monospace;">
                ${otp}
              </div>
              <p style="color:#dc2626;font-size:12px;margin-top:10px;">⏱ This code expires in 10 minutes</p>
            </div>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `;

      emailEmitter.emit("sendEmail", {
        to: user.email,
        subject: "Verify your email - OralScan AI",
        html: otpHtml,
      });

      user.otp = bcrypt.hashSync(otp, +process.env.SALT);
      user.otpExpires = Date.now() + 10 * 60 * 1000;
      await user.save();

      return res.status(403).json({
        message: "Email not verified. OTP sent again.",
        needsVerification: true,
        email: user.email,
        role: user.role || "patient",
      });
    }

    const accessToken = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET_LOGIN,
      { expiresIn: "1h", jwtid: uuidv4() }
    );

    const refreshToken = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET_REFRESH,
      { expiresIn: "2d", jwtid: uuidv4() }
    );

    return res.status(200).json({
      message: "User logged in successfully",
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        isEmailVerified: user.isEmailVerified,
        specialization: user.specialization,
        hospital: user.hospital,
        address: user.address,
        workingDays: user.workingDays,
        rating: user.rating,
        bio: user.bio,
        yearsOfExperience: user.yearsOfExperience
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}; 
/* ========================= FORGOT PASSWORD ========================= */
export const forgetPasswordService = async (req, res) => {
  try {
    console.log("Forget Password Body:", req.body);
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "This email is not registered" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHtml = `
      <div style="background:#f4f4f4;padding:20px;font-family:Arial,sans-serif;">
        <div style="background:#ffffff;padding:30px;border-radius:8px;max-width:500px;margin:0 auto;">
          <h2 style="color:#111827;margin-bottom:20px;">Reset Your Password</h2>
          <p style="color:#6b7280;font-size:16px;line-height:1.6;margin-bottom:20px;">
            We received a request to reset your password. Use the verification code below to proceed.
          </p>
          <div style="background:#f0f9ff;border-left:4px solid #1e40af;padding:20px;border-radius:6px;text-align:center;margin:30px 0;">
            <p style="color:#6b7280;font-size:12px;text-transform:uppercase;margin-bottom:10px;">Your Verification Code</p>
            <div style="background:#ffffff;padding:15px;border-radius:6px;font-size:36px;letter-spacing:8px;font-weight:700;color:#1e40af;font-family:'Courier New',monospace;">
              ${otp}
            </div>
            <p style="color:#dc2626;font-size:12px;margin-top:10px;">⏱ This code expires in 10 minutes</p>
          </div>
          <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:15px;border-radius:6px;margin:20px 0;">
            <p style="color:#6b7280;font-size:12px;margin:0;">
              <strong style="color:#dc2626;">🔒 Security Notice:</strong> If you didn't request this, please ignore this email. Your password is safe.
            </p>
          </div>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
          <p style="color:#9ca3af;font-size:12px;text-align:center;">© 2026 OralScan AI. All rights reserved.</p>
        </div>
      </div>
    `;
    
    emailEmitter.emit("sendEmail", {
      to: email,
      subject: "Reset your password",
      html: otpHtml,
    });
    user.otp = bcrypt.hashSync(otp, +process.env.SALT);
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Forget Password Error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
/* ========================= VERIFY OTP ========================= */
export const verifyOtpService = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otpExpires && user.otpExpires < Date.now()) {
      return res.status(401).json({ message: "OTP has expired" });
    }

    const isOtpMatch = bcrypt.compareSync(otp.toString(), user.otp);
    if (!isOtpMatch) return res.status(401).json({ message: "Invalid OTP" });

    if (purpose === "forgot") {
      user.otpVerified = true;
    }

    if (purpose === "signup" || purpose === "login") {
      user.isEmailVerified = true;
      user.otp = null;
      user.otpExpires = null;
    }

    await user.save();

    const responseData = {
      message: "OTP verified successfully",
    };

    const shouldIssueTokens =
      (purpose === "signup" && user.role !== "doctor") ||
      (purpose === "login" && user.role !== "doctor") ||
      (purpose === "login" && user.role === "doctor" && user.status === "approved");

    if (shouldIssueTokens) {
      const accessToken = jwt.sign(
        { _id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET_LOGIN,
        { expiresIn: "1h", jwtid: uuidv4() }
      );
      const refreshToken = jwt.sign(
        { _id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET_REFRESH,
        { expiresIn: "2d", jwtid: uuidv4() }
      );

      responseData.accessToken = accessToken;
      responseData.refreshToken = refreshToken;
      responseData.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        isEmailVerified: user.isEmailVerified,
        specialization: user.specialization,
        hospital: user.hospital,
        address: user.address,
        workingDays: user.workingDays,
        rating: user.rating,
        bio: user.bio,
        yearsOfExperience: user.yearsOfExperience,
      };
    }

    return res.status(200).json(responseData);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
/* ========================= RESEND OTP ========================= */
export const resendOtpService = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    let subject = "Verify your email - OralScan AI";
    let messageTitle = "Email Verification";
    let messageText = "Please verify your email address using the code below.";
    
    if (purpose === "forgot") {
      subject = "Reset your password";
      messageTitle = "Reset Your Password";
      messageText = "We received a request to reset your password. Use the code below to proceed.";
    }
    
    const otpHtml = `
      <div style="background:#f4f4f4;padding:20px;font-family:Arial,sans-serif;">
        <div style="background:#ffffff;padding:30px;border-radius:8px;max-width:500px;margin:0 auto;">
          <h2 style="color:#111827;margin-bottom:20px;">${messageTitle}</h2>
          <p style="color:#6b7280;font-size:16px;line-height:1.6;margin-bottom:20px;">
            ${messageText}
          </p>
          <div style="background:#f0f9ff;border-left:4px solid #1e40af;padding:20px;border-radius:6px;text-align:center;margin:30px 0;">
            <p style="color:#6b7280;font-size:12px;text-transform:uppercase;margin-bottom:10px;">Your Code</p>
            <div style="background:#ffffff;padding:15px;border-radius:6px;font-size:36px;letter-spacing:8px;font-weight:700;color:#1e40af;font-family:'Courier New',monospace;">
              ${otp}
            </div>
            <p style="color:#dc2626;font-size:12px;margin-top:10px;">⏱ This code expires in 10 minutes</p>
          </div>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;">
            If you didn't request this, you can safely ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
          <p style="color:#9ca3af;font-size:12px;text-align:center;">© 2026 OralScan AI. All rights reserved.</p>
        </div>
      </div>
    `;
    
    emailEmitter.emit("sendEmail", {
      to: email,
      subject: subject,
      html: otpHtml,
    });
    user.otp = bcrypt.hashSync(otp, +process.env.SALT);
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
/* ========================= RESET PASSWORD (FIXED) ========================= */
export const resetPasswordService = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(409).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp) {
      return res.status(401).json({ message: "OTP expired or already used" });
    }

    const isOtpMatch = bcrypt.compareSync(otp.toString(), user.otp);

    if (!isOtpMatch) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const hashedPassword = bcrypt.hashSync(password, +process.env.SALT);

    user.password = hashedPassword;
    user.otp = null;
    user.otpVerified = false;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully"
    });

  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
/* ========================= REFRESH TOKEN ========================= */
export const refreshTokenService = async (req, res) => {
  try {
    const refreshtoken = req.headers.refreshtoken || req.headers["x-refresh-token"] || req.body.token || req.body.refreshtoken;
    if (!refreshtoken) return res.status(400).json({ message: "Refresh token required" });

    const decodedData = jwt.verify(refreshtoken, process.env.JWT_SECRET_REFRESH);

    const isBlacklisted = await BlackListTokens.findOne({ tokenId: decodedData.jti });
    if (isBlacklisted) return res.status(401).json({ message: "Token is blacklisted" });

    const isAdminRefresh =
      decodedData.role === "admin" ||
      (decodedData.email === process.env.ADMIN_EMAIL && !decodedData._id);

    if (!isAdminRefresh && !decodedData._id) {
      return res.status(401).json({ message: "Invalid refresh token payload" });
    }

    const accessPayload = isAdminRefresh
      ? { _id: "admin", email: process.env.ADMIN_EMAIL, role: "admin" }
      : { _id: decodedData._id, email: decodedData.email, role: decodedData.role };

    const accessToken = jwt.sign(
      accessPayload,
      process.env.JWT_SECRET_LOGIN,
      { expiresIn: "1h", jwtid: uuidv4() }
    );

    return res.status(200).json({ message: "Token refreshed successfully", accessToken });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

/* ========================= SIGN OUT ========================= */
export const signOutService = async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    const { refreshtoken } = req.body;

    if (!accessToken || !refreshtoken)
      return res.status(400).json({ message: "Tokens are required" });

    const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET_LOGIN, { ignoreExpiration: true });
    const decodedRefresh = jwt.verify(refreshtoken, process.env.JWT_SECRET_REFRESH, { ignoreExpiration: true });

    await BlackListTokens.insertMany([
      { tokenId: decodedAccess.jti, expiryDate: decodedAccess.exp },
      { tokenId: decodedRefresh.jti, expiryDate: decodedRefresh.exp },
    ], { ordered: false });

    return res.status(200).json({ message: "User signed out successfully" });
  } catch (err) {
    console.error("SignOut error:", err);
    return res.status(200).json({ message: "Local logout performed" });
  }
};
