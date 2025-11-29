// server/middleware/validation.js
const Joi = require('joi');

exports.validateReportParams = (req, res, next) => {
  const schema = Joi.object({
    periodType: Joi.string().valid('month', 'date').required(),
    reportType: Joi.string().valid('purchase', 'sales').when('periodType', {
      is: 'date',
      then: Joi.required()
    }),
    month: Joi.string().when('periodType', {
      is: 'month',
      then: Joi.required()
    }),
    year: Joi.number().when('periodType', {
      is: 'month',
      then: Joi.required()
    }),
    startDate: Joi.date().when('periodType', {
      is: 'date',
      then: Joi.required()
    }),
    endDate: Joi.date().when('periodType', {
      is: 'date',
      then: Joi.required()
    }),
    customerCode: Joi.string().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};