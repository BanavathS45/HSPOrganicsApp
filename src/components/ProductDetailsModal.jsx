import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShoppingCart, Info, Sparkles, Heart, Plus, Minus } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductDetailsModal = ({ product, onClose, onNavigateToCart }) => {
  const { 
    cart, addToCart, updateCartQuantity, toggleWishlist, 
    isProductInWishlist, products, user 
  } = useApp();

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const isWishlisted = isProductInWishlist(product.id);
  const cartItem = cart.find(item => item.id === product.id);
  const isInCart = !!cartItem;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`${quantity} unit(s) of ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onNavigateToCart();
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!user) {
      alert("Please log in to save favorites.");
      return;
    }
    toggleWishlist(product.id);
  };

  // Find similar products in the same category (excluding current product)
  const similarProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 glass-card text-start" style={{ borderRadius: '24px' }}>
          
          {/* Header */}
          <div className="modal-header border-0 d-flex justify-content-between align-items-center px-4 pt-4">
            <h5 className="modal-title font-heading fw-bold text-success">
              Product Details
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body px-4 pb-4">
            <div className="row g-4">
              
              {/* Product Large Image */}
              <div className="col-md-6">
                <div 
                  className="position-relative rounded-4 overflow-hidden shadow-sm" 
                  style={{ height: '300px', backgroundColor: 'var(--bg-app)' }}
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-100 h-100 object-fit-cover" 
                  />
                  {user && (
                    <button 
                      onClick={handleWishlist}
                      className="position-absolute btn bg-white rounded-circle p-2 shadow"
                      style={{ top: '15px', right: '15px' }}
                    >
                      <Heart 
                        size={18} 
                        fill={isWishlisted ? 'var(--cui-danger, #dc3545)' : 'none'} 
                        className={isWishlisted ? 'text-danger' : 'text-muted'} 
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="col-md-6 d-flex flex-column justify-content-between">
                <div>
                  <span className="badge bg-success-subtle text-success fw-bold font-heading mb-2">
                    {product.category}
                  </span>
                  
                  <h4 className="font-heading fw-bold text-dark mb-1">
                    {product.name}
                  </h4>
                  
                  <span className="text-secondary font-body fw-bold d-block mb-3" style={{ fontSize: '13px' }}>
                    Pack Size / Unit: {product.unit}
                  </span>

                  <div className="d-flex align-items-baseline mb-3">
                    <span className="h3 fw-bold text-success font-heading m-0">₹{product.price}</span>
                    <span className="text-muted text-xs ms-2">(Inclusive of all taxes)</span>
                  </div>

                  {/* Stock tag */}
                  <div className="mb-3">
                    {product.stock === 0 ? (
                      <span className="badge bg-danger">Temporarily Out of Stock</span>
                    ) : product.stock <= 5 ? (
                      <span className="badge bg-warning text-dark">Hurry! Only {product.stock} units left in stock</span>
                    ) : (
                      <span className="badge bg-success">In Stock (Fresh from farm)</span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-muted font-body mb-3" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    {product.description}
                  </p>

                  {/* Organic Info Card */}
                  <div 
                    className="p-3 rounded-4 mb-4 d-flex gap-2"
                    style={{ backgroundColor: 'var(--accent-green-bg)', border: '1px solid var(--border-color)' }}
                  >
                    <Info className="text-success flex-shrink-0" size={18} />
                    <div>
                      <h6 className="m-0 font-heading fw-bold text-success" style={{ fontSize: '12px' }}>
                        Organic Authenticity
                      </h6>
                      <p className="m-0 text-secondary text-xs font-body" style={{ fontSize: '11.5px', marginTop: '2px' }}>
                        {product.organicInfo}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {product.stock > 0 && (
                  <div>
                    {/* Quantity Selector */}
                    <div className="d-flex align-items-center mb-3">
                      <span className="text-secondary fw-semibold me-3" style={{ fontSize: '14px' }}>Quantity:</span>
                      <div className="d-flex align-items-center bg-light rounded-pill p-1 border">
                        <button 
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="btn btn-link btn-sm text-secondary p-0 px-2 border-0 d-flex align-items-center"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="fw-bold px-2 text-dark" style={{ minWidth: '24px', textAlign: 'center' }}>
                          {quantity}
                        </span>
                        <button 
                          onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                          className="btn btn-link btn-sm text-secondary p-0 px-2 border-0 d-flex align-items-center"
                          disabled={quantity >= product.stock}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2">
                      <button 
                        onClick={handleAddToCart}
                        className="btn btn-organic-outline flex-grow-1 py-2 font-heading"
                      >
                        Add to Cart
                      </button>
                      <button 
                        onClick={handleBuyNow}
                        className="btn btn-organic flex-grow-1 py-2 font-heading d-flex align-items-center justify-content-center gap-2"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Similar Products */}
            {similarProducts.length > 0 && (
              <div className="mt-5 pt-4 border-top">
                <h5 className="font-heading fw-bold text-success mb-3 d-flex align-items-center gap-1">
                  <Sparkles size={18} /> You Might Also Like
                </h5>
                <div className="row g-3">
                  {similarProducts.map(item => (
                    <div className="col-12 col-sm-4" key={item.id}>
                      <ProductCard 
                        product={item} 
                        onViewDetails={(p) => {
                          // Change current product details view
                          onClose();
                          setTimeout(() => {
                            onViewDetails(p);
                          }, 100);
                        }} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
