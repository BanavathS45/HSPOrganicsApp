import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useApp } from '../../context/AppContext';
import { productService } from '../../firebase/db';
import { Plus, Edit2, Trash2, Package, AlertTriangle, CheckCircle2, Image, Upload, Link } from 'lucide-react';

const Products = () => {
  const { products } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [organicInfo, setOrganicInfo] = useState('');

  // Image upload type selector state
  const [imageSourceType, setImageSourceType] = useState('url'); // 'url' or 'local'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Local image size should not exceed 2MB to ensure fast database loading.");
      e.target.value = '';
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setImage(uploadEvent.target.result);
      setUploadingImage(false);
    };
    reader.onerror = () => {
      alert("Failed to read local file.");
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Vegetables');
    setPrice('');
    setUnit('');
    setStock('');
    setImage('');
    setDescription('');
    setOrganicInfo('');
    setImageSourceType('url');
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setUnit(p.unit);
    setStock(p.stock);
    setImage(p.image);
    setDescription(p.description);
    setOrganicInfo(p.organicInfo);
    if (p.image && p.image.startsWith('data:')) {
      setImageSourceType('local');
    } else {
      setImageSourceType('url');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !unit || !stock || !image) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    const payload = {
      name,
      category,
      price: parseFloat(price),
      unit,
      stock: parseInt(stock),
      image,
      description: description || 'Fresh farm organic produce.',
      organicInfo: organicInfo || '100% Certified Organic and Pesticide Free.'
    };

    setSavingProduct(true);
    try {
      if (editingProduct) {
        // Edit
        await productService.update(editingProduct.id, payload);
        alert("Product updated successfully!");
      } else {
        // Add
        await productService.add(payload);
        alert("New product added to catalog!");
      }
      setShowModal(false);
    } catch (err) {
      alert("Error saving product: " + err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this product from the organic catalog?")) {
      try {
        await productService.delete(id);
        alert("Product deleted.");
      } catch (err) {
        alert("Error deleting product: " + err.message);
      }
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="font-heading fw-extrabold text-success m-0">Product Catalog</h4>
          <span className="text-muted text-xs font-body">Manage organic inventory and pricing details</span>
        </div>
        <button 
          onClick={openAddModal}
          className="btn btn-organic d-flex align-items-center gap-1.5 shadow"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Products Table Card */}
      <div className="card border-0 glass-card rounded-4 shadow-sm overflow-hidden text-start">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="font-heading" style={{ fontSize: '13px' }}>
                <th className="px-4 py-3">Product</th>
                <th className="py-3">Category</th>
                <th className="py-3">Unit</th>
                <th className="py-3">Price</th>
                <th className="py-3">Stock Status</th>
                <th className="py-3 text-center" style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLowStock = p.stock <= 5;
                const isOutOfStock = p.stock === 0;

                return (
                  <tr key={p.id} className="font-body" style={{ fontSize: '13.5px' }}>
                    {/* Item */}
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          className="rounded-3 object-fit-cover border"
                          style={{ width: '48px', height: '48px' }}
                        />
                        <div>
                          <h6 className="m-0 font-heading fw-bold text-success" style={{ fontSize: '13.5px' }}>{p.name}</h6>
                          <span className="text-muted" style={{ fontSize: '10.5px' }}>ID: {p.id}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Category */}
                    <td className="py-3 fw-semibold text-secondary">{p.category}</td>
                    
                    {/* Unit */}
                    <td className="py-3 text-muted">{p.unit}</td>
                    
                    {/* Price */}
                    <td className="py-3 fw-bold text-dark">₹{p.price}</td>
                    
                    {/* Stock status */}
                    <td className="py-3">
                      {isOutOfStock ? (
                        <span className="badge bg-danger rounded-pill d-inline-flex align-items-center gap-1">
                          <AlertTriangle size={10} /> Sold Out
                        </span>
                      ) : isLowStock ? (
                        <span className="badge bg-warning text-dark rounded-pill d-inline-flex align-items-center gap-1">
                          <AlertTriangle size={10} /> Low Stock ({p.stock})
                        </span>
                      ) : (
                        <span className="badge bg-success-subtle text-success rounded-pill d-inline-flex align-items-center gap-1">
                          <CheckCircle2 size={10} /> {p.stock} Available
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 text-center">
                      <div className="d-flex justify-content-center gap-1">
                        <button 
                          onClick={() => openEditModal(p)}
                          className="btn btn-sm btn-outline-success p-1 rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '28px', height: '28px' }}
                          title="Edit Product"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="btn btn-sm btn-outline-danger p-1 rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '28px', height: '28px' }}
                          title="Delete Product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Add/Edit Product Modal — rendered via portal to escape overflow:hidden parent */}
      {showModal && ReactDOM.createPortal(
        <div 
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.58)',
            zIndex: 9999,
            overflowY: 'auto',
            paddingTop: '32px',
            paddingBottom: '32px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center'
          }}
          tabIndex="-1"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{ width: '100%', maxWidth: '720px', margin: '0 16px' }}>
            <div className="modal-content border-0 text-start shadow-lg" style={{ borderRadius: '20px', background: 'var(--bg-card, #fff)', maxHeight: 'none' }}>
              
              {/* Modal Header */}
              <div className="modal-header border-0 px-4 pt-4 pb-2 d-flex align-items-center justify-content-between"
                style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', borderRadius: '20px 20px 0 0' }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-white bg-opacity-25 rounded-circle p-1.5 d-flex">
                    <Package size={18} className="text-white" />
                  </div>
                  <div>
                    <h5 className="modal-title font-heading fw-bold text-white m-0" style={{ fontSize: '16px' }}>
                      {editingProduct ? '✏️ Edit Organic Product' : '🌿 Add Organic Product'}
                    </h5>
                    <span className="text-white-50 font-body" style={{ fontSize: '11px' }}>
                      {editingProduct ? 'Update product details in catalog' : 'Add a new item to the product catalog'}
                    </span>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowModal(false)}
                  aria-label="Close modal"
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body px-4 py-4" style={{ maxHeight: '62vh', overflowY: 'auto', overflowX: 'hidden' }}>
                  <div className="row g-3">
                    
                    {/* Product Name */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-xs" style={{ color: 'var(--text-secondary, #555)' }}>Product Name *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Fresh Red Tomatoes" 
                        className="form-control form-control-organic" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        required 
                      />
                    </div>

                    {/* Category */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-xs" style={{ color: 'var(--text-secondary, #555)' }}>Category *</label>
                      <select 
                        className="form-select form-control-organic" 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="Vegetables">🥦 Vegetables</option>
                        <option value="Fruits">🍎 Fruits</option>
                        <option value="Oils">🫙 Oils</option>
                        <option value="Cool Drinks">🥤 Cool Drinks</option>
                        <option value="Dairy">🥛 Dairy</option>
                        <option value="Grains">🌾 Grains</option>
                      </select>
                    </div>

                    {/* Unit */}
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-xs" style={{ color: 'var(--text-secondary, #555)' }}>Unit / Weight *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 500g, 1kg, 1L" 
                        className="form-control form-control-organic" 
                        value={unit} 
                        onChange={(e) => setUnit(e.target.value)}
                        required 
                      />
                    </div>

                    {/* Price */}
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-xs" style={{ color: 'var(--text-secondary, #555)' }}>Price (₹) *</label>
                      <div className="input-group">
                        <span className="input-group-text bg-success-subtle text-success fw-bold border-0" style={{ borderRadius: '10px 0 0 10px' }}>₹</span>
                        <input 
                          type="number" 
                          min="1" 
                          placeholder="0.00" 
                          className="form-control form-control-organic" 
                          style={{ borderRadius: '0 10px 10px 0', borderLeft: 0 }}
                          value={price} 
                          onChange={(e) => setPrice(e.target.value)}
                          required 
                        />
                      </div>
                    </div>

                    {/* Stock */}
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-xs" style={{ color: 'var(--text-secondary, #555)' }}>Stock Quantity *</label>
                      <input 
                        type="number" 
                        min="0" 
                        placeholder="e.g. 50" 
                        className="form-control form-control-organic" 
                        value={stock} 
                        onChange={(e) => setStock(e.target.value)}
                        required 
                      />
                    </div>

                    {/* Image Source Toggle */}
                    <div className="col-12">
                      <label className="form-label fw-semibold text-xs mb-2" style={{ color: 'var(--text-secondary, #555)' }}>Product Image *</label>
                      
                      {/* Toggle Tabs */}
                      <div className="d-flex gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => { setImageSourceType('url'); }}
                          className={`btn btn-sm d-flex align-items-center gap-1.5 rounded-pill px-3 ${
                            imageSourceType === 'url' 
                              ? 'btn-success text-white shadow-sm' 
                              : 'btn-outline-secondary'
                          }`}
                          style={{ fontSize: '12px' }}
                        >
                          <Link size={13} /> Paste URL
                        </button>
                        <button
                          type="button"
                          onClick={() => { setImageSourceType('local'); }}
                          className={`btn btn-sm d-flex align-items-center gap-1.5 rounded-pill px-3 ${
                            imageSourceType === 'local' 
                              ? 'btn-success text-white shadow-sm' 
                              : 'btn-outline-secondary'
                          }`}
                          style={{ fontSize: '12px' }}
                        >
                          <Upload size={13} /> Upload File
                        </button>
                      </div>

                      {/* URL Input */}
                      {imageSourceType === 'url' && (
                        <input 
                          type="url" 
                          placeholder="https://images.unsplash.com/photo-..." 
                          className="form-control form-control-organic" 
                          value={!image.startsWith('data:') ? image : ''} 
                          onChange={(e) => setImage(e.target.value)}
                        />
                      )}

                      {/* File Upload Input */}
                      {imageSourceType === 'local' && (
                        <div>
                          <input 
                            type="file" 
                            accept="image/jpeg,image/png,image/webp,image/gif" 
                            className="form-control form-control-organic" 
                            onChange={handleImageUpload}
                          />
                          <small className="text-muted font-body" style={{ fontSize: '11px' }}>Max file size: 2MB. JPEG, PNG, WebP supported.</small>
                          {uploadingImage && (
                            <div className="d-flex align-items-center gap-2 mt-2">
                              <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                              <span className="text-muted" style={{ fontSize: '12px' }}>Reading image...</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Image Preview */}
                      {image && !uploadingImage && (
                        <div className="mt-3 p-3 rounded-3 d-flex align-items-center gap-3"
                          style={{ background: '#f0fdf4', border: '1.5px solid #86efac' }}
                        >
                          <img 
                            src={image} 
                            alt="Preview" 
                            className="rounded-3 object-fit-cover"
                            style={{ width: '72px', height: '72px', border: '2px solid #4ade80' }}
                            onError={(e) => { e.target.style.display='none'; }}
                          />
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-1.5 mb-1">
                              <CheckCircle2 size={14} className="text-success" />
                              <span className="font-heading fw-bold text-success" style={{ fontSize: '13px' }}>Image Ready</span>
                            </div>
                            <span className="text-muted font-body" style={{ fontSize: '11px' }}>
                              {image.startsWith('data:') ? 'Local file uploaded successfully' : 'Image URL registered'}
                            </span>
                          </div>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger rounded-circle p-1 d-flex align-items-center justify-content-center"
                            style={{ width: '28px', height: '28px' }}
                            onClick={() => setImage('')}
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <label className="form-label fw-semibold text-xs" style={{ color: 'var(--text-secondary, #555)' }}>Product Description</label>
                      <textarea 
                        rows="3" 
                        placeholder="Enter features, health benefits, taste profile..." 
                        className="form-control form-control-organic" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </div>

                    {/* Organic Info */}
                    <div className="col-12">
                      <label className="form-label fw-semibold text-xs" style={{ color: 'var(--text-secondary, #555)' }}>Organic Farming Information</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Cultivated using compost manure, zero pesticides." 
                        className="form-control form-control-organic" 
                        value={organicInfo} 
                        onChange={(e) => setOrganicInfo(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer border-0 px-4 pb-4 pt-2 d-flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="btn btn-light rounded-pill px-4 fw-semibold"
                    style={{ fontSize: '14px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={savingProduct || uploadingImage || !image} 
                    className="btn btn-success flex-grow-1 d-flex align-items-center justify-content-center gap-2 rounded-pill fw-bold shadow"
                    style={{ fontSize: '14px', background: 'linear-gradient(135deg, #2E7D32, #43A047)' }}
                  >
                    {savingProduct ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>Saving to Catalog...</span>
                      </>
                    ) : (
                      <>
                        <Package size={15} />
                        <span>{editingProduct ? 'Save Changes' : 'Publish Product'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Products;
