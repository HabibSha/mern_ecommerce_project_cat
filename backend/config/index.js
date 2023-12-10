const MAX_FILE_SIZE = 2097152; // 2mb -- 1024bytes * 1024kb * 2
const ALLOWED_FILE_TYPES = ["image/jpg", "image/jpeg", "image/png"];
const UPLOAD_USER_IMG_DIR = "public/images/users";

module.exports = { MAX_FILE_SIZE, ALLOWED_FILE_TYPES, UPLOAD_USER_IMG_DIR };
