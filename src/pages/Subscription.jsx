import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/Subscription.css";
import { API } from "../api/config";
import jsPDF from "jspdf"; // ✅ Import jsPDF
import WelcomeHeader from "../components/welcomeheader";

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ===== COUPON STATE ===== */
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  /* ===== RECEIPT STATE ===== */
  const [receipt, setReceipt] = useState(null);

  /* ================= LOAD PLANS ================= */
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get(API.SUBSCRIPTION);
      setPlans(res.data);
    } catch (err) {
      console.error(err);
      setError("Session expired. Please login again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= APPLY COUPON ================= */
  const applyCoupon = async () => {
    if (!couponCode) return;

    try {
      const res = await api.post(API.APPLY_VALID_COUPON, {
        code: couponCode,
      });

      if (!res.data.valid) {
        setCouponError(res.data.message || "Invalid coupon");
        setAppliedCoupon(null);
        return;
      }

      setAppliedCoupon(res.data.coupon);
      setCouponError("");
    } catch (err) {
      console.error(err);
      setCouponError("Failed to apply coupon");
      setAppliedCoupon(null);
    }
  };

  /* ================= PRICE CALCULATION ================= */
  const getDiscountedPrice = (amount) => {
    if (!appliedCoupon) return amount;

    let finalAmount = amount;

    if (appliedCoupon.discount_type === "percentage") {
      finalAmount -= (finalAmount * appliedCoupon.discount_value) / 100;
    } else {
      finalAmount -= appliedCoupon.discount_value;
    }

    return Math.max(0, Math.round(finalAmount));
  };

  /* ================= BUY SUBSCRIPTION ================= */
  const buySubscription = async (plan) => {
    try {
      const finalAmount = getDiscountedPrice(plan.amount);

      const orderRes = await api.post(
        API.SUBSCRIPTION_CREATE_ORDER(plan.id),
        {
          amount: finalAmount,
          coupon_code: appliedCoupon?.code || null,
        }
      );

      const { order_id, amount, currency, razorpay_key } = orderRes.data;

      const options = {
        key: razorpay_key,
        amount,
        currency,
        name: "Your Platform Name",
        description: "Subscription Purchase",
        order_id,

        handler: async (response) => {
          await api.post(API.VERIFY_SUBSCRIPTION_PAYMENT, {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            plan_id: plan.id,
            coupon_code: appliedCoupon?.code || null,
          });

          // Generate receipt
          const receiptData = {
            planName: plan.plan_name,
            originalAmount: plan.amount,
            finalAmount,
            coupon: appliedCoupon?.code || null,
            paymentId: response.razorpay_payment_id,
            date: new Date().toLocaleString(),
          };
          setReceipt(receiptData);

          alert("🎉 Subscription activated!");
          fetchPlans();
        },

        theme: {
          color: "#22c55e",
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
  console.error("PAYMENT ERROR:", err.response?.data || err.message);
  alert(
    err.response?.data?.error ||
    err.response?.data?.detail ||
    "Payment failed. Please try again."
  );
}

    };
  /* ================= PDF RECEIPT ================= */
  const downloadReceiptPDF = () => {
    if (!receipt) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("🧾 Payment Receipt", 20, 20);

    doc.setFontSize(12);
    doc.text(`Plan: ${receipt.planName}`, 20, 40);
    doc.text(`Original Amount: ₹${receipt.originalAmount}`, 20, 50);
    if (receipt.coupon) doc.text(`Coupon Applied: ${receipt.coupon}`, 20, 60);
    doc.text(`Paid Amount: ₹${receipt.finalAmount}`, 20, receipt.coupon ? 70 : 60);
    doc.text(`Payment ID: ${receipt.paymentId}`, 20, receipt.coupon ? 80 : 70);
    doc.text(`Date: ${receipt.date}`, 20, receipt.coupon ? 90 : 80);

    doc.save("subscription_receipt.pdf");
  };

  /* ================= UI STATES ================= */
  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="subscription-page">
      <WelcomeHeader  />

      <h1>Choose Your Subscription Plan</h1>

      {/* ================= COUPON SECTION ================= */}
      <div className="coupon-section">
        <input
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        <button onClick={applyCoupon}>Apply</button>

        {couponError && <p className="coupon-error">{couponError}</p>}
        {appliedCoupon && (
          <p className="coupon-success">🎉 {appliedCoupon.code} applied</p>
        )}
      </div>

      {/* ================= PLANS ================= */}
      <div className="plans-container">
        {plans.map((plan) => {
          const discountedPrice = getDiscountedPrice(plan.amount);

          return (
            <div
              key={plan.id}
              className={`plan-card ${plan.is_active ? "plan-active" : ""}`}
            >
              {plan.is_active && <span className="active-badge">Subscribed</span>}

              <h2>{plan.plan_name}</h2>

              {appliedCoupon ? (
                <p>
                  <span className="old-price">₹{plan.amount}</span>
                  <strong> ₹{discountedPrice}</strong>
                </p>
              ) : (
                <p>₹{plan.amount}</p>
              )}

              <p>{plan.duration_days} days</p>

              <ul className="features">
                <li>✔ Full course access</li>
                <li>✔ Certificate</li>
                <li>✔ Mobile & TV access</li>
                <li>✔ Lifetime access</li>
              </ul>

              <button
                disabled={plan.is_active}
                onClick={() => buySubscription(plan)}
              >
                {plan.is_active ? "Subscribed" : "Buy"}
              </button>
            </div>
          );
        })}
      </div>

      {/* ================= RECEIPT ================= */}
      {receipt && (
        <div className="receipt">
          <h2>🧾 Payment Receipt</h2>
          <p>
            <strong>Plan:</strong> {receipt.planName}
          </p>
          <p>
            <strong>Original Amount:</strong> ₹{receipt.originalAmount}
          </p>
          {receipt.coupon && (
            <p>
              <strong>Coupon Applied:</strong> {receipt.coupon}
            </p>
          )}
          <p>
            <strong>Paid Amount:</strong> ₹{receipt.finalAmount}
          </p>
          <p>
            <strong>Payment ID:</strong> {receipt.paymentId}
          </p>
          <p>
            <strong>Date:</strong> {receipt.date}
          </p>

          <button onClick={downloadReceiptPDF}>Download PDF</button>
        </div>
      )}
    </div>
  );
};

export default Subscription;
