// src/middleware/socketAuthMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = (io) => {
  return async (socket, next) => {
    try {
      
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user in database
      const user = await User.findById(decoded.sub || decoded.id);
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }
      
      // Attach user to socket
      socket.user = user;
      
      next();
    } catch (error) {
      console.error("❌ Socket authentication error:", error.message);
      next(new Error("Authentication error: Invalid token"));
    }
  };
};
