import Joi from "joi";

// Password regex
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

// =======================

export const signUpSchema = {
  body: Joi.object({
    fullName: Joi.string().min(3).max(100),

    email: Joi.string().email({
      tlds: { allow: false },
    }),

    password: Joi.string()
      .pattern(passwordRegex)
      .messages({
        'string.pattern.base':
          'Password must be minimum eight characters, include at least one uppercase letter and one number',
      }),

    confirmPassword: Joi.any()
      .valid(Joi.ref('password'))
      .messages({
        'any.only': 'Confirm password must match password',
      }),

    role: Joi.string().valid('patient', 'doctor'),

    phone: Joi.string().optional(),
    specialization: Joi.string().allow(''),
    hospital: Joi.string().allow(''),
    clinicAddress: Joi.string().allow(''),
    googleMapsUrl: Joi.string().allow(''),
    lat: Joi.number().min(-90).max(90).optional().allow(null),
    lng: Joi.number().min(-180).max(180).optional().allow(null),
  })
    .options({ presence: 'optional' }) // make keys optional by default
    .fork(['email', 'password', 'confirmPassword', 'role'], (schema) =>
      schema.required()
    ),
};

// =======================

export const signInSchema = {
  body: Joi.object({
    email: Joi.string().email({
      tlds: { allow: false },
    }),
    password: Joi.string().min(1),
  }).options({ presence: 'required' }),
};

// =======================

export const forgetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email({
      tlds: { allow: false },
    }),
  }).options({ presence: 'required' }),
};

// =======================

export const resetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email({
      tlds: { allow: false },
    }),
    password: Joi.string()
      .pattern(passwordRegex)
      .messages({
        'string.pattern.base':
          'Password must be minimum eight characters, include at least one uppercase letter and one number',
      }),
    confirmPassword: Joi.any()
      .valid(Joi.ref('password'))
      .messages({
        'any.only': 'Confirm password must match password',
      }),
   otp: Joi.string().pattern(/^\d{6}$/),
  }).options({ presence: 'required' }),
};
