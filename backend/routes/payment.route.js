import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";
import Order from "../models/order.model.js";

dotenv.config();
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay Order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, userId, products, couponId, discountPercentage } = req.body;

    if (!amount || !userId || !products) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId,
        products: JSON.stringify(products),
        amount,
        couponId: couponId || "",
        discountPercentage: discountPercentage || 0,
      },
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ orderId: order.id, amount: order.amount, notes: options.notes });
  } catch (err) {
    console.error("❌ Razorpay order creation failed:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// ✅ Verify Razorpay Payment
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      notes,
    } = req.body;

    console.log("Incoming verify request:", req.body); // ✅ Log everything

    if (!notes || !notes.userId || !notes.products || !notes.amount) {
      return res.status(400).json({ error: "Missing data in notes" });
    }

    // Signature verification
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const parsedProducts = JSON.parse(notes.products);

    const newOrder = new Order({
      user: notes.userId,
      products: parsedProducts,
      totalAmount: notes.amount,
      couponCode: notes.couponId || null,
      discountPercentage: notes.discountPercentage || 0,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    await newOrder.save();
    res.status(200).json({ success: true, orderId: newOrder._id });
  } catch (err) {
    console.error("❌ Payment verify error:", err);
    res.status(500).json({ error: "Server error during verification" });
  }
});


export default router;
