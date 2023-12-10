require("dotenv").config();

const serverPort = process.env.PORT || 4000;

// database url
const mongodbUrl =
  process.env.MONGODB_ATLAS_URL || "mongodb://localhost:27017/ecommerceMernDB";

// image path
const defaultImagePath =
  process.env.DEFAULT_USER_IMAGE_PATH || "public/images/users/default.jpg";

// jwt secret key
const jwtActivisionKey =
  process.env.JWT_SECRET_KEY_ACTIVISION || "asdfjhsdfkjasdf_45845441$$%";

const smtpUsername = process.env.SMTP_USERNAME || "";
const smtpPassword = process.env.SMTP_PASSWORD || "";
const clientURL = process.env.CLIENT_URL;

module.exports = {
  serverPort,
  mongodbUrl,
  defaultImagePath,
  jwtActivisionKey,
  smtpUsername,
  smtpPassword,
  clientURL,
};
