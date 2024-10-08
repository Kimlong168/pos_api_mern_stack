const enableCors = (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true"); // Allow credentials
  // Respond to OPTIONS requests with a 204 status to indicate success
  // if (req.method === "OPTIONS") {
  //   return res.status(204).end();
  // }
  next();
};

module.exports = enableCors;