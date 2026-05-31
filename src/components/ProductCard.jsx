import React from 'react';
import { useApp } from '../context/AppContext';
import { Heart, Plus, Minus, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product, onViewDetails }) => {
  const { cart, addToCart, updateCartQuantity, toggleWishlist, isProductInWishlist, user } = useApp();

  const cartItem = cart.find(item => item.id === product.id);
  const isInCart = !!cartItem;
  const isWishlisted = isProductInWishlist(product.id);

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!user) {
      alert("Please log in to save favorites.");
      return;
    }
    toggleWishlist(product.id);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    updateCartQuantity(product.id, cartItem.quantity + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateCartQuantity(product.id, cartItem.quantity - 1);
  };

  const getStockStatus = () => {
    if (product.stock === 0) {
      return <span className="badge bg-danger rounded-pill">Out of Stock</span>;
    }
    if (product.stock <= 5) {
      return <span className="badge bg-warning text-dark rounded-pill">Only {product.stock} Left</span>;
    }
    return <span className="badge bg-success-subtle text-success rounded-pill">In Stock</span>;
  };

  return (
    <div 
      className="card h-100 border-0 glass-card text-start cursor-pointer"
      onClick={() => onViewDetails(product)}
      style={{ borderRadius: '20px', overflow: 'hidden' }}
    >
      {/* Product Image & Wishlist Button */}
      <div className="position-relative" style={{ height: '160px', overflow: 'hidden', backgroundColor: 'var(--bg-app)' }}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-100 h-100 object-fit-cover transition-normal"
          style={{ transition: 'transform 0.5s' }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        />
        
        {/* Category Label */}
        <span className="position-absolute top-2 start-2 badge bg-white text-success fw-bold font-heading shadow-sm" style={{ top: '10px', left: '10px' }}>
          {product.category}
        </span>

        {/* Wishlist Button */}
        {user && (
          <button 
            onClick={handleWishlist}
            className="position-absolute btn bg-white rounded-circle p-2 shadow-sm border-0 d-flex align-items-center justify-content-center"
            style={{ 
              top: '10px', 
              right: '10px', 
              width: '32px', 
              height: '32px',
              transition: 'all 0.2s'
            }}
          >
            <Heart 
              size={16} 
              fill={isWishlisted ? 'var(--cui-danger, #dc3545)' : 'none'} 
              className={isWishlisted ? 'text-danger scale-up-animation' : 'text-muted'} 
            />
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className="card-body p-3 d-flex flex-column justify-content-between">
        <div>
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <span className="text-secondary font-body fw-bold" style={{ fontSize: '11px' }}>
              Unit: {product.unit}
            </span>
            {getStockStatus()}
          </div>
          
          <h6 className="font-heading fw-bold text-truncate-2 m-0 text-success" style={{ fontSize: '14px', height: '40px', lineHeight: '1.4' }}>
            {product.name}
          </h6>
        </div>

        {/* Price & Action Row */}
        <div className="mt-3 d-flex align-items-center justify-content-between">
          <div>
            <span className="text-muted text-xs d-block" style={{ fontSize: '10px' }}>Price</span>
            <span className="fw-bold font-heading text-dark" style={{ fontSize: '17px' }}>
              ₹{product.price}
            </span>
          </div>

          {/* Cart Buttons */}
          {product.stock === 0 ? (
            <button className="btn btn-sm btn-secondary disabled rounded-pill px-3" disabled>
              Sold Out
            </button>
          ) : isInCart ? (
            <div className="d-flex align-items-center bg-success text-white rounded-pill px-2 py-1 shadow-sm">
              <button 
                onClick={handleDecrement}
                className="btn btn-link btn-sm text-white p-0 me-2 border-0 d-flex align-items-center"
              >
                <Minus size={14} />
              </button>
              <span className="fw-bold px-1" style={{ fontSize: '13px', minWidth: '16px', textAlign: 'center' }}>
                {cartItem.quantity}
              </span>
              <button 
                onClick={handleIncrement}
                className="btn btn-link btn-sm text-white p-0 ms-2 border-0 d-flex align-items-center"
                disabled={cartItem.quantity >= product.stock}
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAddToCart}
              className="btn btn-organic btn-sm px-3 d-flex align-items-center gap-1 shadow-sm"
              style={{ padding: '6px 12px' }}
            >
              <ShoppingCart size={13} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
