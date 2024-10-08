const { successResponse, errorResponse } = require("../utils/responseHelpers");
const {
  sendTelegramMessage,
  sendTelegramImage,
} = require("../utils/sendTelegramMessage");
const { uploadImage, deleteImage } = require("../utils/uploadImage");

const sendMessage = async (req, res, next) => {
  const message = req.body.message;
  const chat_id = req.body.chat_id;
  try {
    await sendTelegramMessage(message, chat_id);
    successResponse(res, null, "Message sent successfully.");
  } catch (err) {
    next(err);
  }
};

const sendImage = async (req, res, next) => {
  let image = { secure_url: null };
  const caption = req.body.caption;
  const chat_id = req.body.chat_id;


  if (!req.file && !req.body.image) {
    return errorResponse(res, "Image is required", 400);
  }

  try {
    if (req.file) {
      image = await uploadImage(req.file.path);
    }
    // if image is a URL
    if (req.body.image) {
      image = { secure_url: req.body.image };
    }

    const result = await sendTelegramImage(image.secure_url, caption, chat_id);

    if (req.file) {
      await deleteImage(image.secure_url);
    }

    if (result) {
      successResponse(res, null, "Image sent successfully.");
    } else {
      errorResponse(res, "Failed to send image", 500);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendMessage,
  sendImage,
};
