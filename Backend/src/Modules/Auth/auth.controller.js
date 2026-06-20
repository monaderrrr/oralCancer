import { Router } from "express";
import { 
    forgetPasswordService, 
    refreshTokenService, 
    resetPasswordService, 
    signInService, 
    signOutService, 
    signUpService, 
    verifyEmailService,
    verifyOtpService,
    resendOtpService   
} from "./Services/auth.service.js";
import { errorHandler } from "../../Middleware/error-handler.middleware.js";
import { validationMiddleware } from "../../Middleware/validation.middleware.js";
import { forgetPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema } from "../../Validators/auth.schema.js";
import { requireDb } from "../../Middleware/db.middleware.js";
import upload from "../../config/multer.config.js";
import { authenticationMiddleware } from "../../Middleware/authentication.middleware.js";


const authController = Router()
authController.get("/me", authenticationMiddleware(), (req, res) => {
  const currentUser = req.user || req.authUser;

  if (!currentUser) {
    return res.status(401).json({ message: "Unauthorized: user not found" });
  }

  res.json({ 
    user: {
      _id: currentUser._id ?? null,
      email: currentUser.email,
      fullName: currentUser.fullName, 
      role: currentUser.role,
      status: currentUser.status,
      isEmailVerified: currentUser.isEmailVerified
    } 
  });
});

// map license uploads for doctors
const mapLicenseUploads = (req, res, next) => {
    try {
        let uploads = [];
        if (req.files && req.files.license && Array.isArray(req.files.license)) {
            uploads = req.files.license.map(f => `/uploads/${f.filename}`);
        } else if (req.file) {
            uploads = [`/uploads/${req.file.filename}`];
        }
        if (uploads.length) {
            req.body.licenseUploads = uploads;
        }
    } catch (e) {
        // proceed without license uploads if mapping fails
    }
    return next();
};

// ==================== AUTH ROUTES ====================

// Sign Up
authController.post(
    '/signUp',
    requireDb,
    upload.fields([{ name: 'license', maxCount: 5 }]), 
    mapLicenseUploads, 
    errorHandler(signUpService)
);

// Sign In
authController.post(
    '/signIn',
    requireDb,
    errorHandler(validationMiddleware(signInSchema)),
    errorHandler(signInService)
);

// Verify Email
authController.get(
    '/verify/:emailToken',
    requireDb,
    errorHandler(verifyEmailService)
);

// Refresh Token
authController.get(
    '/refreshToken',
    requireDb,
    errorHandler(refreshTokenService)
);

// Sign Out
authController.post(
    '/signOut',
    requireDb,
    errorHandler(signOutService)
);

// Forget Password (send OTP)
authController.patch(
    '/forgetPassword',
    requireDb,
    errorHandler(validationMiddleware(forgetPasswordSchema)),
    errorHandler(forgetPasswordService)
);

// Reset Password
authController.put(
    '/resetPassword',
    requireDb,
    errorHandler(validationMiddleware(resetPasswordSchema)),
    errorHandler(resetPasswordService)
);

// ==================== VERIFY OTP ====================
authController.post(
    '/verify-otp',
    requireDb,
    errorHandler(verifyOtpService)
);

// ==================== RESEND OTP ====================
authController.post(
    '/resend-otp',
    requireDb,
    errorHandler(resendOtpService)
);

// ==================== TEST EMAIL ====================
authController.post('/test-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email required' });
        
        const { emailEmitter } = await import('../../../Services/send-email.service.js');
        const testEmailHtml = `
          <div style="background:#f4f4f4;padding:20px;font-family:Arial,sans-serif;">
            <div style="background:#ffffff;padding:30px;border-radius:8px;max-width:500px;margin:0 auto;">
              <h2 style="color:#111827;margin-bottom:20px;">✅ Email System Test</h2>
              <p style="color:#6b7280;font-size:16px;line-height:1.6;margin-bottom:20px;">
                Congratulations! Your email system is working perfectly. This is a test email from OralScan AI.
              </p>
              <div style="background:#f0f9ff;border-left:4px solid #16a34a;padding:20px;border-radius:6px;margin:20px 0;text-align:center;">
                <p style="color:#166534;font-weight:600;margin:0;font-size:18px;">🎉 Email System Operational</p>
              </div>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
              <p style="color:#9ca3af;font-size:12px;text-align:center;">© 2026 OralScan AI. All rights reserved.</p>
            </div>
          </div>
        `;
        
        emailEmitter.emit('sendEmail', {
            to: email,
            subject: 'Test Email from OralScan AI',
            html: testEmailHtml
        });
        
        return res.status(200).json({ message: 'Test email sent to ' + email });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

export default authController;
