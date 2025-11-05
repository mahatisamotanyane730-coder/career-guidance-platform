const Joi = require('joi');

// Validation schemas
const authValidation = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).required(),
    role: Joi.string().valid('student', 'institution', 'company', 'admin').required(),
    institutionName: Joi.string().when('role', {
      is: 'institution',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    companyName: Joi.string().when('role', {
      is: 'company',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  })
};

const institutionValidation = {
  create: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      country: Joi.string().required()
    }).required(),
    description: Joi.string().min(10).required()
  })
};

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details[0].message
      });
    }
    next();
  };
};

module.exports = { authValidation, institutionValidation, validate };