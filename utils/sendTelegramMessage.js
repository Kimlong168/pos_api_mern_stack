const axios = require("axios");

const sendTelegramMessage = async (message, chat_id, topic_id) => {
  const chatId = chat_id || process.env.TELEGRAM_CHAT_ID;

  try {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    if (topic_id) {
      await axios.post(url, {
        chat_id: chatId,
        text: message,
        message_thread_id: topic_id,
      });
    } else {
      await axios.post(url, {
        chat_id: chatId,
        text: message,
      });
    }

    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

const sendTelegramImage = async (image, caption, chat_id, topic_id) => {
  const chatId = chat_id || process.env.TELEGRAM_CHAT_ID;
  // add caption to the image
  try {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`;

    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("photo", image);
    form.append("caption", caption);

    if (topic_id) {
      form.append("message_thread_id", topic_id);
    }

    await axios.post(url, form, {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${form._boundary}`,
      },
    });
    return true;
  } catch (error) {
    console.error("Error sending image:", error);
    return false;
  }
};

module.exports = { sendTelegramMessage, sendTelegramImage };
