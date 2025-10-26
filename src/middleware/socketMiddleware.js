// src/middleware/socketMiddleware.js
// Middleware để truyền socket instance vào request

module.exports = (io) => {
  return (req, res, next) => {
    req.io = io;
    next();
  };
};
