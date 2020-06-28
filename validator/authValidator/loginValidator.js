const { body } = require('express-validator');
module.exports = [
  body('username').not().isEmpty().withMessage('Please Provide Username'),
  body('password').not().isEmpty().withMessage('Please Provide Password'),
];
