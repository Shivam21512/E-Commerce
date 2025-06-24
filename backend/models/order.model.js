// models/order.model.js

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
				price: {
					type: Number,
					required: true,
					min: 0,
				},
			},
		],
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		razorpayOrderId: {
			type: String,
			required: true,
			unique: true,
		},
		coupon: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Coupon",
			required: false,
		},
		discountPercentage: {
			type: Number,
			required: false,
			default: 0,
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;









// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
// 	{
// 		user: {
// 			type: mongoose.Schema.Types.ObjectId,
// 			ref: "User",
// 			required: true,
// 		},
// 		products: [
// 			{
// 				product: {
// 					type: mongoose.Schema.Types.ObjectId,
// 					ref: "Product",
// 					required: true,
// 				},
// 				quantity: {
// 					type: Number,
// 					required: true,
// 					min: 1,
// 				},
// 				price: {
// 					type: Number,
// 					required: true,
// 					min: 0,
// 				},
// 			},
// 		],
// 		totalAmount: {
// 			type: Number,
// 			required: true,
// 			min: 0,
// 		},
// 		couponCode: {
// 			type: String,
// 			default: null,
// 		},
// 		razorpay_order_id: {
// 			type: String,
// 			required: true,
// 		},
// 		razorpay_payment_id: {
// 			type: String,
// 			required: true,
// 		},
// 		razorpay_signature: {
// 			type: String,
// 			required: true,
// 		},
// 		status: {
// 			type: String,
// 			enum: ["processing", "completed", "failed"],
// 			default: "processing",
// 		},
// 	},
// 	{ timestamps: true }
// );

// const Order = mongoose.model("Order", orderSchema);

// export default Order;
