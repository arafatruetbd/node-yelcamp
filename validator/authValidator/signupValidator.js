const User = require('../../models/user');
const { body } = require('express-validator');

module.exports = [
  body('username')
    .isLength({ min: 2, max: 15 })
    .withMessage('Username Must Be 2 to 15 Chars')
    .custom(async (username) => {
      let user = await User.findOne({ username });
      if (user) {
        return Promise.reject('Username Already used');
      }
    })
    .trim(),
  body('password')
    .isLength({ min: 5 })
    .withMessage('Password Must Be Greater Than 5 Chars'),
];
