import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const ACCESS_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "1h";

/**
 * Tạo Access Token từ payload
 * @param {object} payload - Dữ liệu cần mã hóa (vd: { id, email })
 * @returns {string} JWT access token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
};

/**
 * Xác thực và giải mã Access Token
 * @param {string} token - JWT access token
 * @returns {object} Decoded payload nếu hợp lệ
 * @throws Error nếu token không hợp lệ hoặc hết hạn
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};
