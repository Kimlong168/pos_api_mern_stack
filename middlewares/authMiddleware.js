const { errorResponse } = require("../utils/responseHelpers");
const jwt = require("jsonwebtoken");
const blacklistedTokens = new Set();

// check if the user is authenticated or not and the token is not expired yet
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return errorResponse(res, "Unauthorized", 401);

  // Check if the token is blacklisted
  if (blacklistedTokens.has(token)) {
    return errorResponse(res, "Unauthorized", 401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return errorResponse(res, "Unauthorized", 401);
    req.user = user;
    req.token = token;

    next();
  });
};

module.exports = { authenticateToken, blacklistedTokens };
