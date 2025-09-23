// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

/**
 * Xác thực token + kiểm tra role
 * @param {Array} allowedRoles - các role được phép truy cập
 */
function authMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
      // Giải mã token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; 

      // Nếu có quy định role thì kiểm tra
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient role" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Token is not valid" });
    }
  };
}

module.exports = authMiddleware;
