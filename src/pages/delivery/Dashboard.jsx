import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { orderService, notificationService } from '../../firebase/db';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, LogOut, Phone, MapPin, Check, 
  MapIcon, ShieldAlert, Key, ClipboardCheck, Sparkles, Navigation 
} from 'lucide-react';

const DeliveryDashboard = () => {
  const { user, logout, orders } = useApp();
  const navigate = useNavigate();
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpTargetOrder, setOtpTargetOrder] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Protect route
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'delivery') {
      alert("Access restricted to delivery partners!");
      navigate('/');
    }
  }, [user, navigate]);

  // Filter orders assigned to this delivery agent
  useEffect(() => {
    if (user) {
      const myOrders = orders.filter(order => 
        order.deliveryBoy && (order.deliveryBoy.uid === user.uid || order.deliveryBoy.id === user.uid)
      );
      setAssignedOrders(myOrders);
    }
  }, [orders, user]);

  if (!user || user.role !== 'delivery') return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updated = await orderService.updateStatus(orderId, newStatus);
      
      // Notify all three (Customer, Admin, and Delivery boy)
      await notificationService.addSystemNotification({
        title: `Order is ${newStatus}! 📦`,
        body: `Order ${orderId} has been marked as ${newStatus} by your delivery partner.`,
        type: 'order_status',
        userId: updated.userId
      });
      await notificationService.addSystemNotification({
        title: `Order ${newStatus}! 🛡️`,
        body: `Rider ${user.displayName} updated Order ${orderId} to ${newStatus}.`,
        type: 'order_status',
        userId: 'admin'
      });
      await notificationService.addSystemNotification({
        title: `You marked Order as ${newStatus}! 🚴`,
        body: `Order ${orderId} status has been updated.`,
        type: 'order_status',
        userId: user.uid
      });

      alert(`Order ${orderId} marked as: ${newStatus}`);
    } catch (err) {
      alert("Error updating order: " + err.message);
    }
  };

  const openOtpDialog = (order) => {
    setOtpTargetOrder(order);
    setEnteredOtp('');
    setOtpError('');
    setShowOtpModal(true);
  };

  const handleVerifyOtpAndDeliver = async (e) => {
    e.preventDefault();
    if (!otpTargetOrder) return;
    
    if (enteredOtp.trim() !== otpTargetOrder.deliveryOTP) {
      setOtpError("Invalid OTP! Please check with the customer.");
      return;
    }

    try {
      // Mark as Delivered
      const updated = await orderService.updateStatus(otpTargetOrder.id, 'Delivered');
      
      // Trigger notifications to ALL THREE (Customer, Admin, and Delivery boy)!
      await notificationService.addSystemNotification({
        title: 'Order Delivered! 🎉🌱',
        body: `Your order ${otpTargetOrder.id} has been successfully verified & delivered. Enjoy!`,
        type: 'order_status',
        userId: updated.userId
      });
      await notificationService.addSystemNotification({
        title: 'Order Delivered! 🛡️',
        body: `Order ${otpTargetOrder.id} has been successfully delivered by ${user.displayName}.`,
        type: 'order_status',
        userId: 'admin'
      });
      await notificationService.addSystemNotification({
        title: 'Delivery Completed! 🚴',
        body: `Well done! Order ${otpTargetOrder.id} has been delivered successfully.`,
        type: 'order_status',
        userId: user.uid
      });

      alert("Delivery successfully verified!");
      setShowOtpModal(false);
    } catch (err) {
      setOtpError("Error delivering order: " + err.message);
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-info bg-opacity-10 text-info border border-info border-opacity-25';
      case 'Preparing': return 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25';
      case 'Out for Delivery': return 'bg-success bg-opacity-10 text-success border border-success border-opacity-25';
      case 'Delivered': return 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25';
      default: return 'bg-light text-dark';
    }
  };

  return (
    <div className="container py-4 px-3 text-start min-vh-100" style={{ backgroundColor: '#f9fbf7' }}>
      {styleBlock}
      
      {/* Top Welcome Card */}
      <div className="card border-0 glass-card p-3 rounded-4 shadow-sm mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <img 
              src={user.photoURL} 
              alt={user.displayName} 
              className="rounded-circle object-fit-cover border border-success border-2 shadow-sm"
              style={{ width: '55px', height: '55px' }}
            />
            <div>
              <h5 className="font-heading fw-extrabold text-success m-0" style={{ fontSize: '16.5px' }}>
                {user.displayName}
              </h5>
              <span className="badge bg-success bg-opacity-10 text-success font-heading text-xxs px-2 py-0.5 rounded-pill mt-1">
                🚴 Delivery Partner
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger btn-xs rounded-circle p-2 d-flex align-items-center justify-content-center border"
            style={{ width: '38px', height: '38px' }}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <h5 className="font-heading fw-extrabold text-success mb-3 d-flex align-items-center gap-2">
        <Truck size={18} /> Assigned Deliveries ({assignedOrders.length})
      </h5>

      {/* Orders list */}
      {assignedOrders.length === 0 ? (
        <div className="card border-0 glass-card p-4 rounded-4 shadow-sm text-center py-5">
          <Sparkles size={36} className="text-success text-opacity-40 mb-2 mx-auto" />
          <h6 className="font-heading fw-bold text-secondary">No Assigned Orders</h6>
          <p className="text-muted text-xs font-body mb-0">You're completely caught up! Orders assigned to you by the admin will appear here.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3.5">
          {assignedOrders.map((order) => (
            <div key={order.id} className="card border-light-subtle glass-card p-3 rounded-4 shadow-sm hover-expand">
              {/* Order Info Bar */}
              <div className="d-flex justify-content-between align-items-start mb-2.5">
                <div>
                  <h6 className="m-0 font-heading fw-extrabold text-success" style={{ fontSize: '14.5px' }}>
                    Order: {order.id}
                  </h6>
                  <span className="text-muted text-xxs font-body mt-0.5 d-block">
                    Assigned: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className={`badge rounded-pill font-heading text-xxs px-2.5 py-1 ${getBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Customer Details */}
              <div className="p-2.5 bg-light rounded-3 d-flex flex-column gap-2 text-xs font-body text-secondary border">
                <div className="d-flex align-items-center gap-2 text-dark font-heading fw-bold">
                  <span style={{ fontSize: '13px' }}>👤 {order.customerName}</span>
                </div>
                <div className="d-flex align-items-start gap-2">
                  <MapPin size={14} className="text-success mt-0.5 flex-shrink-0" />
                  <span className="text-truncate-2">{order.address}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-1 border-top pt-2">
                  <div className="d-flex align-items-center gap-1.5">
                    <MapIcon size={13} className="text-success" />
                    <span>Distance: <strong>{order.distanceKm.toFixed(1)} KM</strong></span>
                  </div>
                  <a 
                    href={`tel:${order.deliveryBoy.phone}`} // fallback phone
                    className="d-flex align-items-center gap-1 text-success fw-bold text-decoration-none"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Phone size={12} /> Call Customer
                  </a>
                </div>
              </div>

              {/* Actions Footer */}
              {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                <div className="border-top pt-3 mt-3 d-flex gap-2">
                  {order.status === 'Accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                      className="btn btn-success btn-sm rounded-pill flex-grow-1 font-heading fw-bold text-xs text-white py-2"
                    >
                      🌱 Mark As Preparing
                    </button>
                  )}
                  {order.status === 'Preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Out for Delivery')}
                      className="btn btn-success btn-sm rounded-pill flex-grow-1 font-heading fw-bold text-xs text-white py-2 d-flex align-items-center justify-content-center gap-1.5"
                    >
                      <Navigation size={13} /> Mark Out for Delivery
                    </button>
                  )}
                  {order.status === 'Out for Delivery' && (
                    <button
                      onClick={() => openOtpDialog(order)}
                      className="btn btn-success btn-sm rounded-pill flex-grow-1 font-heading fw-bold text-xs text-white py-2 d-flex align-items-center justify-content-center gap-1.5"
                    >
                      <Key size={13} /> Complete Delivery (Enter OTP)
                    </button>
                  )}
                </div>
              )}

              {order.status === 'Delivered' && (
                <div className="mt-2.5 p-2 bg-success bg-opacity-10 border border-success border-opacity-20 rounded-3 text-center text-success font-heading fw-bold text-xs">
                  ✅ Order Delivered & Verified!
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* OTP Dialog Modal */}
      {showOtpModal && otpTargetOrder && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered text-start px-3" style={{ maxWidth: '400px' }}>
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 bg-success bg-opacity-5 p-4 pb-2">
                <h5 className="modal-title font-heading fw-extrabold text-success d-flex align-items-center gap-1.5">
                  <Key size={18} /> Enter Security OTP
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowOtpModal(false)}
                ></button>
              </div>

              <form onSubmit={handleVerifyOtpAndDeliver}>
                <div className="modal-body p-4 pt-2 font-body text-xs text-center">
                  <p className="text-muted mb-3">
                    Please collect the 4-digit verification OTP from customer <strong>{otpTargetOrder.customerName}</strong> to authorize this delivery.
                  </p>

                  {otpError && (
                    <div className="alert alert-danger py-2 rounded-3 text-start d-flex align-items-center gap-1.5" style={{ fontSize: '11px' }}>
                      <ShieldAlert size={14} className="flex-shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <input
                    type="text"
                    required
                    maxLength="4"
                    className="form-control text-center font-heading fw-bold rounded-3 py-2.5 text-lg letter-spacing-md mb-3"
                    style={{ fontSize: '20px', letterSpacing: '8px' }}
                    placeholder="0000"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  <span className="text-muted d-block text-xxs">Hint: The OTP is displayed on customer's order tracking screen.</span>
                </div>

                <div className="modal-footer border-0 p-4 pt-0 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-3.5 py-1.5 font-heading fw-bold text-xs"
                    onClick={() => setShowOtpModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success rounded-pill px-4 py-1.5 text-white font-heading fw-bold text-xs"
                  >
                    Verify & Deliver
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styleBlock = (
  <style>{`
    .text-truncate-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `}</style>
);

export default DeliveryDashboard;
