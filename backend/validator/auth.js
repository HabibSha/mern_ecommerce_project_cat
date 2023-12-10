const Validator = require("validator");
const isEmpty = require("is-empty");

// Registration input validation
const validateRegisterInput = (data) => {
  let errors = {};
  // Convert empty fields to an empty string so we can use validator functions
  data.username = !isEmpty(data.username) ? data.username : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.address = !isEmpty(data.address) ? data.address : "";
  data.phone = !isEmpty(data.phone) ? data.phone : "";

  // Name check
  if (Validator.isEmpty(data.username)) {
    errors.username = "Username field is required";
  } else if (
    !Validator.isLength(Validator.trim(data.username), { min: 3, max: 31 })
  ) {
    errors.username = "Username should be at least 3 characters";
  }
  // Email check
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = "Please enter a valid email";
  }
  // Password check
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  } else if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be at least 6 characters";
  } else if (
    !Validator.matches(
      data.password,
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/
    )
  ) {
    errors.password =
      "Password should contain at least one uppercase letter, one lowercase letter, one number and one special character.";
  }
  // Address check
  if (Validator.isEmpty(data.address)) {
    errors.address = "User address is required";
  } else if (!Validator.isLength(Validator.trim(data.address), { min: 4 })) {
    errors.address = "User address should be at least 4 characters";
  }
  // Phone check
  if (Validator.isEmpty(Validator.trim(data.phone))) {
    errors.phone = "User phone is required";
  }
  //    else if (!Validator.isLength(data.name, { min: 3, max: 31 })) {
  //     errors.name = "Username should be at least minimum 3 characters";
  //   }

  // image check
  // if (Validator.isBase32(data.image)) {
  //   errors.image = "User image is optional";
  // }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

module.exports = { validateRegisterInput };
