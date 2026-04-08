import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/api";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(response => {
        setProducts(response.data.data || []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h2 className="page-title">Featured Products</h2>
        <div className="loading-state">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="page-title">Featured Products</h2>
      <div className="product-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <div className="product-image-container">
              <img src={product.image} alt={product.title} className="product-image" />
              {!product.inStock && <div className="out-of-stock-badge">Out of Stock</div>}
            </div>
            <div className="product-info">
              <span className="brand-tag">{product.brand}</span>
              <h4>{product.title}</h4>
              <div className="rating-container">
                <span className="star">★</span>
                <span>{product.rating}</span>
              </div>
              <p className="price">${product.price.toFixed(2)}</p>
              <Link to={`/product/${product._id}`}>
                <button className="view-details-btn">View Details</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
