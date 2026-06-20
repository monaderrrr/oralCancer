import Joi from "joi";

/* =========================
   Password Regex
========================= */
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

/* =========================
   Update Password Schema
========================= */
export const updatePasswordSchema = {
  body: Joi.object({
    oldPassword: Joi.string()
      .pattern(passwordRegex)
      .messages({
        "string.pattern.base":
          "Password must be at least 8 characters long, contain at least one uppercase letter and one number",
      }),

    newPassword: Joi.string()
      .pattern(passwordRegex)
      .messages({
        "string.pattern.base":
          "Password must be at least 8 characters long, contain at least one uppercase letter and one number",
      }),

    confirmNewPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .messages({
        "any.only": "Confirm password must match new password",
      }),
  }).options({ presence: "required" }),
};

/* =========================
   Update Profile Schema
========================= */
export const updateProfileSchema = {
  body: Joi.object({
    fullName: Joi.string().min(3).max(100),

    email: Joi.string().email({ tlds: { allow: ['com', 'net'] }, maxDomainSegments: 2 }),

    phone: Joi.string().allow(''),
    bio: Joi.string().allow(''),
    specialization: Joi.string().allow(''),
    hospital: Joi.string().allow(''),

    medicalLicenseNumber: Joi.string().allow('', null),

    clinicAddress: Joi.string().allow(''),

    workingDays: Joi.string().allow(''),

    consultationFee: Joi.number().min(0).allow(null, ''),
    yearsOfExperience: Joi.number().min(0).allow(null, ''),
  }).unknown(true)
};