import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/Toast';
import {
  ClipboardCheck, Clock, CheckCircle2, ChevronDown,
  ChevronUp, Truck, MapPin, Key, MapIcon, PackageOpen, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DeliveryMap from '../../components/DeliveryMap';

// Star Rating Component
const StarRating = ({ value, onChange, readonly = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="d-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className="btn p-0 border-0 bg-transparent"
          style={{ cursor: readonly ? 'default' : 'pointer', lineHeight: 1 }}
        >
          <Star
            size={20}
            fill={(hovered || value) >= star ? '#F59E0B' : 'none'}
            stroke={(hovered || value) >= star ? '#F59E0B' : '#D1D5DB'}
          />
        </button>
      ))}
    </div>
  );
};

const Orders = () => {
  const { orders, user, ratings, submitRating } = useApp();
  const { toast } = useToast();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [ratingStars, setRatingStars] = useState({});
  const [ratingComment, setRatingComment] = useState({});
  const [ratingLoading, setRatingLoading] = useState({});

  const customerOrders = orders.filter(o => o.userId === user?.uid);
  const toggleOrderExpand = (id) => setExpandedOrder(expandedOrder === id ? null : id);

  const getExistingRating = (orderId) => ratings.find(r => r.orderId === orderId && r.userId === user?.uid);

  const handleSubmitRating = async (order) => {
    const stars = ratingStars[order.id];
    if (!stars) { toast.warning('Please select a star rating before submitting.', 'Rating Required'); return; }
    setRatingLoading(prev => ({ ...prev, [order.id]: true }));
    try {
      await submitRating({
        orderId: order.id,
        userId: user.uid,
        customerName: user.displayName,
        deliveryBoyId: order.deliveryBoy?.uid || order.deliveryBoy?.id || null,
        deliveryBoyName: order.deliveryBoy?.name || order.deliveryBoy?.displayName || null,
        stars,
        comment: ratingComment[order.id] || ''
      });
      toast.success('Thank you for your feedback! 🌟', 'Rating Submitted');
    } catch (err) {
      toast.error('Failed to submit rating: ' + err.message);
    } finally {
      setRatingLoading(prev => ({ ...prev, [order.id]: false }));
    }
  };

  const fmtAddress = (addr) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    return [addr.addressLine, addr.city, addr.postalCode].filter(Boolean).join(', ');
  };

  if (!user) {
    return (
      <div className="container-fluid pb-5 pt-5 px-3 text-center" style={{ paddingBottom: '90px' }}>
        <div className="py-5 bg-white rounded-4 border max-w-400 mx-auto px-4 shadow-sm">
          <Clock className="text-success mb-2 mx-auto" size={32} />
          <h4 className="font-heading fw-bold text-success mb-2">Access Denied</h4>
          <p className="text-muted font-body mb-4" style={{ fontSize: '14px' }}>
            Please log in as a customer to review your order tracking history.
          </p>
          <Link to="/login" className="btn btn-organic w-100 py-2">Go to Login</Link>
        </div>
      </div>
    );
  }

  const trackingOrder = customerOrders.length > 0 ? customerOrders[0] : null;
  const statuses = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
  const getStatusIndex = (s) => statuses.indexOf(s);

  return (
    <div className="container-fluid pb-5 pt-2 px-3 text-start animate-fade-in-up" style={{ paddingBottom: '90px' }}>

      <div className="mb-4">
        <h4 className="font-heading fw-bold text-success m-0">Delivery Tracking</h4>
        <p className="text-muted text-xs font-body m-0">Live progress of your organic produce harvests</p>
      </div>

      {customerOrders.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border px-4 shadow-sm">
          <PackageOpen className="text-muted mb-2 mx-auto" size={40} />
          <h5 className="font-heading fw-bold text-success mb-2">No Orders Found</h5>
          <p className="text-muted font-body mb-4" style={{ fontSize: '13.5px' }}>
            You haven't placed any orders yet. Fresh organic groceries are waiting!
          </p>
          <Link to="/" className="btn btn-organic px-4 py-2">Order Now</Link>
        </div>
      ) : (
        <div className="row g-3">

          {/* Active Order Tracker */}
          {trackingOrder && (
            <div className="col-12">
              <div className="card border-0 glass-card p-3 rounded-4 shadow-sm mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <span className="badge bg-success-subtle text-success font-heading fw-bold">Live Tracking</span>
                    <h5 className="font-heading fw-bold text-dark mt-1 mb-0" style={{ fontSize: '15px' }}>
                      Order ID: {trackingOrder.id}
                    </h5>
                  </div>
                  <div className="text-end">
                    <span className="text-muted text-xs d-block">Placed on</span>
                    <span className="fw-semibold font-body text-xs text-secondary">
                      {new Date(trackingOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Map */}
                <div className="mb-4">
                  <DeliveryMap customerLocation={trackingOrder.address} isEditable={false} />
                </div>

                <div className="row g-3 align-items-stretch mb-4">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-4 h-100 text-center border">
                      <MapIcon className="text-success mb-1" size={20} />
                      <span className="text-muted text-xs d-block" style={{ fontSize: '10.5px' }}>Estimated Distance</span>
                      <strong className="font-heading text-dark text-sm">{trackingOrder.distanceKm?.toFixed(1)} KM</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 rounded-4 h-100 text-center border" style={{ backgroundColor: 'var(--accent-green-bg)' }}>
                      <Key className="text-success mb-1" size={20} />
                      <span className="text-muted text-xs d-block" style={{ fontSize: '10.5px' }}>Verification OTP</span>
                      <strong className="font-heading text-success text-sm">{trackingOrder.deliveryOTP}</strong>
                    </div>
                  </div>
                </div>

                {/* Delivery Partner Card */}
                {trackingOrder.deliveryBoy && (
                  <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-20 rounded-4 mb-4 d-flex flex-column gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={trackingOrder.deliveryBoy.photo || trackingOrder.deliveryBoy.photoURL}
                        alt={trackingOrder.deliveryBoy.name}
                        className="rounded-circle border border-2 border-success object-fit-cover shadow-sm"
                        style={{ width: '52px', height: '52px' }}
                      />
                      <div className="flex-grow-1 text-start">
                        <span className="text-success font-heading fw-bold d-block" style={{ fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          🚴 Assigned Delivery Partner
                        </span>
                        <h6 className="m-0 font-heading fw-extrabold text-dark" style={{ fontSize: '14.5px' }}>
                          {trackingOrder.deliveryBoy.name}
                        </h6>
                        <span className="text-muted font-body d-block" style={{ fontSize: '11px' }}>
                          📞 {trackingOrder.deliveryBoy.phone}
                        </span>
                        <span className="d-block" style={{ fontSize: '11px' }}>
                          Status:{' '}
                          <strong className={trackingOrder.status === 'Out for Delivery' ? 'text-success' : trackingOrder.status === 'Delivered' ? 'text-secondary' : 'text-warning'}>
                            {trackingOrder.status === 'Out for Delivery' ? '⚡ En-route to you' :
                              trackingOrder.status === 'Delivered' ? '✅ Delivered' : '🌱 Packing at Farm'}
                          </strong>
                        </span>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <a
                        href={`tel:${trackingOrder.deliveryBoy.phone}`}
                        className="btn btn-success flex-grow-1 d-flex align-items-center justify-content-center gap-1 py-2 shadow-sm font-heading fw-bold text-white rounded-pill"
                        style={{ fontSize: '12.5px' }}
                      >
                        📞 Call Partner
                      </a>
                      {trackingOrder.status === 'Out for Delivery' && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fmtAddress(trackingOrder.address))}`}
                          target="_blank" rel="noopener noreferrer"
                          className="btn btn-outline-success d-flex align-items-center justify-content-center gap-1 py-2 font-heading fw-bold rounded-pill px-3"
                          style={{ fontSize: '12px' }}
                        >
                          🗺️ Track
                        </a>
                      )}
                    </div>
                    <div className="border-top pt-2 d-flex justify-content-between align-items-center text-xs">
                      <span className="text-secondary font-body">Estimated Arrival:</span>
                      <span className="font-heading fw-bold text-success" style={{ fontSize: '12.5px' }}>
                        {trackingOrder.status === 'Out for Delivery'
                          ? `⚡ Approx. ${Math.round((trackingOrder.distanceKm || 3) * 5) + 10} mins`
                          : trackingOrder.status === 'Delivered'
                          ? '✅ Delivered successfully!'
                          : '🌱 Preparing — ready within 30–45 mins'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="px-2">
                  <h6 className="font-heading fw-bold text-secondary mb-3">Timeline</h6>
                  {statuses.map((step, idx) => {
                    const trackingIndex = getStatusIndex(trackingOrder.status);
                    const isCompleted = trackingIndex >= idx;
                    const isActive = trackingIndex === idx;
                    const timeRecord = trackingOrder.statusTimeline?.find(t => t.status === step);
                    return (
                      <div key={step} className={`timeline-status ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                        <div className="timeline-bullet shadow-sm">{idx + 1}</div>
                        <div className="text-start">
                          <h6 className="m-0 font-heading fw-bold text-success" style={{ fontSize: '13.5px' }}>{step}</h6>
                          <p className="m-0 text-muted font-body text-xs" style={{ fontSize: '11px' }}>
                            {isActive ? trackingOrder.statusTimeline?.[trackingOrder.statusTimeline.length - 1]?.message
                              : (timeRecord ? timeRecord.message : 'Pending order lifecycle.')}
                          </p>
                          {timeRecord && (
                            <span className="text-muted font-body" style={{ fontSize: '9px' }}>
                              {new Date(timeRecord.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Order History */}
          <div className="col-12">
            <div className="card border-0 glass-card p-3 rounded-4 shadow-sm">
              <h5 className="font-heading fw-bold text-success mb-3">Order History</h5>
              <div className="d-flex flex-column gap-2">
                {customerOrders.map((ord) => {
                  const isExpanded = expandedOrder === ord.id;
                  const existingRating = getExistingRating(ord.id);
                  const itemLabels = ord.items.map(i => `${i.name} (${i.quantity})`).join(', ');
                  return (
                    <div key={ord.id} className="border rounded-4 p-3 bg-white" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="d-flex justify-content-between align-items-center cursor-pointer" onClick={() => toggleOrderExpand(ord.id)}>
                        <div className="text-truncate" style={{ maxWidth: '75%' }}>
                          <h6 className="m-0 font-heading fw-bold text-success text-truncate" style={{ fontSize: '13.5px' }}>
                            Order: #{ord.id}
                          </h6>
                          <span className="text-muted text-xs font-body d-block text-truncate mt-0.5">{itemLabels}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge px-2 py-1 rounded-pill ${ord.status === 'Delivered' ? 'bg-success' : ord.status === 'Cancelled' ? 'bg-danger' : 'bg-warning text-dark'}`} style={{ fontSize: '10px' }}>
                            {ord.status}
                          </span>
                          {isExpanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-top animate-fade-in-up">
                          {/* Items */}
                          <h6 className="font-heading fw-bold text-secondary text-xs mb-2">Order Items:</h6>
                          <div className="d-flex flex-column gap-1 mb-3">
                            {ord.items.map(itm => (
                              <div key={itm.id} className="d-flex justify-content-between text-xs text-muted font-body">
                                <span>{itm.name} × {itm.quantity} ({itm.unit})</span>
                                <span>₹{itm.price * itm.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-top pt-2 d-flex justify-content-between text-xs text-secondary fw-semibold font-body">
                            <span>Coupon Discount:</span><span>- ₹{ord.discountAmount}</span>
                          </div>
                          <div className="d-flex justify-content-between text-xs text-secondary fw-semibold font-body">
                            <span>Delivery charge:</span><span>₹{ord.deliveryCharge}</span>
                          </div>
                          <div className="d-flex justify-content-between text-xs fw-bold font-heading text-success mt-1 pt-1 border-top">
                            <span>Grand Total:</span><span>₹{ord.total}</span>
                          </div>

                          {/* ⭐ Rating Section — only for Delivered orders */}
                          {ord.status === 'Delivered' && (
                            <div className="mt-3 p-3 rounded-4 border" style={{ backgroundColor: 'var(--accent-green-bg)' }}>
                              <h6 className="font-heading fw-bold text-success mb-2 d-flex align-items-center gap-1" style={{ fontSize: '12.5px' }}>
                                <Star size={14} fill="#F59E0B" stroke="#F59E0B" /> Rate Your Experience
                              </h6>
                              {existingRating ? (
                                <div className="text-center">
                                  <StarRating value={existingRating.stars} readonly />
                                  <p className="text-muted font-body mt-1 mb-0" style={{ fontSize: '11px' }}>
                                    You rated this order {existingRating.stars}★
                                    {existingRating.comment && ` — "${existingRating.comment}"`}
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <div className="mb-2">
                                    <StarRating
                                      value={ratingStars[ord.id] || 0}
                                      onChange={(val) => setRatingStars(p => ({ ...p, [ord.id]: val }))}
                                    />
                                  </div>
                                  <textarea
                                    rows={2}
                                    placeholder="Leave a comment (optional)..."
                                    className="form-control form-control-organic text-xs py-2 mb-2"
                                    value={ratingComment[ord.id] || ''}
                                    onChange={(e) => setRatingComment(p => ({ ...p, [ord.id]: e.target.value }))}
                                  />
                                  <button
                                    onClick={() => handleSubmitRating(ord)}
                                    disabled={ratingLoading[ord.id] || !ratingStars[ord.id]}
                                    className="btn btn-success btn-sm rounded-pill px-3 font-heading fw-bold text-white w-100"
                                    style={{ fontSize: '12px' }}
                                  >
                                    {ratingLoading[ord.id] ? 'Submitting...' : '⭐ Submit Rating'}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Orders;
