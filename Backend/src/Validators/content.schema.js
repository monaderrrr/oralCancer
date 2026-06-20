import Joi from 'joi';

export const createContentSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(300).required(),
    body: Joi.string().min(1).required(),
    category: Joi.string().optional(),
  }).options({ presence: 'required' }),
};

export const updateContentSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(300),
    body: Joi.string().min(1),
    category: Joi.string(),
  }).options({ presence: 'optional' }),
};
