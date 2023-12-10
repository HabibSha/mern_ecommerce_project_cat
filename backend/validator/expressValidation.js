const { body } = require("express-validator");

const validateUserRegistration = [
  body("image").optional().isString().withMessage("User image is optional"),
];

module.exports = { validateUserRegistration };
