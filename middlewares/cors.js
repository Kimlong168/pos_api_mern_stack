const enableCors = (req, res, next) => {
  const clientUrl = process.env.CLIENT_SIDE_URL;
  res.setHeader("Access-Control-Allow-Origin", clientUrl);
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
