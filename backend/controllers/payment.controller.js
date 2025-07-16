import Razorpay from "razorpay";
import crypto from "crypto";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

// Init Razorpay
const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let totalAmount = 0;

		products.forEach((product) => {
			const amount = Math.round(product.price * 100); // paise
			totalAmount += amount * product.quantity;
		});

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			}
		}

		// Create Razorpay order
		const options = {
			amount: totalAmount, // in paise
			currency: "INR",
			receipt: `receipt_order_${Date.now()}`,
			notes: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(products.map((p) => ({
					id: p._id,
					quantity: p.quantity,
					price: p.price,
				}))),
			},
		};

		const order = await razorpay.orders.create(options);

		if (totalAmount >= 2000000) { // ₹20,000 in paise
			await createNewCoupon(req.user._id);
		}

		res.status(200).json({ orderId: order.id, amount: totalAmount });
	} catch (error) {
		console.error("Error processing checkout:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      products,
      totalAmount,
      couponId,
      discountPercentage
    } = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // ✅ Format products as expected by Order schema
    const formattedProducts = products.map(p => ({
      product: p.id,  // Assuming frontend sends `id`
      quantity: p.quantity,
      price: p.price
    }));

    // ✅ Create Order
    const order = await Order.create({
      user: userId,
      products: formattedProducts,
      totalAmount,
      couponCode: couponId || null,
      discountPercentage: discountPercentage || 0,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    // ✅ Invalidate coupon
    if (couponId) {
      await Coupon.findByIdAndUpdate(couponId, { isActive: false });
    }

    res.status(200).json({ success: true, orderId: order._id });

  } catch (error) {
    console.error("Error in verifyPayment:", error.message);
    res.status(500).json({ message: "Payment verification failed", error: error.message });
  }
};


// export const verifyPayment = async (req, res) => {
// 	try {
// 		const {
// 			razorpay_order_id,
// 			razorpay_payment_id,
// 			razorpay_signature,
// 			notes
// 		} = req.body;

// 		// Signature verification
// 		const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
// 		hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
// 		const generatedSignature = hmac.digest("hex");

// 		if (generatedSignature !== razorpay_signature) {
// 			return res.status(400).json({ success: false, message: "Payment verification failed" });
// 		}

// 		const { userId, couponCode, products } = JSON.parse(notes);

// 		if (couponCode) {
// 			await Coupon.findOneAndUpdate(
// 				{ code: couponCode, userId },
// 				{ isActive: false }
// 			);
// 		}

// 		const parsedProducts = JSON.parse(products);

// 		const newOrder = new Order({
// 			user: userId,
// 			products: parsedProducts.map((p) => ({
// 				product: p.id,
// 				quantity: p.quantity,
// 				price: p.price,
// 			})),
// 			totalAmount: parsedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0),
// 			razorpay_order_id: razorpay_order_id,
// 			razorpayPaymentId: razorpay_payment_id,
// 		});

// 		await newOrder.save();

// 		res.status(200).json({
// 			success: true,
// 			message: "Payment verified and order created.",
// 			orderId: newOrder._id,
// 		});
// 	} catch (error) {
// 		console.error("Error verifying payment:", error);
// 		res.status(500).json({ message: "Error verifying payment", error: error.message });
// 	}
// };
