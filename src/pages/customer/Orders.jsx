import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ClipboardCheck, Clock, CheckCircle2, ChevronDown, 
  ChevronUp, Truck, MapPin, Key, MapIcon, PackageOpen 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DeliveryMap from '../../components/DeliveryMap';

const Orders = () => {
  const { orders, user } = useApp();
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Filter orders for logged-in user
  const customerOrders = orders.filter(o => o.userId === user?.uid);

  const toggleOrderExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
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
          <Link to="/login" className="btn btn-organic w-100 py-2">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Active tracking order is the most recent order that isn't fully completed/cancelled yet,
  // or simply the latest order in the list.
  const trackingOrder = customerOrders.length > 0 ? customerOrders[0] : null;

  // Timeline helper
  const statuses = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
  const getStatusIndex = (currentStatus) => statuses.indexOf(currentStatus);

  return (
    <div className="container-fluid pb-5 pt-2 px-3 text-start animate-fade-in-up" style={{ paddingBottom: '90px' }}>
      
      {/* Page Title */}
      <div className="mb-4">
        <h4 className="font-heading fw-bold text-success m-0">Delivery Tracking</h4>
        <p className="text-muted text-xs font-body m-0">Live progress of your organic produce harvests</p>
      </div>

      {customerOrders.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border px-4 shadow-sm">
          <PackageOpen className="text-muted mb-2 mx-auto" size={40} />
          <h5 className="font-heading fw-bold text-success mb-2">No Orders Found</h5>
          <p className="text-muted font-body mb-4" style={{ fontSize: '13.5px' }}>
            You haven't placed any orders yet. Fresh organic groceries are waiting for you!
          </p>
          <Link to="/" className="btn btn-organic px-4 py-2">
            Order Now
          </Link>
        </div>
      ) : (
        <div className="row g-3">
          
          {/* Active Order Tracker Panel */}
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

                {/* Delivery Map Route */}
                <div className="mb-4">
                  <DeliveryMap customerLocation={trackingOrder.address} isEditable={false} />
                </div>

                <div className="row g-3 align-items-stretch mb-4">
                  {/* Kilometer Distance */}
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-4 h-100 text-center border">
                      <MapIcon className="text-success mb-1.5" size={20} />
                      <span className="text-muted text-xs d-block" style={{ fontSize: '10.5px' }}>Estimated Distance</span>
                      <strong className="font-heading text-dark text-sm">
                        {trackingOrder.distanceKm.toFixed(1)} KM
                      </strong>
                    </div>
                  </div>

                  {/* Delivery OTP Security */}
                  <div className="col-6">
                    <div className="p-3 rounded-4 h-100 text-center border bg-warning-subtle border-warning-subtle" style={{ backgroundColor: 'var(--accent-green-bg)' }}>
                      <Key className="text-success mb-1.5" size={20} />
                      <span className="text-muted text-xs d-block" style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>Verification OTP</span>
                      <strong className="font-heading text-success text-sm">
                        {trackingOrder.deliveryOTP}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Live Order Timeline */}
                <div className="px-2">
                  <h6 className="font-heading fw-bold text-secondary mb-3">Timeline</h6>
                  
                  {statuses.map((step, idx) => {
                    const trackingIndex = getStatusIndex(trackingOrder.status);
                    const isCompleted = trackingIndex >= idx;
                    const isActive = trackingIndex === idx;
                    
                    const timeRecord = trackingOrder.statusTimeline.find(t => t.status === step);
                    
                    return (
                      <div 
                        key={step} 
                        className={`timeline-status ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                      >
                        <div className="timeline-bullet shadow-sm">
                          {idx + 1}
                        </div>
                        <div className="text-start">
                          <h6 className="m-0 font-heading fw-bold text-success" style={{ fontSize: '13.5px' }}>
                            {step}
                          </h6>
                          <p className="m-0 text-muted font-body text-xs" style={{ fontSize: '11px', marginTop: '1px' }}>
                            {isActive ? trackingOrder.statusTimeline[trackingOrder.statusTimeline.length - 1].message : 
                             (timeRecord ? timeRecord.message : `Pending order lifecycle.`)}
                          </p>
                          {timeRecord && (
                            <span className="text-muted font-body text-xs" style={{ fontSize: '9px' }}>
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

          {/* Previous Order History List */}
          <div className="col-12">
            <div className="card border-0 glass-card p-3 rounded-4 shadow-sm">
              <h5 className="font-heading fw-bold text-success mb-3">Order History</h5>
              
              <div className="d-flex flex-column gap-2.5">
                {customerOrders.map((ord) => {
                  const isExpanded = expandedOrder === ord.id;
                  const itemLabels = ord.items.map(i => `${i.name} (${i.quantity})`).join(', ');
                  
                  return (
                    <div key={ord.id} className="border rounded-4 p-3 bg-white" style={{ borderColor: 'var(--border-color)' }}>
                      <div 
                        className="d-flex justify-content-between align-items-center cursor-pointer"
                        onClick={() => toggleOrderExpand(ord.id)}
                      >
                        <div className="text-truncate" style={{ maxWidth: '75%' }}>
                          <h6 className="m-0 font-heading fw-bold text-success text-truncate" style={{ fontSize: '13.5px' }}>
                            Order: #{ord.id}
                          </h6>
                          <span className="text-muted text-xs font-body d-block text-truncate mt-0.5">
                            {itemLabels}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge px-2.5 py-1 rounded-pill ${
                            ord.status === 'Delivered' ? 'bg-success' : 
                            ord.status === 'Cancelled' ? 'bg-danger' : 'bg-warning text-dark'
                          }`} style={{ fontSize: '10px' }}>
                            {ord.status}
                          </span>
                          {isExpanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                        </div>
                      </div>

                      {/* Dropdown Items list */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-top animate-fade-in-up">
                          <h6 className="font-heading fw-bold text-secondary text-xs mb-2">Order Items:</h6>
                          <div className="d-flex flex-column gap-1 mb-3">
                            {ord.items.map(itm => (
                              <div key={itm.id} className="d-flex justify-content-between text-xs text-muted font-body">
                                <span>{itm.name} x {itm.quantity} ({itm.unit})</span>
                                <span>₹{itm.price * itm.quantity}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="border-top pt-2 d-flex justify-content-between text-xs text-secondary fw-semibold font-body">
                            <span>Coupon Discount:</span>
                            <span>- ₹{ord.discountAmount}</span>
                          </div>
                          <div className="d-flex justify-content-between text-xs text-secondary fw-semibold font-body">
                            <span>Delivery charge:</span>
                            <span>₹{ord.deliveryCharge}</span>
                          </div>
                          <div className="d-flex justify-content-between text-xs fw-bold font-heading text-success mt-1 pt-1 border-top">
                            <span>Grand Total:</span>
                            <span>₹{ord.total}</span>
                          </div>
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
