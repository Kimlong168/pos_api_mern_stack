const express = require("express");

const router = express.Router();

const abaPaywayController = require("../controllers/abaPayway.controller");

const {
  validateAbaPayBody,
  validationMiddleware,
} = require("../utils/validationHelpers");

router.post(
  "/checkout",
  validateAbaPayBody(),
  validationMiddleware,
  abaPaywayController.createPayment
);

router.post("/check-payment", abaPaywayController.checkPayment);


module.exports = router;
