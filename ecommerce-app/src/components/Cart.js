import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

const Cart = () => {
  const { cart, removeFromCart } = useContext(CartContext);

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="container cart-page">
      <h2 className="page-title">Your Shopping Cart</h2>
      {cart.length === 0 ? (
        <div className="empty-cart-state">
          <div className="empty-cart-icon">🛒</div>
          <h3 className="empty-cart-heading">Your cart is empty</h3>
          <p className="empty-cart-text">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="btn-primary mt-4">Start Shopping</Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-container">
            {cart.map((item, index) => (
              <div key={`${item._id || item.id}-${index}`} className="cart-item-card">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="cart-item-details">
                  <h4>{item.title}</h4>
                  <p className="cart-item-brand">{item.brand}</p>
                </div>
                <div className="cart-item-price-actions">
                  <span className="cart-item-price">${item.price.toFixed(2)}</span>
                  <button className="btn-remove" onClick={() => removeFromCart(item._id || item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal ({cart.length} items)</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-text">Free</span>
            </div>
            <div className="summary-row">
              <span>Tax (10%)</span>
              <span>${(total * 0.1).toFixed(2)}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total-row">
              <span>Total</span>
              <span>${(total * 1.1).toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="btn-primary w-100 mt-4" style={{display: 'block', textAlign: 'center'}}>
              Proceed to Checkout
            </Link>
            <Link to="/" className="btn-secondary w-100 mt-3" style={{display: 'block', textAlign: 'center'}}>
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
