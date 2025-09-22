const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

const validateIssue = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('categoryId').isUUID().withMessage('Valid category ID required'),
  body('subcategoryId').optional({ nullable: true }).isUUID().withMessage('Valid subcategory ID required'),
  body('location.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('location.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('location.address').trim().isLength({ min: 5 }).withMessage('Address required'),
  handleValidationErrors
];

const validateUser = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').optional({ nullable: true }).isEmail().withMessage('Valid email required'),
  body('phone').optional({ nullable: true }).isMobilePhone('en-IN').withMessage('Valid Indian phone number required'),
  body('password').optional({ nullable: true }).isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

const validateComment = [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateIssue,
  validateUser,
  validateComment
};
