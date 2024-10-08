const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { successResponse, errorResponse } = require("../utils/responseHelpers");
const { blacklistedTokens } = require("../middlewares/authMiddleware");
const { uploadImage, deleteImage } = require("../utils/uploadImage");
const {
  sendTelegramMessage,
  sendTelegramImage,
} = require("../utils/sendTelegramMessage");
const {
  getFormattedDate,
  getFormattedTimeWithAMPM,
} = require("../utils/getFormattedDate");

const register = async (req, res, next) => {
  let image = { secure_url: null };
  // if already exists
  let existing;
  try {
    existing = await User.findOne({ email: req.body.email });

    if (existing) {
      return errorResponse(res, "User already exists", 400);
    }

    if (req.file) {
      image = await uploadImage(req.file.path);
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const userData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      chat_id: req.body.chat_id,
      profile_picture: image.secure_url,
      password: hashedPassword,
    };

    const user = new User(userData);

    await user.save();

    // Send the telegram group
    if (image.secure_url) {
      await sendTelegramImage(
        image.secure_url,
        `New User Created 👤
      \n🆔 Name: ${req.body.name}
      \n📧 Email: ${req.body.email}
      \n👮 Role: ${req.body.role}
      \n💬 Chat ID: ${req.body.chat_id}`,
        process.env.TELEGRAM_CHAT_ID,
        process.env.TELEGRAM_TOPIC_SECURITY_ID
      );
    } else {
      await sendTelegramMessage(
        `New User Created 👤
        \n🆔 Name: ${req.body.name}
        \n📧 Email: ${req.body.email}
        \n👮 Role: ${req.body.role}
        \n💬 Chat ID: ${req.body.chat_id}`,
        process.env.TELEGRAM_CHAT_ID,
        process.env.TELEGRAM_TOPIC_SECURITY_ID
      );
    }

    successResponse(res, user, "User created successfully");
  } catch (err) {
    if (req.file) {
      await deleteImage(image.secure_url);
    }
    next(err);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return errorResponse(res, "User not found", 404);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return errorResponse(res, "Invalid password", 401);
  }

  // Create access token (expires in 1 hour)
  const token = jwt.sign(
    {
      name: user.name,
      email: user.email,
      role: user.role,
      id: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Create refresh token (expires in 5h)
  const refreshToken = jwt.sign(
    { name: user.name, email: user.email, role: user.role, id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "5h" }
  );

  // Send the telegram group
  await sendTelegramMessage(
    `User Login Successful 🟩
    \n👮 Name: ${user.name} (${user.role})
    \n📧 Email: ${user.email}
    \n🕒 Date & Time: ${getFormattedDate(
      new Date()
    )}, ${getFormattedTimeWithAMPM(new Date())}`,
    process.env.TELEGRAM_CHAT_ID,
    process.env.TELEGRAM_TOPIC_SECURITY_ID
  );

  successResponse(
    res,
    {
      user,
      token,
      refreshToken,
    },
    "User logged in successfully"
  );
};

const logout = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  // const token = req.token;

  if (token) {
    // Send the telegram group

    await sendTelegramMessage(
      `User Logout Successful 🟥
      \n👮 Name: ${req.body.name} (${req.body.role})
      \n📧 Email: ${req.body.email}
      \n🕒 Date & Time: ${getFormattedDate(
        new Date()
      )}, ${getFormattedTimeWithAMPM(new Date())}`,
      process.env.TELEGRAM_CHAT_ID,
      process.env.TELEGRAM_TOPIC_SECURITY_ID
    );
    blacklistedTokens.add(token);
    successResponse(res, null, "User logged out successfully");
  } else {
    errorResponse(res, "No token provided", 400);
  }
};

const refreshToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const refreshToken = authHeader && authHeader.split(" ")[1];
  let userData;
  try {
    userData = await User.findOne({ email: req.user.email });
    if (!userData) {
      return errorResponse(res, "User not found", 404);
    }
  } catch (err) {
    return errorResponse(res, "User not found", 404);
  }

  if (refreshToken) {
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
      if (err) return errorResponse(res, "Unauthorized", 401);
      const newToken = jwt.sign(
        {
          name: userData.name,
          email: userData.email,
          role: userData.role,
          id: userData._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      const newRefreshToken = jwt.sign(
        {
          name: userData.name,
          email: userData.email,
          role: userData.role,
          id: userData,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "5h",
        }
      );
      successResponse(
        res,
        { token: newToken, refreshToken: newRefreshToken, user: userData },
        "Token refreshed successfully"
      );
    });
  } else {
    errorResponse(res, "No token provided", 400);
  }
};

module.exports = { register, login, logout, refreshToken };
