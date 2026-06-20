/**
 * Email Service
 * Handles all email sending functionality for Oral Cancer Detection platform
 * Uses Nodemailer with Gmail SMTP for production-ready email delivery
 */

import nodemailer from 'nodemailer';
import { EventEmitter } from 'node:events';
import {
    emailTemplate,
    verificationEmailTemplate,
    passwordResetEmailTemplate,
    accountRecoveryEmailTemplate,
    welcomeEmailTemplate
} from '../utils/emailtemplate.utils.js';

/**
 * Create and configure email transporter
 * Gmail SMTP configuration for secure email delivery
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.PASSWORD_USER
        },
        // Gmail specific optimizations
        pool: {
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 2000,
            rateLimit: 5
        }
    });
};

/**
 * Generic email sending function
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email address (required)
 * @param {String} options.subject - Email subject (required)
 * @param {String} options.html - HTML email content (required)
 * @param {String} options.text - Plain text fallback (optional)
 * @param {Array} options.attachments - Email attachments (optional)
 * @returns {Promise<Object>} Nodemailer response
 * @throws {Error} If email sending fails
 */
export const sendEmailService = async ({
    to,
    subject,
    html,
    text = undefined,
    attachments = []
} = {}) => {
    
    // Validation
    if (!to) {
        throw new Error('Missing required email parameter: to (recipient email) is required');
    }
    
    if (!subject) {
        throw new Error('Missing required email parameter: subject is required');
    }
    
    if (!html) {
        throw new Error('Missing required email parameter: html is required');
    }

    if (!process.env.EMAIL_USER || !process.env.PASSWORD_USER) {
        throw new Error('Email credentials not configured in environment variables');
    }

    try {
        const transporter = createTransporter();

        // Configure mail options
        const mailOptions = {
            from: `"OralScan AI" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html, // HTML content takes precedence
            ...(text && { text }), // Optional plain text fallback
            ...(attachments.length > 0 && { attachments })
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log(`✓ Email sent successfully to ${to}`);
        console.log(`  Message ID: ${info.messageId}`);

        return {
            success: true,
            messageId: info.messageId,
            response: info.response
        };

    } catch (error) {
        console.error(`✗ Failed to send email to ${to}:`, error.message);
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

/**
 * Send email verification OTP
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email address (required)
 * @param {String} options.otp - One-time password (required)
 * @param {String} options.recipientName - Recipient's name (optional)
 * @returns {Promise<Object>} Nodemailer response
 * @throws {Error} If email sending fails
 */
export const sendVerificationOTP = async ({
    to,
    otp,
    recipientName = 'User'
} = {}) => {
    
    if (!to || !otp) {
        throw new Error('Missing required parameters: to and otp are required');
    }

    try {
        const emailConfig = verificationEmailTemplate({
            otp,
            recipientName
        });

        const result = await sendEmailService({
            to,
            subject: emailConfig.subject,
            html: emailConfig.html
        });

        console.log(`✓ Verification email sent to ${to}`);
        return result;

    } catch (error) {
        console.error(`✗ Failed to send verification email to ${to}:`, error.message);
        throw error;
    }
};

/**
 * Send password reset OTP
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email address (required)
 * @param {String} options.otp - One-time password (required)
 * @param {String} options.recipientName - Recipient's name (optional)
 * @returns {Promise<Object>} Nodemailer response
 * @throws {Error} If email sending fails
 */
export const sendForgotPasswordOTP = async ({
    to,
    otp,
    recipientName = 'User'
} = {}) => {
    
    if (!to || !otp) {
        throw new Error('Missing required parameters: to and otp are required');
    }

    try {
        const emailConfig = passwordResetEmailTemplate({
            otp,
            recipientName
        });

        const result = await sendEmailService({
            to,
            subject: emailConfig.subject,
            html: emailConfig.html
        });

        console.log(`✓ Password reset email sent to ${to}`);
        return result;

    } catch (error) {
        console.error(`✗ Failed to send password reset email to ${to}:`, error.message);
        throw error;
    }
};

/**
 * Send account recovery email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email address (required)
 * @param {String} options.otp - One-time password (required)
 * @param {String} options.recipientName - Recipient's name (optional)
 * @returns {Promise<Object>} Nodemailer response
 * @throws {Error} If email sending fails
 */
export const sendAccountRecoveryEmail = async ({
    to,
    otp,
    recipientName = 'User'
} = {}) => {
    
    if (!to || !otp) {
        throw new Error('Missing required parameters: to and otp are required');
    }

    try {
        const emailConfig = accountRecoveryEmailTemplate({
            otp,
            recipientName
        });

        const result = await sendEmailService({
            to,
            subject: emailConfig.subject,
            html: emailConfig.html
        });

        console.log(`✓ Account recovery email sent to ${to}`);
        return result;

    } catch (error) {
        console.error(`✗ Failed to send account recovery email to ${to}:`, error.message);
        throw error;
    }
};

/**
 * Send welcome email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email address (required)
 * @param {String} options.recipientName - Recipient's name (optional)
 * @param {String} options.confirmEmailLink - Email confirmation link (optional)
 * @returns {Promise<Object>} Nodemailer response
 * @throws {Error} If email sending fails
 */
export const sendWelcomeEmail = async ({
    to,
    recipientName = 'User',
    confirmEmailLink = undefined
} = {}) => {
    
    if (!to) {
        throw new Error('Missing required parameters: to is required');
    }

    try {
        const emailConfig = welcomeEmailTemplate({
            recipientName,
            confirmEmailLink
        });

        const result = await sendEmailService({
            to,
            subject: emailConfig.subject,
            html: emailConfig.html
        });

        console.log(`✓ Welcome email sent to ${to}`);
        return result;

    } catch (error) {
        console.error(`✗ Failed to send welcome email to ${to}:`, error.message);
        throw error;
    }
};

/**
 * Send custom email
 * For emails with custom HTML or attachments
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email address (required)
 * @param {String} options.subject - Email subject (required)
 * @param {String} options.message - Email message (required)
 * @param {String} options.otp - OTP (optional)
 * @param {String} options.confirmEmailLink - Confirmation link (optional)
 * @param {String} options.customHtml - Custom HTML (optional, overrides template)
 * @param {Array} options.attachments - File attachments (optional)
 * @returns {Promise<Object>} Nodemailer response
 * @throws {Error} If email sending fails
 */
export const sendCustomEmail = async ({
    to,
    subject,
    message,
    otp = undefined,
    confirmEmailLink = undefined,
    customHtml = undefined,
    attachments = []
} = {}) => {
    
    if (!to || !subject || !message) {
        throw new Error('Missing required parameters: to, subject, and message are required');
    }

    try {
        // Use custom HTML if provided, otherwise generate from template
        const htmlContent = customHtml || emailTemplate({
            subject,
            message,
            otp,
            confirmEmailLink
        });

        const result = await sendEmailService({
            to,
            subject,
            html: htmlContent,
            attachments
        });

        console.log(`✓ Custom email sent to ${to}`);
        return result;

    } catch (error) {
        console.error(`✗ Failed to send custom email to ${to}:`, error.message);
        throw error;
    }
};

/**
 * Email Event Emitter
 * Used to send emails asynchronously throughout the application
 */
export const emailEmitter = new EventEmitter();

/**
 * Listen for sendEmail events and process them
 * Events are handled asynchronously without blocking the main process
 */
emailEmitter.on('sendEmail', async ({
    to,
    subject,
    message,
    otp,
    confirmEmailLink,
    html,
    attachments,
    recipientName,
    type = 'auto'
}) => {
    try {
        // Auto-detect type based on what's provided
        if (type === 'auto') {
            if (otp && !html) {
                type = 'otp'; // OTP without custom HTML
            } else if (html && !otp && !message) {
                type = 'custom-html'; // Custom HTML provided
            } else {
                type = 'custom'; // Generic custom email
            }
        }

        // Route to appropriate email function based on type
        if (type === 'verification' && otp) {
            await sendVerificationOTP({ 
                to, 
                otp, 
                recipientName: recipientName || 'User' 
            });
        } else if (type === 'password-reset' && otp) {
            await sendForgotPasswordOTP({ 
                to, 
                otp, 
                recipientName: recipientName || 'User' 
            });
        } else if (type === 'account-recovery' && otp) {
            await sendAccountRecoveryEmail({ 
                to, 
                otp, 
                recipientName: recipientName || 'User' 
            });
        } else if (type === 'welcome') {
            await sendWelcomeEmail({ 
                to, 
                recipientName: recipientName || 'User',
                confirmEmailLink 
            });
        } else if (type === 'otp' && otp) {
            // Generic OTP email (legacy)
            const emailConfig = passwordResetEmailTemplate({
                otp,
                recipientName: recipientName || 'User'
            });
            await sendEmailService({
                to,
                subject: subject || emailConfig.subject,
                html: html || emailConfig.html,
                attachments
            });
        } else if (type === 'custom-html' && html) {
            // Custom HTML provided, use it directly
            await sendEmailService({
                to,
                subject: subject || 'Message from OralScan AI',
                html,
                attachments
            });
        } else if (message) {
            // Legacy custom email with message
            await sendCustomEmail({
                to,
                subject: subject || 'Message',
                message,
                otp,
                confirmEmailLink,
                customHtml: html,
                attachments
            });
        } else {
            // Fallback: use HTML if provided
            if (html) {
                await sendEmailService({
                    to,
                    subject: subject || 'Message from OralScan AI',
                    html,
                    attachments
                });
            } else {
                throw new Error('No email content provided. Provide either: otp, message, or html');
            }
        }
    } catch (error) {
        console.error(`✗ Email emitter error for ${to}:`, error.message);
        // Emit error event for error handling
        emailEmitter.emit('emailError', {
            to,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Handle email errors
 * Can be used for logging or retry logic
 */
emailEmitter.on('emailError', ({
    to,
    error,
    timestamp
}) => {
    console.error(`[${timestamp}] Email error for ${to}: ${error}`);
    // TODO: Implement retry logic, logging to database, etc.
});

// Export emitter as 'emitter' for backward compatibility
export const emitter = emailEmitter;