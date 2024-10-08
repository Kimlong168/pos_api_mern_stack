const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { successResponse, errorResponse } = require("../utils/responseHelpers");
const {
  uploadImage,
  replaceImage,
  deleteImage,
} = require("../utils/uploadImage");
const { upload } = require("../data/multer");
const { sendTelegramMessage } = require("../utils/sendTelegramMessage");
const {
  getFormattedDate,
  getFormattedTimeWithAMPM,
} = require("../utils/getFormattedDate");
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    successResponse(res, users, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    successResponse(res, user, "Data retrieved successfully.");
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    console.log(req.file);
    if (req.file && user.profile_picture) {
      const image = await replaceImage(user.profile_picture, req.file.path);
      user.profile_picture = image.secure_url;
    } else if (req.file) {
      const image = await uploadImage(req.file.path);
      user.profile_picture = image.secure_url;
    }

    user.name = req.body.name;
    user.role = req.body.role;
    user.chat_id = req.body.chat_id;

    await user.save();
    successResponse(res, user, "User updated successfully");
  } catch (err) {
    next(err);
  }
};

const updatePassword = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return errorResponse(res, "User not found", 404);
  }

  const isPasswordValid = await bcrypt.compare(
    req.body.oldPassword,
    user.password
  );

  if (!isPasswordValid) {
    return errorResponse(res, "Invalid password", 401);
  }

  const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

  try {
    user.password = hashedPassword;

    await user.save();

    await sendTelegramMessage(
      `Password Updated Successfully 🟨
      \n👮 Name: ${user.name} (${user.role})
      \n📧 Email: ${user.email}
      \n🕒 Date & Time: ${getFormattedDate(
        new Date()
      )}, ${getFormattedTimeWithAMPM(new Date())}`,
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_SECURITY_ID
    );
    successResponse(res, user, "Password updated successfully");
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return errorResponse(res, "User not found", 404);
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  try {
    user.password = hashedPassword;

    await user.save();

    await sendTelegramMessage(
      `Password Reseted Successfully 🟦
      \n👮 Name: ${user.name} (${user.role})
      \n📧 Email: ${user.email}
      \n🕒 Date & Time: ${getFormattedDate(
        new Date()
      )}, ${getFormattedTimeWithAMPM(new Date())}`,
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_SECURITY_ID
    );
    successResponse(res, user, "Password updated successfully");
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user.profile_picture) {
      await deleteImage(user.profile_picture);
    }
    successResponse(res, null, "User deleted successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updatePassword,
  resetPassword,
};
