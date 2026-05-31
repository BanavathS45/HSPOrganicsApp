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
    if (product.stock === 0)
      return <span style={styles.badgeOut}>Out of Stock</span>;
    if (product.stock <= 5)
      return <span style={styles.badgeLow}>Only {product.stock} Left</span>;
    return <span style={styles.badgeIn}>In Stock</span>;
  };

  return (
    <div
      onClick={() => onViewDetails(product)}
      style={styles.card}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#c8c8c8'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#ebebeb'}
    >
      {/* Image */}
      <div style={styles.imgWrap}>
        <img
          src={product.image}
          alt={product.name}
          style={styles.img}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        <span style={styles.catPill}>{product.category}</span>
        {user && (
          <button
            onClick={handleWishlist}
            style={styles.wishBtn}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#E24B4A'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e0e0e0'}
          >
            <Heart size={13} fill={isWishlisted ? '#E24B4A' : 'none'} color={isWishlisted ? '#E24B4A' : '#999'} />
          </button>
        )}
      </div>

      {/* Body */}
      <div style={styles.body}>
        <div style={styles.metaRow}>
          <span style={styles.unitLabel}>Unit: {product.unit}</span>
          {getStockStatus()}
        </div>

        <p style={styles.pname}>{product.name}</p>

        <div style={styles.divider} />

        <div style={styles.priceRow}>
          <div>
            <div style={styles.priceLabel}>Price</div>
            <div style={styles.priceAmt}>₹{product.price}</div>
          </div>

          {product.stock === 0 ? (
            <button style={styles.soldBtn} disabled>Sold Out</button>
          ) : isInCart ? (
            <div style={styles.qtyCtrl}>
              <button
                onClick={handleDecrement}
                style={styles.qtyBtn}
                onMouseEnter={e => e.currentTarget.style.background = '#EAF3DE'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Minus size={12} color="#3B6D11" />
              </button>
              <span style={styles.qtyNum}>{cartItem.quantity}</span>
              <button
                onClick={handleIncrement}
                disabled={cartItem.quantity >= product.stock}
                style={styles.qtyBtn}
                onMouseEnter={e => e.currentTarget.style.background = '#EAF3DE'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Plus size={12} color="#3B6D11" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              style={styles.addBtn}
              onMouseEnter={e => e.currentTarget.style.background = '#EAF3DE'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <ShoppingCart size={12} color="#3B6D11" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: '#fff',
    border: '0.5px solid #ebebeb',
    borderRadius: '14px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  imgWrap: {
    position: 'relative',
    width: '100%',
    paddingTop: '65%',   // ← aspect ratio trick: height = 65% of card width
    overflow: 'hidden',
    background: '#f7f7f5',
    flexShrink: 0,
  },
  img: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
    display: 'block',
  },
  catPill: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    background: '#fff',
    color: '#3B6D11',
    fontSize: '9px',
    fontWeight: '500',
    padding: '2px 7px',
    borderRadius: '99px',
    border: '0.5px solid #e0e0e0',
  },
  wishBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: '#fff',
    border: '0.5px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    padding: 0,
  },
  body: {
    padding: '10px 11px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitLabel: {
    fontSize: '10px',
    color: '#888',
  },
  badgeIn: {
    fontSize: '9px',
    fontWeight: '500',
    padding: '2px 6px',
    borderRadius: '99px',
    background: '#EAF3DE',
    color: '#3B6D11',
  },
  badgeLow: {
    fontSize: '9px',
    fontWeight: '500',
    padding: '2px 6px',
    borderRadius: '99px',
    background: '#FAEEDA',
    color: '#854F0B',
  },
  badgeOut: {
    fontSize: '9px',
    fontWeight: '500',
    padding: '2px 6px',
    borderRadius: '99px',
    background: '#FCEBEB',
    color: '#A32D2D',
  },
  pname: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#1a1a1a',
    lineHeight: '1.4',
    minHeight: '34px',
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  divider: {
    height: '0.5px',
    background: '#ebebeb',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '2px',
  },
  priceLabel: {
    fontSize: '9px',
    color: '#aaa',
    marginBottom: '1px',
  },
  priceAmt: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#1a1a1a',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 11px',
    borderRadius: '99px',
    border: '0.5px solid #3B6D11',
    background: 'transparent',
    color: '#3B6D11',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  qtyCtrl: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '99px',
    border: '0.5px solid #3B6D11',
    overflow: 'hidden',
  },
  qtyBtn: {
    width: '26px',
    height: '26px',
    background: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.15s',
    padding: 0,
  },
  qtyNum: {
    minWidth: '20px',
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: '500',
    color: '#3B6D11',
  },
  soldBtn: {
    padding: '5px 11px',
    borderRadius: '99px',
    border: '0.5px solid #ddd',
    background: 'transparent',
    color: '#aaa',
    fontSize: '11px',
    cursor: 'not-allowed',
  },
};

export default ProductCard;