const crypto = require("crypto");
const axios = require("axios");
const getHash = (data) => {
  const hmac = crypto.createHmac("sha512", process.env.ABA_PAYWAY_API_KEY);
  hmac.update(data);
  return hmac.digest("base64");
};

const createPayment = async (req, res, next) => {
  try {
    // const items = Buffer.from(JSON.stringify(req.body.products)).toString(
    //   "base64"
    // );
    // [{'name':'test','quantity':'1','price':'1.00'}]

    const req_time = Math.floor(Date.now() / 1000);
    const transactionId = req_time;
    const merchant_id = process.env.ABA_PAYWAY_MERCHANT_ID;
    const amount = req.body.total_price || 168;
    const firstName = "Kimlong";
    const lastName = "Chann";
    const email = "kimlong5244@gmail.com";
    const phone = "086961256";
    const return_params = "Hello world";
    const type = "purchase";
    const currency = req.body.currency || "USD";
    const payment_option = req.body.payment_option || "abapay";
    const shipping = req.body.shipping || 0;
    const view_type = "checkout";
    const cancel_url = req.body.cancel_url || process.env.ABA_PAYWAY_CANCEL_URL;
    const continue_success_url =
      req.body.continue_success_url || process.env.ABA_PAYWAY_SUCCESS_URL;
    const dataString =
      req_time +
      merchant_id +
      transactionId +
      amount +
      // items +
      shipping +
      firstName +
      lastName +
      email +
      phone +
      type +
      payment_option +
      cancel_url +
      continue_success_url +
      currency +
      return_params;

    const hash = getHash(dataString);

    req.session.req_time = req_time;
    req.session.tran_id = transactionId;
    req.session.otpExpiry = Date.now() + 60000 * 2; // 2 minutes expiry

    // form data
    // const formData = new FormData();
    // formData.append("hash", hash);
    // formData.append("tran_id", transactionId);
    // formData.append("amount", amount);
    // formData.append("firstname", firstName);
    // formData.append("lastname", lastName);
    // formData.append("email", email);
    // formData.append("phone", phone);
    // formData.append("return_params", return_params);
    // formData.append("shipping", shipping);
    // formData.append("currency", currency);
    // formData.append("type", type);
    // formData.append("merchant_id", merchant_id);
    // formData.append("req_time", req_time);
    // formData.append("payment_option", payment_option);
    // formData.append("view_type", view_type);
    // formData.append("continue_success_url", continue_success_url);
    // formData.append("cancel_url", cancel_url);

    // const result = await axios.post(process.env.ABA_PAYWAY_API_URL, formData, {
    //   headers: {
    //     "Content-Type": "multipart/form-data",
    //   },
    // });

    // return res.send(result.data);

    res.send(`
        <form action="${process.env.ABA_PAYWAY_API_URL}" method="POST" id="aba_merchant_request">
            <input type="hidden" name="hash" value="${hash}">
            <input type="hidden" name="tran_id" value="${transactionId}">
            <input type="hidden" name="amount" value="${amount}">
            <input type="hidden" name="firstname" value="${firstName}">
            <input type="hidden" name="lastname" value="${lastName}">
            <input type="hidden" name="email" value="${email}">
            <input type="hidden" name="phone" value="${phone}">
            <input type="hidden" name="return_params" value="${return_params}">
            <input type="hidden" name="return_param" value="${return_params}">
            <input type="hidden" name="shipping" value="${shipping}">
            <input type="hidden" name="currency" value="${currency}">
            <input type="hidden" name="type" value="${type}">
            <input type="hidden" name="merchant_id" value="${process.env.ABA_PAYWAY_MERCHANT_ID}">
            <input type="hidden" name="req_time" value="${req_time}">
            <input type="hidden" name="payment_option" value="${payment_option}">
            <input type="hidden" name="view_type" value="${view_type}">
            <input type="hidden" name="continue_success_url" value="${continue_success_url}">
            <input type="hidden" name="cancel_url" value="${cancel_url}">
        </form>
        <script>
              document.getElementById("aba_merchant_request").submit();
        </script>
        `);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const checkPayment = async (req, res, next) => {
  try {
    if (!req.session.req_time || !req.session.tran_id) {
      return res.send("Invalid request");
    }

    if (Date.now() > req.session.otpExpiry) {
      return res.send("OTP expired");
    }

    const dataString =
      req.session.req_time +
      process.env.ABA_PAYWAY_MERCHANT_ID +
      req.session.tran_id;

    const hash = getHash(dataString);

    // send post request to aba payway

    const result = axios.post(
      "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/check-transaction-2",
      {
        hash,
        tran_id: req.body.tran_id,
        merchant_id: process.env.ABA_PAYWAY_MERCHANT_ID,
        req_time: req.body.req_time,
      }
    );
    if (result.data.status.code == "00") {
      return res.send("Payment success");
    }
    res.send("Payment failed");
  } catch (err) {
    next(err);
  }
};

module.exports = { createPayment, checkPayment };
