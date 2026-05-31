import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Trash2, MapPin, Tag, ChevronRight, ShoppingBag, 
  MapIcon, ShieldCheck, Ticket, Plus, Minus 
} from 'lucide-react';
import AddressSelectionModal from '../../components/AddressSelectionModal';

const Cart = () => {
  const { 
    user, cart, updateCartQuantity, removeFromCart, cartSubtotal, 
    deliveryCharge, discountAmount, cartTotal, coupons, activeCoupon, 
    applyCoupon, removeCoupon, selectedAddress, deliveryDistance, placeOrder 
  } = useApp();

  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (!couponCode) return;
    const res = applyCoupon(couponCode);
    setCouponMessage(res);
    if (res.success) {
      setCouponCode('');
    }
  };

  const handleQuickApply = (code) => {
    const res = applyCoupon(code);
    setCouponMessage(res);
  };

  const handleCheckout = async () => {
    if (!user) {
      alert("Please login to place your order.");
      navigate('/login');
      return;
    }
    if (!selectedAddress) {
      alert("Please select a delivery address.");
      setShowAddressModal(true);
      return;
    }
    
    setCheckoutLoading(true);
    try {
      const order = await placeOrder('Cash On Delivery');
      alert(`Order ${order.id} placed successfully!`);
      navigate('/orders');
    } catch (err) {
      alert(err.message || "Failed to place order.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container-fluid pb-5 pt-5 px-3 text-center animate-fade-in-up" style={{ paddingBottom: '90px' }}>
        <div className="py-5 bg-white rounded-4 border max-w-400 mx-auto px-4 shadow-sm">
          <div className="bg-success-subtle text-success p-3 rounded-circle d-inline-flex mb-3" style={{ background: 'var(--accent-green-bg)' }}>
            <ShoppingBag size={48} />
          </div>
          <h4 className="font-heading fw-bold text-success mb-2">Your Cart is Empty</h4>
          <p className="text-muted font-body mb-4" style={{ fontSize: '14px' }}>
            Looks like you haven't added anything to your cart yet. Explore our farm fresh organic products and start shopping!
          </p>
          <Link to="/" className="btn btn-organic w-100 py-2">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid pb-5 pt-2 px-3 text-start animate-fade-in-up" style={{ paddingBottom: '90px' }}>
      
      {/* Page Title */}
      <div className="mb-4">
        <h4 className="font-heading fw-bold text-success m-0">Your Shopping Basket</h4>
        <span className="text-muted text-xs font-body">{cartCount} items in basket</span>
      </div>

      <div className="row g-3">
        {/* Left Side: Cart Items */}
        <div className="col-lg-8 d-flex flex-column gap-3">
          
          {/* Cart List */}
          <div className="card border-0 glass-card p-3 rounded-4 shadow-sm">
            <h6 className="font-heading fw-bold text-success mb-3">Item Details</h6>
            
            <div className="d-flex flex-column gap-3">
              {cart.map((item) => (
                <div 
                  key={item.id} 
                  className="d-flex align-items-center justify-content-between pb-3 border-bottom last-border-0"
                  style={{ borderColor: 'rgba(0,0,0,0.05)' }}
                >
                  <div className="d-flex align-items-center gap-3 text-truncate flex-grow-1">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="rounded-3 object-fit-cover flex-shrink-0" 
                      style={{ width: '64px', height: '64px', border: '1px solid var(--border-color)' }}
                    />
                    <div className="text-truncate">
                      <h6 className="m-0 font-heading fw-bold text-success text-truncate" style={{ fontSize: '14px' }}>
                        {item.name}
                      </h6>
                      <span className="text-secondary font-body text-xs" style={{ fontSize: '11px' }}>
                        {item.unit} • ₹{item.price} / unit
                      </span>
                      <span className="fw-bold d-block font-heading text-dark mt-1" style={{ fontSize: '14px' }}>
                        Total: ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    {/* Quantity Selector */}
                    <div className="d-flex align-items-center bg-light rounded-pill p-1 border">
                      <button 
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="btn btn-link btn-sm text-secondary p-0 px-2 border-0 d-flex align-items-center"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="fw-bold px-1 text-dark" style={{ minWidth: '16px', textAlign: 'center', fontSize: '13px' }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="btn btn-link btn-sm text-secondary p-0 px-2 border-0 d-flex align-items-center"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="btn btn-link text-danger p-1 border-0"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address & Geolocation Map Visual */}
          <div className="card border-0 glass-card p-3 rounded-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="font-heading fw-bold text-success m-0">Delivery Address</h6>
              <button 
                onClick={() => setShowAddressModal(true)} 
                className="btn btn-xs btn-outline-success rounded-pill px-3 py-1 font-heading fw-bold"
                style={{ fontSize: '11px' }}
              >
                Change
              </button>
            </div>

            {selectedAddress ? (
              <div className="d-flex align-items-start gap-3">
                <div className="bg-success text-white p-2 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h6 className="m-0 font-heading fw-bold" style={{ fontSize: '14px' }}>
                    {selectedAddress.name} Address
                  </h6>
                  <p className="m-0 text-muted font-body mt-1" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                    {selectedAddress.addressLine}, {selectedAddress.city} - {selectedAddress.postalCode}
                  </p>
                  
                  {/* Kilometer Distance Marker Banner */}
                  <div className="mt-2 bg-success-subtle text-success py-1 px-2 rounded-pill d-inline-flex align-items-center gap-1" style={{ background: 'var(--accent-green-bg)', fontSize: '11px' }}>
                    <MapIcon size={12} />
                    <span className="fw-bold">Delivery Distance: {deliveryDistance.toFixed(1)} KM</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-3 bg-light rounded-4">
                <p className="text-muted text-xs mb-2">No active address selected. Select address to compute delivery costs.</p>
                <button 
                  onClick={() => setShowAddressModal(true)} 
                  className="btn btn-sm btn-success rounded-pill px-3"
                >
                  Configure Address
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Bill Details & Coupons */}
        <div className="col-lg-4 d-flex flex-column gap-3">
          
          {/* Coupons Panel */}
          <div className="card border-0 glass-card p-3 rounded-4 shadow-sm">
            <h6 className="font-heading fw-bold text-success mb-3 d-flex align-items-center gap-1">
              <Ticket size={18} /> Apply Promo Coupons
            </h6>

            {activeCoupon ? (
              <div className="p-2 border border-success rounded-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--accent-green-bg)' }}>
                <div className="d-flex align-items-center gap-2">
                  <Tag size={16} className="text-success" />
                  <div>
                    <span className="fw-bold font-heading text-success text-xs d-block">{activeCoupon.code}</span>
                    <span className="text-muted text-xs font-body" style={{ fontSize: '10px' }}>Coupon Applied</span>
                  </div>
                </div>
                <button onClick={removeCoupon} className="btn btn-sm text-danger p-0 px-2 fw-semibold" style={{ fontSize: '12px' }}>
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleCouponSubmit} className="d-flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter ORGANIC20, FREE50..." 
                  className="form-control form-control-organic py-1.5 px-3 text-xs flex-grow-1"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button type="submit" className="btn btn-organic btn-sm px-3 font-heading fw-bold">
                  Apply
                </button>
              </form>
            )}

            {couponMessage && (
              <div className={`mt-2 text-xs font-body px-2 ${couponMessage.success ? 'text-success' : 'text-danger'}`} style={{ fontSize: '11px' }}>
                {couponMessage.success ? '✓ ' : '⚠️ '} {couponMessage.message}
              </div>
            )}

            {/* Quick Coupons List */}
            {!activeCoupon && (
              <div className="mt-3">
                <span className="text-muted text-xs fw-semibold font-body d-block mb-2" style={{ fontSize: '10.5px' }}>Available Coupons:</span>
                <div className="d-flex flex-column gap-1.5">
                  {coupons.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => handleQuickApply(c.code)}
                      className="p-2 rounded-3 bg-light border border-light-subtle d-flex justify-content-between align-items-center cursor-pointer hover-expand"
                    >
                      <div className="text-start">
                        <span className="fw-bold font-heading text-success text-xs" style={{ fontSize: '11px' }}>{c.code}</span>
                        <span className="text-muted text-xs font-body d-block" style={{ fontSize: '10px' }}>{c.description}</span>
                      </div>
                      <ChevronRight size={14} className="text-muted" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checkout Summary Card */}
          <div className="card border-0 glass-card p-3 rounded-4 shadow-sm text-start">
            <h6 className="font-heading fw-bold text-success mb-3">Bill Details</h6>
            
            <div className="d-flex flex-column gap-2 border-bottom pb-3 mb-3">
              <div className="d-flex justify-content-between text-muted text-xs">
                <span>Basket Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>
              <div className="d-flex justify-content-between text-muted text-xs">
                <span>Delivery Partner Fee ({deliveryDistance.toFixed(1)} km)</span>
                <span>{deliveryCharge === 0 ? <strong className="text-success">FREE</strong> : `₹${deliveryCharge}`}</span>
              </div>
              {discountAmount > 0 && (
                <div className="d-flex justify-content-between text-success text-xs fw-semibold">
                  <span>Coupon Discount</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-between align-items-baseline mb-4">
              <span className="font-heading fw-bold text-success">Grand Total</span>
              <span className="h3 font-heading fw-extrabold text-dark m-0">₹{cartTotal}</span>
            </div>

            {/* Safety badge */}
            <div className="p-2.5 rounded-3 bg-light border text-xs mb-3 d-flex align-items-center gap-2" style={{ fontSize: '11.5px' }}>
              <ShieldCheck className="text-success flex-shrink-0" size={16} />
              <span className="text-muted font-body">100% Secure Checkout • Cash On Delivery Supported</span>
            </div>

            {/* Checkout Trigger */}
            <button 
              onClick={handleCheckout} 
              disabled={checkoutLoading}
              className="btn btn-organic w-100 py-2.5 rounded-pill font-heading fw-bold shadow"
            >
              {checkoutLoading ? 'Placing Order...' : `Proceed To Checkout (₹${cartTotal})`}
            </button>
          </div>

        </div>
      </div>

      {/* Address Selection Modal */}
      <AddressSelectionModal 
        show={showAddressModal} 
        onClose={() => setShowAddressModal(false)} 
      />
    </div>
  );
};

export default Cart;
