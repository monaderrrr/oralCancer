import Joi from 'joi';

export const createPostSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    body: Joi.string().min(1).required(),
    category: Joi.string()
      .valid('Success Stories', 'Discussion', 'Q&A', 'Support')
      .required(),
  }).options({ presence: 'required' }),
};

export const updatePostSchema = {
  body: Joi.object({
    title: Joi.string().min(3).max(200),
    body: Joi.string().min(1),
  }).options({ presence: 'optional' }),
};

export const createCommentSchema = {
  body: Joi.object({
    postId: Joi.string().required(),
    body: Joi.string().min(1).required(),
  }).options({ presence: 'required' }),
};
