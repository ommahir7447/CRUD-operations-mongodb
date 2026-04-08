import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "../services/api";
import { CartContext } from "../context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    getProduct(id).then(response => {
      setProduct(response.data.data);
    });
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) return <div className="container"><div className="loading-state">Loading...</div></div>;

  return (
    <div className="container">
      <div className="product-detail">
        <div className="product-detail-image">
          <img src={product.image} alt={product.title} />
        </div>
        <div className="product-detail-info">
          <div className="detail-header">
            <span className="category">{product.category}</span>
            <span className="brand-tag">{product.brand}</span>
          </div>
          <h2>{product.title}</h2>
          
          <div className="rating-container large">
            <span className="star">★</span>
            <span>{product.rating} Rating</span>
          </div>

          <p className="description">{product.description}</p>
          
          <div className="features-list">
            <h4>Key Features:</h4>
            <ul>
              {product.features?.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="price-action">
            <h3 className="price">${product.price.toFixed(2)}</h3>
            <span className={product.inStock ? "stock-status in-stock" : "stock-status out-of-stock"}>
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
          
          <button 
            className="add-to-cart-btn" 
            onClick={handleAddToCart}
            disabled={!product.inStock}
            style={{ opacity: product.inStock ? 1 : 0.5, cursor: product.inStock ? 'pointer' : 'not-allowed' }}
          >
            {product.inStock ? "Add to Cart" : "Unavailable"}
          </button>
          {added && <p className="success-text">✅ Added to cart!</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
