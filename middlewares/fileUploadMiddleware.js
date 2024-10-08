
const fileUploadValidation = (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'FILE_UPLOAD_ERROR',
          message: 'No file was uploaded or there was an issue with the file upload.'
        }
      });
    }
    next();
  };
  
  module.exports = fileUploadValidation;
  