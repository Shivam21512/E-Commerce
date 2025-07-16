import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import Confetti from "react-confetti";
import axios from "../lib/axios";

const PurchaseSuccessPage = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const { cart, total, clearCart, coupon } = useCartStore();
  const { user } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const razorpay_order_id = urlParams.get("razorpay_order_id");
      const razorpay_payment_id = urlParams.get("razorpay_payment_id");
      const razorpay_signature = urlParams.get("razorpay_signature");

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        setError("Missing payment info in URL.");
        setIsProcessing(false);
        return;
      }

      try {
        const res = await axios.post("/payments/verify-payment", {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          userId: user?._id,
          products: cart,
          totalAmount: total,
          couponCode: coupon?.code || null,
        });

        if (res.data.success) {
          setOrderId(res.data.orderId);
          clearCart();
        } else {
          setError("Verification failed: " + (res.data.message || "Unknown error"));
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Payment verification failed. Please contact support.");
      } finally {
        setIsProcessing(false);
      }
    };

    verifyPayment();
  }, [clearCart, cart, total, user, coupon]);

  if (isProcessing) {
    return <div className="text-center text-white mt-10">Verifying payment...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        <p>Error: {error}</p>
        <Link
          to="/"
          className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        style={{ zIndex: 99 }}
        numberOfPieces={700}
        recycle={false}
      />

      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">
            <CheckCircle className="text-emerald-400 w-16 h-16 mb-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2">
            Purchase Successful!
          </h1>
          <p className="text-gray-300 text-center mb-2">
            Thank you for your order. We’re processing it now.
          </p>
          <p className="text-emerald-400 text-center text-sm mb-6">
            Check your email for order details and updates.
          </p>

          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Order number</span>
              <span className="text-sm font-semibold text-emerald-400">
                {orderId ? `#${orderId}` : "Loading..."}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Estimated delivery</span>
              <span className="text-sm font-semibold text-emerald-400">3–5 business days</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
              disabled
            >
              <HandHeart className="mr-2" size={18} />
              Thanks for trusting us!
            </button>
            <Link
              to="/"
              className="w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              Continue Shopping
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;























// import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useCartStore } from "../stores/useCartStore";
// import { useUserStore } from "../stores/useUserStore";
// import Confetti from "react-confetti";
// import axios from "../lib/axios";

// const PurchaseSuccessPage = () => {
// 	const [isProcessing, setIsProcessing] = useState(true);
// 	const [error, setError] = useState(null);
// 	const [orderId, setOrderId] = useState(null);

// 	const { cartItems, cartTotal, clearCart, couponCode } = useCartStore();
// 	const { user } = useUserStore(); // assuming user store
// 	const navigate = useNavigate();

// 	useEffect(() => {
// 		const verifyPayment = async () => {
// 			const urlParams = new URLSearchParams(window.location.search);
// 			const razorpay_order_id = urlParams.get("razorpay_order_id");
// 			const razorpay_payment_id = urlParams.get("razorpay_payment_id");
// 			const razorpay_signature = urlParams.get("razorpay_signature");

// 			if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
// 				setError("Missing Razorpay payment info in URL");
// 				setIsProcessing(false);
// 				return;
// 			}

// 			try {
// 				const res = await axios.post("/payments/verify-payment", {
// 					razorpay_order_id,
// 					razorpay_payment_id,
// 					razorpay_signature,
// 					userId: user._id,
// 					products: cartItems,
// 					totalAmount: cartTotal,
// 					couponCode,
// 				});

// 				if (res.data.success) {
// 					setOrderId(res.data.orderId);
// 					clearCart();
// 				} else {
// 					setError("Verification failed: " + res.data.message);
// 				}
// 			} catch (err) {
// 				console.error("Verification error:", err);
// 				setError("Payment verification failed. Please contact support.");
// 			} finally {
// 				setIsProcessing(false);
// 			}
// 		};

// 		verifyPayment();
// 	}, [clearCart, cartItems, cartTotal, user, couponCode]);

// 	if (isProcessing)
// 		return <div className="text-center text-white mt-10">Verifying payment...</div>;
// 	if (error)
// 		return <div className="text-center text-red-500 mt-10">Error: {error}</div>;

// 	return (
// 		<div className="h-screen flex items-center justify-center px-4">
// 			<Confetti
// 				width={window.innerWidth}
// 				height={window.innerHeight}
// 				gravity={0.1}
// 				style={{ zIndex: 99 }}
// 				numberOfPieces={700}
// 				recycle={false}
// 			/>

// 			<div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10">
// 				<div className="p-6 sm:p-8">
// 					<div className="flex justify-center">
// 						<CheckCircle className="text-emerald-400 w-16 h-16 mb-4" />
// 					</div>
// 					<h1 className="text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2">
// 						Purchase Successful!
// 					</h1>
// 					<p className="text-gray-300 text-center mb-2">
// 						Thank you for your order. We’re processing it now.
// 					</p>
// 					<p className="text-emerald-400 text-center text-sm mb-6">
// 						Check your email for order details and updates.
// 					</p>

// 					<div className="bg-gray-700 rounded-lg p-4 mb-6">
// 						<div className="flex items-center justify-between mb-2">
// 							<span className="text-sm text-gray-400">Order number</span>
// 							<span className="text-sm font-semibold text-emerald-400">
// 								{orderId ? `#${orderId}` : "Loading..."}
// 							</span>
// 						</div>
// 						<div className="flex items-center justify-between">
// 							<span className="text-sm text-gray-400">Estimated delivery</span>
// 							<span className="text-sm font-semibold text-emerald-400">3–5 business days</span>
// 						</div>
// 					</div>

// 					<div className="space-y-4">
// 						<button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center">
// 							<HandHeart className="mr-2" size={18} />
// 							Thanks for trusting us!
// 						</button>
// 						<Link
// 							to="/"
// 							className="w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
// 						>
// 							Continue Shopping
// 							<ArrowRight className="ml-2" size={18} />
// 						</Link>
// 					</div>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default PurchaseSuccessPage;
