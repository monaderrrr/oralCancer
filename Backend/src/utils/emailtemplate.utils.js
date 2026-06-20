/**
 * Email Template Utility Functions
 * Professional, responsive HTML email templates for Oral Cancer Detection platform
 * All emails use inline CSS for maximum email client compatibility
 */

const APP_NAME = "Oral Cancer Detection";
const APP_BRAND_COLOR = "#1e40af"; // Professional blue
const APP_SECONDARY_COLOR = "#1e3a8a"; // Darker blue
const TEXT_DARK = "#111827"; // Dark gray
const TEXT_GRAY = "#6b7280"; // Medium gray
const BG_LIGHT = "#f9fafb"; // Light background
const ACCENT_COLOR = "#dc2626"; // Red accent for important info

/**
 * Generate base email template with dynamic content
 * @param {Object} options - Template options
 * @param {String} options.subject - Email subject line
 * @param {String} options.message - Main message body
 * @param {String} options.otp - One-time password (optional)
 * @param {String} options.confirmEmailLink - Confirmation link (optional)
 * @param {String} options.type - Email type: 'verification', 'password-reset', 'notification'
 * @returns {String} HTML email template
 */
export const emailTemplate = ({
    subject = "Verify Your Email",
    message = "",
    otp = "",
    confirmEmailLink = "",
    type = "verification"
} = {}) => {
    const currentYear = new Date().getFullYear();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background-color: #f4f4f4;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: ${TEXT_DARK};
        }
    </style>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">

    <!-- Outer wrapper -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#f4f4f4;">
        <tr>
            <td align="center">
                <!-- Main container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);overflow:hidden;">

                    <!-- HEADER SECTION -->
                    <tr>
                        <td align="center" style="background:linear-gradient(135deg,${APP_SECONDARY_COLOR} 0%,${APP_BRAND_COLOR} 100%);padding:40px 30px;color:#ffffff;">
                            <h1 style="margin:0;font-size:32px;font-weight:700;letter-spacing:-0.5px;">
                                ${APP_NAME}
                            </h1>
                            <p style="margin:8px 0 0 0;font-size:14px;opacity:0.9;font-weight:300;">
                                Professional Healthcare Solution
                            </p>
                        </td>
                    </tr>

                    <!-- CONTENT SECTION -->
                    <tr>
                        <td style="padding:50px 40px;">

                            <!-- Subject heading -->
                            <h2 style="margin:0 0 20px 0;color:${TEXT_DARK};font-size:24px;font-weight:600;">
                                ${subject}
                            </h2>

                            <!-- Main message -->
                            <p style="margin:0 0 30px 0;color:${TEXT_GRAY};font-size:16px;line-height:1.8;">
                                ${message}
                            </p>

                            <!-- OTP BOX -->
                            ${otp ? `
                            <div style="
                                background:linear-gradient(135deg,#f0f9ff 0%,#eff6ff 100%);
                                border-left:4px solid ${APP_BRAND_COLOR};
                                padding:30px;
                                border-radius:8px;
                                margin:30px 0;
                                text-align:center;
                            ">
                                <p style="margin:0 0 15px 0;color:${TEXT_GRAY};font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
                                    Your Verification Code
                                </p>
                                <div style="
                                    background:#ffffff;
                                    padding:20px;
                                    border-radius:6px;
                                    font-size:48px;
                                    letter-spacing:12px;
                                    font-weight:700;
                                    color:${APP_BRAND_COLOR};
                                    font-family:'Courier New',monospace;
                                    word-spacing:8px;
                                ">
                                    ${otp}
                                </div>
                                <p style="margin:15px 0 0 0;color:${ACCENT_COLOR};font-size:12px;font-weight:600;">
                                    ⏱ This code expires in 10 minutes
                                </p>
                            </div>
                            ` : ""}

                            <!-- VERIFICATION BUTTON -->
                            ${confirmEmailLink ? `
                            <div style="text-align:center;margin:40px 0;">
                                <a href="${confirmEmailLink}" style="
                                    display:inline-block;
                                    padding:16px 40px;
                                    background:linear-gradient(135deg,${APP_SECONDARY_COLOR} 0%,${APP_BRAND_COLOR} 100%);
                                    color:#ffffff;
                                    text-decoration:none;
                                    border-radius:6px;
                                    font-weight:600;
                                    font-size:16px;
                                    transition:all 0.3s ease;
                                    box-shadow:0 4px 12px rgba(30,64,175,0.3);
                                ">
                                    Verify Email Address
                                </a>
                            </div>
                            ` : ""}

                            <!-- SECURITY NOTE -->
                            <div style="
                                background:#fef2f2;
                                border-left:4px solid ${ACCENT_COLOR};
                                padding:16px 20px;
                                border-radius:6px;
                                margin-top:30px;
                            ">
                                <p style="margin:0;color:${TEXT_GRAY};font-size:12px;line-height:1.6;">
                                    <strong style="color:${ACCENT_COLOR};">🔒 Security Notice:</strong> Never share your OTP code. We will never ask for it via email or phone.
                                </p>
                            </div>

                        </td>
                    </tr>

                    <!-- DIVIDER -->
                    <tr>
                        <td style="padding:0;border-top:1px solid #e5e7eb;"></td>
                    </tr>

                    <!-- FOOTER SECTION -->
                    <tr>
                        <td align="center" style="padding:30px 40px;background:${BG_LIGHT};">
                            
                            <!-- Footer links -->
                            <p style="margin:0 0 15px 0;font-size:12px;">
                                <a href="https://oralscan.ai/help" style="color:${APP_BRAND_COLOR};text-decoration:none;margin-right:20px;">Help</a>
                                <a href="https://oralscan.ai/privacy" style="color:${APP_BRAND_COLOR};text-decoration:none;margin-right:20px;">Privacy</a>
                                <a href="https://oralscan.ai/contact" style="color:${APP_BRAND_COLOR};text-decoration:none;">Contact</a>
                            </p>

                            <!-- Copyright -->
                            <p style="margin:15px 0 0 0;font-size:11px;color:#9ca3af;">
                                © ${currentYear} ${APP_NAME}. All rights reserved.<br/>
                                <span style="color:#d1d5db;">Secure Healthcare Technology</span>
                            </p>

                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>
    `;
};

/**
 * Generate email verification OTP template
 * @param {Object} options - Email options
 * @param {String} options.otp - One-time password
 * @param {String} options.recipientName - Recipient's name (optional)
 * @returns {Object} Email configuration object
 */
export const verificationEmailTemplate = ({
    otp,
    recipientName = "User"
} = {}) => {
    return {
        subject: "Verify Your Email Address - Oral Cancer Detection",
        html: emailTemplate({
            subject: "Email Verification Required",
            message: `Hello ${recipientName},<br/><br/>Thank you for signing up with ${APP_NAME}. To complete your account registration and secure your account, please verify your email address using the code below.`,
            otp,
            type: "verification"
        })
    };
};

/**
 * Generate password reset OTP template
 * @param {Object} options - Email options
 * @param {String} options.otp - One-time password
 * @param {String} options.recipientName - Recipient's name (optional)
 * @returns {Object} Email configuration object
 */
export const passwordResetEmailTemplate = ({
    otp,
    recipientName = "User"
} = {}) => {
    return {
        subject: "Reset Your Password - Oral Cancer Detection",
        html: emailTemplate({
            subject: "Password Reset Request",
            message: `Hello ${recipientName},<br/><br/>We received a request to reset your password. Use the verification code below to proceed with resetting your password. If you didn't request this, you can safely ignore this email.`,
            otp,
            type: "password-reset"
        })
    };
};

/**
 * Generate account recovery email template
 * @param {Object} options - Email options
 * @param {String} options.otp - One-time password
 * @param {String} options.recipientName - Recipient's name (optional)
 * @returns {Object} Email configuration object
 */
export const accountRecoveryEmailTemplate = ({
    otp,
    recipientName = "User"
} = {}) => {
    return {
        subject: "Account Recovery - Oral Cancer Detection",
        html: emailTemplate({
            subject: "Recover Your Account",
            message: `Hello ${recipientName},<br/><br/>Your account access has been restricted for security reasons. Use the code below to verify your identity and regain access to your account.`,
            otp,
            type: "account-recovery"
        })
    };
};

/**
 * Generate welcome email template
 * @param {Object} options - Email options
 * @param {String} options.recipientName - Recipient's name
 * @param {String} options.confirmEmailLink - Email confirmation link (optional)
 * @returns {Object} Email configuration object
 */
export const welcomeEmailTemplate = ({
    recipientName = "User",
    confirmEmailLink = ""
} = {}) => {
    return {
        subject: "Welcome to Oral Cancer Detection",
        html: emailTemplate({
            subject: "Welcome Aboard!",
            message: `Hello ${recipientName},<br/><br/>Welcome to ${APP_NAME}! We're excited to have you join our community dedicated to early detection and prevention of oral cancer. Your account is now active and ready to use.`,
            confirmEmailLink,
            type: "welcome"
        })
    };
};