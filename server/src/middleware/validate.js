import Joi from 'joi';

const personalSchema = Joi.object({
  name: Joi.string().trim().required(),
  title: Joi.string().trim().allow('', null),
  location: Joi.string().trim().allow('', null),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().allow('', null),
  linkedin: Joi.string().uri().allow('', null),
  github: Joi.string().uri().allow('', null),
  website: Joi.string().uri().allow('', null),
}).unknown(true);

const sectionEntrySchema = Joi.object().unknown(true);

const sectionSchema = Joi.object({
  id: Joi.string().guid({ version: 'uuidv4' }).required(),
  type: Joi.string().trim().required(),
  order: Joi.number().integer().min(0).required(),
  entries: Joi.array().items(sectionEntrySchema).default([]),
}).unknown(true);

const cvSchema = Joi.object({
  title: Joi.string().allow('', null).default('My Resume'),
  personal: personalSchema.required(),
  sections: Joi.array().items(sectionSchema).required(),
});

const uuidParamSchema = Joi.object({
  id: Joi.string().guid({ version: 'uuidv4' }).required(),
});

export const validateCVBody = (req, res, next) => {
  const { error, value } = cvSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    return res.status(400).json({
      error: true,
      message: 'Invalid CV payload',
      details: error.details.map((detail) => detail.message),
    });
  }
  req.body = value;
  next();
};

export const validateCVIdParam = (req, res, next) => {
  const { error } = uuidParamSchema.validate(req.params);
  if (error) {
    return res.status(400).json({
      error: true,
      message: 'Invalid CV ID',
      details: error.details.map((detail) => detail.message),
    });
  }

  next();
};
