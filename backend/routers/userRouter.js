const express = require("express");
const userRouter = express.Router();

const {
  getUsers,
  getUserById,
  deleteUserById,
  processRegister,
  activateUserAccount,
  updateUserById,
} = require("../controllers/userController");
const uploadUserImage = require("../middleware/fileUpload");
const { validateUserRegistration } = require("../validator/expressValidation");
const runValidation = require("../validator");

userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);
userRouter.delete("/:id", deleteUserById);
userRouter.post(
  "/process-register",
  uploadUserImage.single("image"),
  processRegister
);
userRouter.post("/verify", activateUserAccount);
userRouter.put(
  "/:id",
  uploadUserImage.single("image"),
  validateUserRegistration,
  updateUserById
);

module.exports = userRouter;
