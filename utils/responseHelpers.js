// responseHelpers.js
function successResponse(
  res,
  data = [],
  message = "Operation completed successfully."
) {
  return res.status(200).json({
    status: "success",
    data,
    message,
  });
}

function errorResponse(res, message, code) {
  return res.status(400).json({
    status: "error",
    error: {
      code,
      message,
    },
  });
}

module.exports = { successResponse, errorResponse };
