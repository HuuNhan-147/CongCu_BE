/**
 * Utility: Response helpers
 * Đảm bảo tất cả API trả về cùng một format JSON chuẩn
 */

/**
 * Trả về response thành công
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Thông báo thành công
 * @param {object|array} data - Dữ liệu trả về
 */
export const successResponse = (res, statusCode = 200, message = "Success", data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Trả về response lỗi
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - Thông báo lỗi
 * @param {string} code - Mã lỗi tùy chỉnh (optional)
 */
export const errorResponse = (res, statusCode = 500, message = "Internal Server Error", code = "SERVER_ERROR") => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};
