import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { processPayment } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Checkout = () => {
  const { cart, clearCart } = useContext(CartContext);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', address: '', city: '', zip: '',
    cardName: '', cardNumber: '', exp: '', cvv: ''
  });
  const [errors, setErrors] = useState({});

  const total = cart.reduce((acc, item) => acc + item.price, 0);
  const tax = total * 0.1;
  const finalTotal = total + tax;

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.zip) newErrors.zip = 'Zip code is required';
    if (!formData.cardName) newErrors.cardName = 'Name on card is required';
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g,'').length < 13) newErrors.cardNumber = 'Valid card number is required';
    if (!formData.exp || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.exp)) newErrors.exp = 'Use MM/YY format';
    if (!formData.cvv || !/^\d{3,4}$/.test(formData.cvv)) newErrors.cvv = '3 or 4 digit CVV';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'cardNumber') {
      value = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    }
    if (e.target.name === 'exp') {
      value = value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').slice(0, 5);
    }
    setFormData({ ...formData, [e.target.name]: value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!validate()) return;

    setIsProcessing(true);
    setPaymentResult(null);

    try {
      const paymentData = {
        amount: finalTotal.toFixed(2),
        cardNumber: formData.cardNumber,
        cardName: formData.cardName,
        expiry: formData.exp,
        cvv: formData.cvv,
        items: cart.map(item => ({ id: item._id || item.id, title: item.title, price: item.price })),
      };

      const res = await processPayment(paymentData);
      const result = res.data;

      setPaymentResult({ type: 'success', ...result });
      clearCart();
    } catch (err) {
      const errData = err.response?.data;
      setPaymentResult({
        type: 'error',
        message: errData?.message || 'Payment failed. Please try again.',
        errorCode: errData?.errorCode,
        transactionId: errData?.transactionId,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Payment Success Screen ─────────────────────────────────────────────────
  if (paymentResult?.type === 'success') {
    return (
      <div className="container">
        <div className="payment-success">
          <div className="success-icon">✅</div>
          <h2>Payment Successful!</h2>
          <p>Your order has been placed successfully.</p>
          <div className="transaction-details">
            <div className="txn-row"><span>Transaction ID</span><span className="txn-id">{paymentResult.transactionId}</span></div>
            <div className="txn-row"><span>Amount Charged</span><span><strong>${paymentResult.amount}</strong></span></div>
            <div className="txn-row"><span>Card Ending</span><span>•••• {paymentResult.cardLast4}</span></div>
            <div className="txn-row"><span>Date</span><span>{new Date(paymentResult.timestamp).toLocaleString()}</span></div>
          </div>
          <button className="btn-primary" onClick={() => navigate('/')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart-state">
          <div className="empty-cart-icon">🛒</div>
          <h3 className="empty-cart-heading">No items to checkout</h3>
          <p className="empty-cart-text">Please add some items to your cart before proceeding to checkout.</p>
          <Link to="/" className="btn-primary mt-4">Return to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <h2 className="page-title">Checkout</h2>

      {paymentResult?.type === 'error' && (
        <div className="alert alert-error">
          ⚠️ {paymentResult.message}
          {paymentResult.transactionId && (
            <div className="txn-small">Ref: {paymentResult.transactionId}</div>
          )}
        </div>
      )}

      <div className="checkout-content">
        <div className="checkout-form-container">
          <form onSubmit={handleCheckout} className="checkout-form" noValidate>
            <div className="form-section">
              <h3 className="section-title">Shipping Information</h3>
              <div className="form-group full">
                <label>Full Name</label>
                <input type="text" name="name" required onChange={handleInputChange} placeholder="John Doe"
                  className={errors.name ? 'input-error' : ''} />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="form-group full">
                <label>Email Address</label>
                <input type="email" name="email" required onChange={handleInputChange} placeholder="john@example.com"
                  className={errors.email ? 'input-error' : ''} />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className="form-group full">
                <label>Address</label>
                <input type="text" name="address" required onChange={handleInputChange} placeholder="123 Main St"
                  className={errors.address ? 'input-error' : ''} />
                {errors.address && <span className="field-error">{errors.address}</span>}
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>City</label>
                  <input type="text" name="city" required onChange={handleInputChange} placeholder="New York"
                    className={errors.city ? 'input-error' : ''} />
                  {errors.city && <span className="field-error">{errors.city}</span>}
                </div>
                <div className="form-group half">
                  <label>Zip Code</label>
                  <input type="text" name="zip" required onChange={handleInputChange} placeholder="10001"
                    className={errors.zip ? 'input-error' : ''} />
                  {errors.zip && <span className="field-error">{errors.zip}</span>}
                </div>
              </div>
            </div>

            <div className="form-section pt-4">
              <h3 className="section-title">Payment Details</h3>
              <div className="card-hint">
                💡 <strong>Test:</strong> Card starting with <code>0000</code> → declined &nbsp;|&nbsp; <code>9999</code> → insufficient funds &nbsp;|&nbsp; others → success
              </div>
              <div className="form-group full">
                <label>Name on Card</label>
                <input type="text" name="cardName" required onChange={handleInputChange} placeholder="JOHN DOE"
                  className={errors.cardName ? 'input-error' : ''} />
                {errors.cardName && <span className="field-error">{errors.cardName}</span>}
              </div>
              <div className="form-group full">
                <label>Card Number</label>
                <input type="text" name="cardNumber" required onChange={handleInputChange}
                  value={formData.cardNumber} placeholder="0000 0000 0000 0000" maxLength={19}
                  className={errors.cardNumber ? 'input-error' : ''} />
                {errors.cardNumber && <span className="field-error">{errors.cardNumber}</span>}
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Expiry Date</label>
                  <input type="text" name="exp" required onChange={handleInputChange}
                    value={formData.exp} placeholder="MM/YY" maxLength={5}
                    className={errors.exp ? 'input-error' : ''} />
                  {errors.exp && <span className="field-error">{errors.exp}</span>}
                </div>
                <div className="form-group half">
                  <label>CVV</label>
                  <input type="text" name="cvv" required onChange={handleInputChange} placeholder="123" maxLength={4}
                    className={errors.cvv ? 'input-error' : ''} />
                  {errors.cvv && <span className="field-error">{errors.cvv}</span>}
                </div>
              </div>
            </div>

            <button type="submit" id="checkout-submit-btn" className="btn-primary w-100 mt-4 checkout-submit-btn" disabled={isProcessing}>
              {isProcessing
                ? <span className="btn-loading"><span className="spinner"></span> Processing Payment…</span>
                : `Pay $${finalTotal.toFixed(2)}`}
            </button>
          </form>
        </div>

        <div className="checkout-sidebar">
          <div className="cart-summary-card">
            <h3>Order Summary</h3>
            <div className="checkout-items-list">
              {cart.map((item, index) => (
                <div key={`${item._id || item.id}-${index}`} className="checkout-mini-item">
                  <div className="checkout-mini-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="checkout-mini-details">
                    <span className="mini-title">{item.title}</span>
                    <span className="mini-price">${item.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
            <div className="summary-row"><span>Shipping</span><span className="free-text">Free</span></div>
            <div className="summary-row"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="summary-divider"></div>
            <div className="summary-row total-row"><span>Total</span><span>${finalTotal.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
