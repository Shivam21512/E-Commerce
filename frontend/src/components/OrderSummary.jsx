import React from 'react';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import axios from "../lib/axios";
import { useCartStore } from '../stores/useCartStore';
import { useUserStore } from '../stores/useUserStore';

// ✅ Razorpay script loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const OrderSummary = () => {
  const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();
  const { user } = useUserStore()
  const savings = subtotal - total;
  const formattedSubtotal = subtotal.toFixed(2);
  const formattedTotal = total.toFixed(2);
  const formattedSavings = savings.toFixed(2);


const handlePayment = async () => {
  const isScriptLoaded = await loadRazorpayScript();
  if (!isScriptLoaded) {
    alert("Failed to load Razorpay SDK");
    return;
  }

  try {
    const finalAmount = Math.round(total * 100);

    const res = await axios.post("/payments/create-order", {
      amount: finalAmount,
      userId: user._id,
      products: cart.map((item) => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      couponId: coupon?._id || null,
      discountPercentage: coupon?.discountPercentage || 0,
    });

    const { orderId, amount, notes } = res.data;

// Store notes in a variable in the outer scope
const razorpayNotes = notes;

const options = {
  key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  amount,
  currency: "INR",
  name: "E-Commerce Store",
  description: "Purchase products",
  order_id: orderId,
  notes: razorpayNotes, // this goes to Razorpay UI
  handler: async (response) => {
    try {
      await axios.post("/payments/verify", {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        notes: razorpayNotes, // ✅ persist it here!
      });

      // success redirect here
    } catch (err) {
      console.error("❌ Payment verification failed:", err);
      alert("Payment verification Successfull");
    }
  },
  prefill: {
    name: user.name,
    email: user.email,
  },
  theme: { color: "#10B981" },
};


    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error("Razorpay Error:", error.response?.data || error.message);
    alert("Payment failed. Try again.");
  }
};

  return (
    <motion.div
      className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className='text-xl font-semibold text-emerald-400'>Order summary</p>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <dl className='flex items-center justify-between gap-4'>
            <dt className='text-base font-medium text-gray-300'>Original price</dt>
            <dd className='text-base font-medium text-white'>₹{formattedSubtotal}</dd>
          </dl>

          {savings > 0 && (
            <dl className='flex items-center justify-between gap-4'>
              <dt className='text-base font-normal text-gray-300'>Savings</dt>
              <dd className='text-base font-medium text-emerald-400'>-₹{formattedSavings}</dd>
            </dl>
          )}

          {coupon && isCouponApplied && (
            <dl className='flex items-center justify-between gap-4'>
              <dt className='text-base font-normal text-gray-300'>Coupon ({coupon.code})</dt>
              <dd className='text-base font-medium text-emerald-400'>-{coupon.discountPercentage}%</dd>
            </dl>
          )}

          <dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
            <dt className='text-base font-bold text-white'>Total</dt>
            <dd className='text-base font-bold text-emerald-400'>₹{formattedTotal}</dd>
          </dl>
        </div>

        <motion.button
          className='flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePayment}
        >
          Proceed to Checkout
        </motion.button>

        <div className='flex items-center justify-center gap-2'>
          <span className='text-sm font-normal text-gray-400'>or</span>
          <Link
            to='/'
            className='inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline'
          >
            Continue Shopping
            <MoveRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSummary;