const createError = require("http-errors");
const fs = require("fs").promises;
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const { successResponse } = require("./responseController");
const { findWithId } = require("../services/findItem");
const { deleteImage } = require("../helper/deleteImage");
const createJSONWebToken = require("../helper/jsonwebtoken");
const { jwtActivisionKey, clientURL } = require("../secret");
const { emailWithNodeMailer } = require("../helper/email");

// load validation register inputs
const { validateRegisterInput } = require("../validator/auth");

// get all users
const getUsers = async (req, res, next) => {
  try {
    // searching & pagination
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const searchRegExp = new RegExp(".*" + search + ".*", "i");

    const filter = {
      isAdmin: { $ne: true },
      $or: [
        { username: { $regex: searchRegExp } },
        { email: { $regex: searchRegExp } },
        { phone: { $regex: searchRegExp } },
      ],
    };
    // hiding password from search result
    const options = { password: 0 };

    const users = await User.find(filter, options)
      .limit(limit) // for pagination
      .skip((page - 1) * limit); // for pagination

    // search results count
    const count = await User.find(filter).countDocuments();

    if (!users) throw createError(404, "Users does not exists!");

    /*Normal way*/
    /*res.status(200).json({
      success: true,
      message: "users were returned",
      users,
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        previousPage: page - 1 > 0 ? page - 1 : null,
        nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
      },
    });*/

    /*Professional way*/
    return successResponse(res, {
      statusCode: 200,
      message: "users were returned successfully",
      payload: {
        users,
        pagination: {
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          previousPage: page - 1 > 0 ? page - 1 : null,
          nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// get single user by id
const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const options = { password: 0 };
    const user = await findWithId(User, id, options);

    return successResponse(res, {
      statusCode: 200,
      message: "User were returned successfully",
      payload: { user },
    });
  } catch (error) {
    next(error);
  }
};

// delete single user by id
const deleteUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const options = { password: 0 };
    const user = await findWithId(User, id, options);

    // delete user image
    const userImagePath = user.image;
    // import from helper folder
    deleteImage(userImagePath);

    // delete user
    await User.findByIdAndDelete({ _id: id, isAdmin: false });

    return successResponse(res, {
      statusCode: 200,
      message: "User was deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// create an user
const processRegister = async (req, res, next) => {
  try {
    // Form Validation
    const { errors, isValid } = validateRegisterInput(req.body);

    // Check Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const { username, email, password, phone, address } = req.body;

    const image = req.file.path;
    if (image) {
      if (image.size > 1024 * 1024 * 2) {
        throw createError(400, "File is too large. It must be less than 2 MB");
      }
    }

    const userExists = await User.exists({ email: email });
    if (userExists) {
      throw createError(
        409,
        "User with this email already exists. Please sign in."
      );
    }

    // create jwt
    const tokenPayload = { username, email, password, phone, address };
    if (image) {
      tokenPayload.image = image;
    }
    const token = createJSONWebToken(tokenPayload, jwtActivisionKey, "10m");

    // prepare email
    const emailData = {
      email,
      subject: "Account Activision Email",
      body: `
        <h2> Hello ${username}! </h2>
        <p> Please click here to <a href="${clientURL}/api/users/activate/${token}" target="_black"> activate your account </a> </p>
      `,
    };

    // send email with nodemailer
    try {
      await emailWithNodeMailer(emailData);
    } catch (emailError) {
      next(createError(500, "Failed to send verification email"));
      return;
    }

    return successResponse(res, {
      statusCode: 200,
      message: `Please go to your ${email} for completing your registration process.`,
      payload: { token },
    });
  } catch (error) {
    next(error);
  }
};

// verify an user account
const activateUserAccount = async (req, res, next) => {
  try {
    const token = req.body.token;
    if (!token) throw createError(404, "Token not found!");

    try {
      // verify user and register
      const decoded = jwt.verify(token, jwtActivisionKey);
      if (!decoded) throw createError(401, "Unable to verify user");

      // and then create user
      await User.create(decoded);

      return successResponse(res, {
        statusCode: 201,
        message: "User was registered successfully",
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw createError(401, "Token has expired");
      } else if (error.name === "JsonWebTokenError") {
        throw createError(401, "Invalid Token");
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

// update single user by id
const updateUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const options = { password: 0 };
    const user = await findWithId(User, userId, options);

    const updateOptions = { new: true, runValidators: true, context: "query" };
    let updates = {};

    /**if (req.body.username) {
          updates.username = req.body.username;
        }
       if (req.body.password) {
          updates.password = req.body.password;
        }
       if (req.body.phone) {
           updates.phone = req.body.phone;
        }
       if (req.body.address) {
           updates.address = req.body.address;
        }**/

    // professional way
    for (let key in req.body) {
      if (["username", "password", "phone", "address"].includes(key)) {
        updates[key] = req.body[key];
      } else if (["email"].includes(key)) {
        throw new Error("Email can not be updated");
      }
    }

    const image = req.file;
    if (image) {
      if (image.size > 1024 * 1024 * 2) {
        throw createError(400, "File is too large. It must be less than 2 MB");
      }
      updates.image = image;
      console.log(updates.image);
      user.image !== "default.jpg" && deleteImage(user.image);
    }

    // update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      updateOptions
    ).select("-password");
    if (!updatedUser) {
      throw createError(404, "User with this ID does not exist");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "User was updated successfully",
      payload: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  deleteUserById,
  processRegister,
  activateUserAccount,
  updateUserById,
};
