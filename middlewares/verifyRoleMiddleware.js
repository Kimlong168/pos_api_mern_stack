const { errorResponse } = require("../utils/responseHelpers");

const verifyRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role; // Assume `req.user` is populated by authentication middleware

    if (!roles.includes(userRole)) {
      return errorResponse(res, "Forbidden - cannot access", 403);
    }

    next();
  };
};

module.exports = verifyRole;
