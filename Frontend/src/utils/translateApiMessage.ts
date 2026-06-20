import type { TFunction } from "i18next";

const messageKeyMap: Record<string, string> = {
  "Please enter email and password": "auth.login.errors.missingCredentials",
  "Invalid email or password": "auth.login.errors.invalidCredentials",
  "Please fill in all fields": "auth.signup.errors.fillAllFields",
  "Please enter a valid phone number": "auth.signup.errors.invalidPhone",
  "Password is too weak": "auth.signup.errors.weakPassword",
  "Passwords do not match": "auth.signup.errors.passwordMismatch",
  "Failed to create account": "auth.signup.errors.failed",
  "Failed to send OTP": "auth.forgotPassword.errors.failed",
  "Email is missing. Please go back to the previous step.": "auth.verifyCode.errors.missingEmail",
  "Email is missing. Go back and try again.": "auth.verifyCode.errors.missingEmailShort",
  "Please enter the complete 6-digit code": "auth.verifyCode.errors.incompleteCode",
  "Invalid or expired OTP code.": "auth.verifyCode.errors.invalidCode",
  "Failed to resend code.": "auth.verifyCode.errors.resendFailed",
  "All fields are required": "auth.resetPassword.errors.allFieldsRequired",
  "Password must be at least 8 characters long": "auth.resetPassword.errors.passwordLength",
  "Reset failed. Your OTP may have expired. Please request a new one.": "auth.resetPassword.errors.failed",
  "Invalid verification link": "auth.verifyEmail.errors.invalidLink",
  "Verification failed or link expired": "auth.verifyEmail.errors.failed",
  "Please fill all required fields and upload mandatory documents.": "doctorVerification.errors.requiredFields",
  "Upload failed. Try again later.": "doctorVerification.errors.uploadFailed",
  "Documents submitted successfully": "doctorVerification.messages.submitted",
  "Failed to fetch doctors": "admin.messages.fetchFailed",
  "Doctor approved successfully": "admin.messages.approved",
  "Failed to approve doctor": "admin.messages.approveFailed",
  "Doctor rejected successfully": "admin.messages.rejected",
  "Failed to reject doctor": "admin.messages.rejectFailed",
};

export function translateApiMessage(t: TFunction, message?: string, fallbackKey = "common.errors.generic") {
  if (!message) {
    return t(fallbackKey);
  }

  const mappedKey = messageKeyMap[message];

  return mappedKey ? t(mappedKey) : message;
}
