const axios = require("axios");
const config = require("../config/config");
const { createPayment, getAllPayments } = require("../models/paymentModel");
const createHttpError = require("http-errors");

const createOrder = async (req, res, next) => {
  try {
    const { amount, email } = req.body;
    const reference = `ref_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    const payload = {
      email,
      amount: amount * 100, // Convert to kobo/cents
      currency: "KES",
      reference,
      callback_url: "http://localhost:5173/payment/confirmation"
    };

    const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        payload,
        {
          headers: {
            Authorization: `Bearer ${config.paystackSecretKey}`,
            "Content-Type": "application/json"
          }
        }
    );

    const { data } = response.data;

    res.status(200).json({
      success: true,
      order: {
        id: data.reference,
        amount: amount * 100,
        currency: "KES",
        authorization_url: data.authorization_url,
        reference: data.reference
      }
    });
  } catch (error) {
    console.error("Paystack Init Error:", error.response?.data || error.message);
    return next(createHttpError(500, "Failed to initialize payment"));
  }
};


const verifyPayment = async (req, res, next) => {
  try {
    const reference = req.query.reference || req.body.reference;

    if (!reference) {
      return next(createHttpError(400, "No reference provided for verification"));
    }

    const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${config.paystackSecretKey}`
          }
        }
    );

    const { data } = response.data;

    if (data.status === "success") {
      res.json({
        success: true,
        message: "Payment verified successfully!",
        data: {
          reference: data.reference,
          amount: data.amount / 100,
          paystack_reference: data.reference,
          transaction_id: data.id,
          status: data.status
        }
      });
    } else {
      return next(createHttpError(400, "Payment not successful"));
    }
  } catch (error) {
    console.error("Verification error:", error.response?.data || error.message);
    return next(createHttpError(500, "Verification failed"));
  }
};


const webHookVerification = async (req, res, next) => {
  try {
    const secret = config.paystackWebhookSecret;
    const signature = req.headers["x-paystack-signature"];

    if (!signature) {
      return next(createHttpError(400, "❌ No Paystack signature found!"));
    }

    const body = JSON.stringify(req.body);

    // 🛑 Verify the signature
    const expectedSignature = crypto
      .createHmac("sha512", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature === signature) {
      console.log("✅ Webhook verified:", req.body);

      // ✅ Process payment (e.g., update DB, send confirmation email)
      if (req.body.event === "charge.success") {
        const payment = req.body.data;
        console.log(`💰 Payment Captured: ${payment.amount / 100} KES`);

        // Add Payment Details in Database using the model function
        const paymentData = {
          paymentId: payment.id,
          orderId: payment.reference,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: payment.status,
          method: payment.channel,
          email: payment.customer.email,
          contact: payment.customer.phone,
          createdAt: new Date(payment.paid_at)
        };
        
        await createPayment(paymentData);
      }

      res.json({ success: true });
    } else {
      const error = createHttpError(400, "❌ Invalid Signature!");
      return next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Get all payments
const getPayments = async (req, res, next) => {
  try {
    // Get all payments using the model function
    const payments = await getAllPayments();
    
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, verifyPayment, webHookVerification, getPayments };
