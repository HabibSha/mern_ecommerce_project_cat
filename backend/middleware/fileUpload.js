const createError = require("http-errors");
const multer = require("multer");
const path = require("path");

const {
  UPLOAD_USER_IMG_DIR,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} = require("../config");

const userStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_USER_IMG_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(new Error("File type is not allowed"), false);
  }
  cb(null, true);
};

const uploadUserImage = multer({
  storage: userStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});
module.exports = uploadUserImage;
