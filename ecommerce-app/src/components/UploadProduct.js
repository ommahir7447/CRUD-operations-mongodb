import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['electronics', 'accessories', 'home', 'apparel', 'other'];

const UploadProduct = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: '', brand: '', inStock: 'true', features: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="empty-cart-state">
          <div className="empty-cart-icon">🔒</div>
          <h3 className="empty-cart-heading">Authentication Required</h3>
          <p className="empty-cart-text">Please log in to upload products.</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  const validate = () => {
    const newErrors = {};
    if (!formData.title || formData.title.length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (!formData.description || formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) < 0) newErrors.price = 'Valid price is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    setServerError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ ...errors, image: 'Only image files (JPEG, PNG, GIF, WEBP) are allowed' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image size must be less than 5MB' });
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors({ ...errors, image: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    setSuccess('');

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));
      if (imageFile) data.append('image', imageFile);

      const res = await createProduct(data);
      setSuccess(`✅ Product "${res.data.data.title}" uploaded successfully!`);
      setFormData({ title: '', description: '', price: '', category: '', brand: '', inStock: 'true', features: '' });
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        const fieldErrors = {};
        serverErrors.forEach(({ field, message }) => { fieldErrors[field] = message; });
        setErrors(fieldErrors);
      } else {
        setServerError(err.response?.data?.message || 'Upload failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container upload-page">
      <h2 className="page-title">Upload New Product</h2>

      {serverError && <div className="alert alert-error"><span>⚠️</span> {serverError}</div>}
      {success && <div className="alert alert-success"><span>✅</span> {success}</div>}

      <div className="upload-layout">
        {/* ── Preview Panel ─────────────────────────────────────────────── */}
        <div className="upload-preview-panel">
          <div className="upload-preview-card">
            <div className="upload-image-drop" onClick={() => document.getElementById('product-image').click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="preview-img" />
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📷</span>
                  <p>Click to upload image</p>
                  <small>JPEG, PNG, GIF, WEBP — max 5 MB</small>
                </div>
              )}
            </div>
            <input
              id="product-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            {errors.image && <span className="field-error">{errors.image}</span>}
            {imageFile && (
              <div className="file-meta">
                <span>📄 {imageFile.name}</span>
                <span>{(imageFile.size / 1024).toFixed(1)} KB</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Form Panel ─────────────────────────────────────────────────── */}
        <div className="upload-form-panel">
          <form onSubmit={handleSubmit} className="upload-form" encType="multipart/form-data">
            <div className="form-group full">
              <label htmlFor="product-title">Product Title *</label>
              <input id="product-title" type="text" name="title" value={formData.title} onChange={handleChange}
                placeholder="e.g., Premium Wireless Headphones" className={errors.title ? 'input-error' : ''} />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className="form-group full">
              <label htmlFor="product-desc">Description *</label>
              <textarea id="product-desc" name="description" value={formData.description} onChange={handleChange}
                placeholder="Describe the product in detail..." rows={4}
                className={errors.description ? 'input-error' : ''} />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="product-price">Price ($) *</label>
                <input id="product-price" type="number" name="price" value={formData.price} onChange={handleChange}
                  placeholder="0.00" step="0.01" min="0" className={errors.price ? 'input-error' : ''} />
                {errors.price && <span className="field-error">{errors.price}</span>}
              </div>
              <div className="form-group half">
                <label htmlFor="product-category">Category *</label>
                <select id="product-category" name="category" value={formData.category} onChange={handleChange}
                  className={errors.category ? 'input-error' : ''}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                {errors.category && <span className="field-error">{errors.category}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="product-brand">Brand</label>
                <input id="product-brand" type="text" name="brand" value={formData.brand} onChange={handleChange}
                  placeholder="Brand name" />
              </div>
              <div className="form-group half">
                <label htmlFor="product-stock">Stock Status</label>
                <select id="product-stock" name="inStock" value={formData.inStock} onChange={handleChange}>
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>
            </div>

            <div className="form-group full">
              <label htmlFor="product-features">Features (comma-separated)</label>
              <input id="product-features" type="text" name="features" value={formData.features} onChange={handleChange}
                placeholder="e.g., Bluetooth 5.0, Water resistant, Fast charging" />
            </div>

            <button id="upload-submit-btn" type="submit" className="btn-primary w-100" disabled={loading}>
              {loading ? <span className="btn-loading"><span className="spinner"></span> Uploading…</span> : '🚀 Upload Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadProduct;
