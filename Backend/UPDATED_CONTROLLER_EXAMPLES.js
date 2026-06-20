/**
 * UPDATED EMAIL CONTROLLER EXAMPLES
 * Production-ready implementations for authentication flows
 * Last Updated: May 6, 2026
 */

// ============================================================================
// EXAMPLE 1: REGISTER / EMAIL VERIFICATION CONTROLLER
// ============================================================================

import User from "../../../DB/models/users.model.js";
import bcrypt from "bcryptjs";
import { emailEmitter } from "../../../Services/send-email.service.js";
import jwt from "jsonwebtoken";

/**
 * Register User with Email Verification
 * 
 * Flow:
 * 1. Validate input
 * 2. Check if email already exists
 * 3. Hash password
 * 4. Create user with OTP
 * 5. Send verification email
 */
export const registerController = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      confirmPassword, 
      fullName, 
      role = "patient",
      phone 
    } = req.body;

    // 1. Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and fullName are required"
      });
    }

    if (password !== confirmPassword) {
      return res.status(409).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    // 2. Check if email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    // 3. Hash password
    const saltValue = parseInt(process.env.SALT) || 10;
    const hashedPassword = bcrypt.hashSync(password, saltValue);

    // 4. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 5. Create user
    const userPayload = {
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      role,
      phone: phone || null,
      isEmailVerified: false,
      otp: bcrypt.hashSync(otp, saltValue),
      otpExpires: otpExpiry,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const user = await User.create(userPayload);

    // 6. Send verification email
    try {
      const otpHtml = `
        <div style="background:#f4f4f4;padding:20px;font-family:Arial,sans-serif;">
          <div style="background:#ffffff;padding:30px;border-radius:8px;max-width:500px;margin:0 auto;">
            <h2 style="color:#111827;margin-bottom:20px;">Welcome to OralScan AI!</h2>
            <p style="color:#6b7280;font-size:16px;line-height:1.6;margin-bottom:20px;">
              Hello ${fullName},<br/><br/>
              Thank you for signing up. Please verify your email address using the code below.
            </p>
            <div style="background:#f0f9ff;border-left:4px solid #1e40af;padding:20px;border-radius:6px;text-align:center;margin:30px 0;">
              <p style="color:#6b7280;font-size:12px;text-transform:uppercase;margin-bottom:10px;">Your Verification Code</p>
              <div style="background:#ffffff;padding:15px;border-radius:6px;font-size:36px;letter-spacing:8px;font-weight:700;color:#1e40af;font-family:'Courier New',monospace;">
                ${otp}
              </div>
              <p style="color:#dc2626;font-size:12px;margin-top:10px;">⏱ This code expires in 10 minutes</p>
            </div>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;">
              If you didn't create this account, you can safely ignore this email.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
            <p style="color:#9ca3af;font-size:12px;text-align:center;">© 2026 OralScan AI. All rights reserved.</p>
          </div>
        </div>
      `;

      emailEmitter.emit("sendEmail", {
        to: email,
        subject: "Verify your email - OralScan AI",
        html: otpHtml
      });

      console.log(`✓ Verification email sent to ${email}`);
    } catch (emailError) {
      console.error(`✗ Failed to send verification email:`, emailError.message);
      // Don't fail the registration if email fails
      // The user can resend OTP later
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for the verification code.",
      data: {
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        },
        otpExpires: otpExpiry
      }
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message
    });
  }
};

/**
 * Verify OTP and Complete Email Verification
 */
export const verifyEmailOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check OTP not expired
    if (!user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    // Check OTP matches
    const isOtpValid = bcrypt.compareSync(otp.toString(), user.otp);
    if (!isOtpValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isEmailVerified: true
        }
      }
    });

  } catch (error) {
    console.error("Email Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Email verification failed",
      error: error.message
    });
  }
};

/**
 * Resend OTP Email
 */
export const resendOTPController = async (req, res) => {
  try {
    const { email, purpose = "signup" } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const saltValue = parseInt(process.env.SALT) || 10;

    // Update user with new OTP
    user.otp = bcrypt.hashSync(otp, saltValue);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send email
    try {
      const otpHtml = `
        <div style="background:#f4f4f4;padding:20px;font-family:Arial,sans-serif;">
          <div style="background:#ffffff;padding:30px;border-radius:8px;max-width:500px;margin:0 auto;">
            <h2 style="color:#111827;margin-bottom:20px;">Resend Verification Code</h2>
            <p style="color:#6b7280;font-size:16px;line-height:1.6;margin-bottom:20px;">
              Here's your new verification code for OralScan AI.
            </p>
            <div style="background:#f0f9ff;border-left:4px solid #1e40af;padding:20px;border-radius:6px;text-align:center;margin:30px 0;">
              <p style="color:#6b7280;font-size:12px;text-transform:uppercase;margin-bottom:10px;">Your Verification Code</p>
              <div style="background:#ffffff;padding:15px;border-radius:6px;font-size:36px;letter-spacing:8px;font-weight:700;color:#1e40af;font-family:'Courier New',monospace;">
                ${otp}
              </div>
              <p style="color:#dc2626;font-size:12px;margin-top:10px;">⏱ This code expires in 10 minutes</p>
            </div>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
            <p style="color:#9ca3af;font-size:12px;text-align:center;">© 2026 OralScan AI. All rights reserved.</p>
          </div>
        </div>
      `;

      emailEmitter.emit("sendEmail", {
        to: email,
        subject: "Your verification code",
        html: otpHtml
      });

      console.log(`✓ OTP resent to ${email}`);
    } catch (emailError) {
      console.error(`✗ Failed to resend OTP:`, emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      data: {
        otpExpires: user.otpExpires
      }
    });

  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      error: error.message
    });
  }
};

// ============================================================================
// EXAMPLE 2: FORGOT PASSWORD / PASSWORD RESET CONTROLLER
// ============================================================================

/**
 * Request Password Reset (Send OTP)
 */
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists (security best practice)
      return res.status(200).json({
        success: true,
        message: "If this email is registered, you'll receive a password reset code"
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const saltValue = parseInt(process.env.SALT) || 10;

    // Save OTP to user
    user.resetOTP = bcrypt.hashSync(otp, saltValue);
    user.resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send reset email
    try {
      const resetEmailHtml = `
        <div style="background:#f4f4f4;padding:20px;font-family:Arial,sans-serif;">
          <div style="background:#ffffff;padding:30px;border-radius:8px;max-width:500px;margin:0 auto;">
            <h2 style="color:#111827;margin-bottom:20px;">Reset Your Password</h2>
            <p style="color:#6b7280;font-size:16px;line-height:1.6;margin-bottom:20px;">
              Hello ${user.fullName},<br/><br/>
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
        html: resetEmailHtml
      });

      console.log(`✓ Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error(`✗ Failed to send reset email:`, emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "If this email is registered, you'll receive a password reset code"
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
      error: error.message
    });
  }
};

/**
 * Reset Password with OTP Verification
 */
export const resetPasswordController = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Validation
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and passwords are required"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check OTP not expired
    if (!user.resetOTPExpires || new Date() > user.resetOTPExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    // Check OTP matches
    const isOtpValid = bcrypt.compareSync(otp.toString(), user.resetOTP);
    if (!isOtpValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // Update password
    const saltValue = parseInt(process.env.SALT) || 10;
    user.password = bcrypt.hashSync(newPassword, saltValue);
    user.resetOTP = null;
    user.resetOTPExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password."
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message
    });
  }
};

// ============================================================================
// EXPORT ALL CONTROLLERS
// ============================================================================

export const authControllers = {
  registerController,
  verifyEmailOTPController,
  resendOTPController,
  forgotPasswordController,
  resetPasswordController
};

export default authControllers;
