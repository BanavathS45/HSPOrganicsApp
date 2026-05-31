import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { orderService, notificationService } from '../../firebase/db';
import { 
  Check, X, Truck, Package, MessageCircle, MapPin, 
  MapIcon, Bell, ArrowRight, ClipboardCheck 
} from 'lucide-react';
import DeliveryMap from '../../components/DeliveryMap';

const Orders = () => {
  const { orders } = useApp();
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Manual Notification Form State
  const [customNotification, setCustomNotification] = useState('');
  const [notiLoading, setNotiLoading] = useState(false);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updated = await orderService.updateStatus(orderId, newStatus);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      alert(`Order ${orderId} updated to: ${newStatus}`);
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!customNotification || !selectedOrder) return;

    setNotiLoading(true);
    try {
      notificationService.addSystemNotification({
        title: 'HSP Alert 🌾',
        body: customNotification,
        type: 'order_status',
        userId: selectedOrder.userId
      });
      alert(`Manual push notification sent to ${selectedOrder.customerName}`);
      setCustomNotification('');
    } catch (err) {
      alert("Error sending alert: " + err.message);
    } finally {
      setNotiLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-success';
      case 'Cancelled': return 'bg-danger';
      case 'Pending': return 'bg-warning text-dark';
      case 'Accepted': return 'bg-info text-white';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="font-heading fw-extrabold text-success m-0">Order Dashboard</h4>
          <span className="text-muted text-xs font-body">Manage live orders, route tracking, and lifecycle status</span>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Side: Orders List */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 glass-card p-3 rounded-4 shadow-sm text-start">
            <h5 className="font-heading fw-bold text-success mb-3">Live Order Feeds</h5>

            {orders.length === 0 ? (
              <div className="text-center py-5 bg-white rounded-4 border">
                <ClipboardCheck className="text-muted mb-2 mx-auto" size={32} />
                <p className="text-muted m-0">No active orders placed yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2.5" style={{ maxHeight: '520px', overflowY: 'auto' }}>
                {orders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id;
                  
                  return (
                    <div 
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`p-3 rounded-4 border cursor-pointer transition-normal ${isSelected ? 'border-success bg-success-subtle' : 'border-light-subtle'}`}
                      style={{
                        background: isSelected ? 'rgba(46, 125, 50, 0.05)' : 'var(--bg-card-solid)',
                        borderColor: isSelected ? 'var(--primary-leaf) !important' : 'var(--border-color)'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="m-0 font-heading fw-bold text-success" style={{ fontSize: '14px' }}>
                            Order: {ord.id}
                          </h6>
                          <span className="text-muted font-body text-xs mt-0.5 d-block">
                            Customer: <strong>{ord.customerName}</strong> • {ord.items.length} items
                          </span>
                          <span className="text-muted font-body text-xs d-block" style={{ fontSize: '10.5px' }}>
                            Distance: {ord.distanceKm.toFixed(1)} KM
                          </span>
                        </div>
                        <div className="text-end">
                          <span className={`badge rounded-pill px-2.5 py-1 ${getStatusColor(ord.status)}`} style={{ fontSize: '10px' }}>
                            {ord.status}
                          </span>
                          <h6 className="font-heading fw-bold text-dark mt-2 mb-0" style={{ fontSize: '15px' }}>
                            ₹{ord.total}
                          </h6>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Order Detail, Maps Routing, Status Controller */}
        <div className="col-12 col-lg-5 text-start">
          {selectedOrder ? (
            <div className="d-flex flex-column gap-3">
              
              {/* Order Overview Detail */}
              <div className="card border-0 glass-card p-3 rounded-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="font-heading fw-bold text-success m-0">Detail View</h5>
                  <span className="text-muted text-xs font-body">OTP: {selectedOrder.deliveryOTP}</span>
                </div>

                <div className="mb-3">
                  <span className="text-secondary text-xs fw-semibold font-body d-block">Deliver To:</span>
                  <p className="m-0 text-dark font-body text-xs mt-1" style={{ fontSize: '12.5px', lineHeight: '1.4' }}>
                    <strong>{selectedOrder.customerName}</strong> ({selectedOrder.customerEmail})<br />
                    {selectedOrder.address.addressLine}, {selectedOrder.address.city} - {selectedOrder.address.postalCode}
                  </p>
                </div>

                {/* Map Viewer */}
                <div className="mb-3">
                  <DeliveryMap customerLocation={selectedOrder.address} isEditable={false} />
                  <div className="d-flex justify-content-between text-xs mt-2 text-muted font-body">
                    <span>Farm Coordinates: Bangalore Hub</span>
                    <span>Distance: <strong>{selectedOrder.distanceKm.toFixed(1)} KM</strong></span>
                  </div>
                </div>

                {/* Items Bought */}
                <div className="border-top pt-3 mb-3">
                  <h6 className="font-heading fw-bold text-secondary text-xs mb-2">Cart Items:</h6>
                  <div className="d-flex flex-column gap-1">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="d-flex justify-content-between text-xs text-muted font-body">
                        <span>{item.name} (x{item.quantity})</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex justify-content-between text-xs fw-bold font-heading text-success border-top pt-2 mt-2">
                    <span>Total Amount:</span>
                    <span>₹{selectedOrder.total}</span>
                  </div>
                </div>

                {/* Status Lifecyle Controls */}
                <div className="border-top pt-3">
                  <h6 className="font-heading fw-bold text-secondary text-xs mb-3">Status Lifecycle Actions:</h6>
                  
                  {selectedOrder.status === 'Pending' && (
                    <div className="d-flex gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'Accepted')}
                        className="btn btn-success btn-sm rounded-pill flex-grow-1 font-heading fw-bold d-flex align-items-center justify-content-center gap-1.5 py-1.5"
                      >
                        <Check size={14} /> Accept Order
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'Cancelled')}
                        className="btn btn-outline-danger btn-sm rounded-pill flex-grow-1 font-heading fw-bold d-flex align-items-center justify-content-center gap-1.5 py-1.5"
                      >
                        <X size={14} /> Reject Order
                      </button>
                    </div>
                  )}

                  {selectedOrder.status !== 'Pending' && selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && (
                    <div className="d-flex flex-column gap-2">
                      <span className="text-xs text-muted mb-1">Advance order state:</span>
                      <div className="d-flex gap-2">
                        {selectedOrder.status === 'Accepted' && (
                          <button 
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'Preparing')}
                            className="btn btn-success btn-sm rounded-pill w-100 font-heading fw-bold py-1.5"
                          >
                            Mark As Preparing
                          </button>
                        )}
                        {selectedOrder.status === 'Preparing' && (
                          <button 
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'Out for Delivery')}
                            className="btn btn-success btn-sm rounded-pill w-100 font-heading fw-bold py-1.5"
                          >
                            Mark Out for Delivery
                          </button>
                        )}
                        {selectedOrder.status === 'Out for Delivery' && (
                          <button 
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'Delivered')}
                            className="btn btn-success btn-sm rounded-pill w-100 font-heading fw-bold py-1.5"
                          >
                            Mark As Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {(selectedOrder.status === 'Delivered' || selectedOrder.status === 'Cancelled') && (
                    <div className="text-center py-2 bg-light rounded-3 text-xs text-muted font-body">
                      Lifecycle finished. Order status is: <strong>{selectedOrder.status}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Push Notifications Console */}
              <div className="card border-0 glass-card p-3 rounded-4 shadow-sm">
                <h6 className="font-heading fw-bold text-success mb-2 d-flex align-items-center gap-1.5">
                  <Bell size={16} /> Send Push Notification
                </h6>
                <p className="text-muted text-xxs font-body mb-3">
                  Dispenses a direct real-time FCM notification to this customer.
                </p>

                <form onSubmit={handleSendNotification} className="d-flex flex-column gap-2">
                  <textarea 
                    rows="2" 
                    placeholder="e.g. Your delivery agent is reaching in 5 mins. Please keep cash ready!" 
                    className="form-control form-control-organic text-xs py-2"
                    value={customNotification}
                    onChange={(e) => setCustomNotification(e.target.value)}
                    required
                  ></textarea>
                  <button 
                    type="submit" 
                    disabled={notiLoading}
                    className="btn btn-organic btn-sm rounded-pill d-flex align-items-center justify-content-center gap-1.5 py-1.5 font-heading fw-bold"
                  >
                    Send Alert <ArrowRight size={13} />
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="card border-0 glass-card p-4 rounded-4 shadow-sm text-center py-5">
              <MapPin className="text-muted mb-2 mx-auto animate-pulse" size={36} />
              <p className="text-muted m-0 font-body text-xs">
                Select an order from the list to display customer addresses, delivery route maps, and controls.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
