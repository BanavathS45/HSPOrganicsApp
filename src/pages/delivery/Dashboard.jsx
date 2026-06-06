import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { orderService, notificationService } from '../../firebase/db';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import {
  Truck, LogOut, Phone, MapPin, Check, MapIcon,
  ShieldAlert, Key, ClipboardCheck, Sparkles, Navigation, Bell, X,
  ChevronDown, User
} from 'lucide-react';

const DeliveryDashboard = () => {
  const { user, logout, orders, notifications, markNotificationsRead } = useApp();
  const { toast, confirm } = useToast();
  const navigate = useNavigate();
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpTargetOrder, setOtpTargetOrder] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Protect route
  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role !== 'delivery') { navigate('/'); }
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

  // Close panels on outside click
  useEffect(() => {
    const h = (e) => { 
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifPanel(false); 
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!user || user.role !== 'delivery') return null;

  // Notifications for this delivery user
  const myNotifs = notifications
    .filter(n => n.userId === user.uid || n.userId === 'all' || n.userId === 'delivery')
    .slice(0, 25);
  const unreadCount = myNotifs.filter(n => !n.read).length;

  const handleLogout = async () => {
    const ok = await confirm('You will be signed out of your delivery session.', {
      title: 'Log Out?',
      confirmLabel: 'Log Out',
      cancelLabel: 'Stay',
      danger: true,
    });
    if (ok) { await logout(); navigate('/login'); }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updated = await orderService.updateStatus(orderId, newStatus);
      await notificationService.addSystemNotification({
        title: `Order is ${newStatus}! 📦`, body: `Order ${orderId} marked as ${newStatus} by your delivery partner.`,
        type: 'order_status', userId: updated.userId
      });
      await notificationService.addSystemNotification({
        title: `Order ${newStatus}! 🛡️`, body: `Rider ${user.displayName} updated Order ${orderId} to ${newStatus}.`,
        type: 'order_status', userId: 'admin'
      });
      toast.success(`Order marked as: ${newStatus}`, 'Status Updated');
    } catch (err) { toast.error('Error updating order: ' + err.message); }
  };

  const openOtpDialog = (order) => { setOtpTargetOrder(order); setEnteredOtp(''); setOtpError(''); setShowOtpModal(true); };

  const handleVerifyOtpAndDeliver = async (e) => {
    e.preventDefault();
    if (!otpTargetOrder) return;
    if (enteredOtp.trim() !== otpTargetOrder.deliveryOTP) { setOtpError('Invalid OTP! Please check with the customer.'); return; }
    try {
      const updated = await orderService.updateStatus(otpTargetOrder.id, 'Delivered');
      await notificationService.addSystemNotification({
        title: 'Order Delivered! 🎉🌱', body: `Your order ${otpTargetOrder.id} has been verified & delivered. Enjoy!`,
        type: 'order_status', userId: updated.userId
      });
      await notificationService.addSystemNotification({
        title: 'Order Delivered! 🛡️', body: `Order ${otpTargetOrder.id} delivered by ${user.displayName}.`,
        type: 'order_status', userId: 'admin'
      });
      await notificationService.addSystemNotification({
        title: 'Delivery Completed! 🚴', body: `Well done! Order ${otpTargetOrder.id} delivered successfully.`,
        type: 'order_status', userId: user.uid
      });
      toast.success('Delivery verified and completed! 🎉', 'Delivered!');
      setShowOtpModal(false);
    } catch (err) { setOtpError('Error: ' + err.message); }
  };

  const fmtAddress = (addr) => {
    if (!addr) return 'No address';
    if (typeof addr === 'string') return addr;
    return [addr.addressLine, addr.city, addr.postalCode].filter(Boolean).join(', ');
  };

  const getBadgeClass = (s) => ({
    'Accepted': 'bg-info bg-opacity-10 text-info border border-info border-opacity-25',
    'Preparing': 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25',
    'Out for Delivery': 'bg-success bg-opacity-10 text-success border border-success border-opacity-25',
    'Delivered': 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25',
  }[s] || 'bg-light text-dark');

  return (
    <div className="w-100 min-vh-100 text-start" style={{ backgroundColor: '#f5f7f5', color: '#1a251e', pb: '80px' }}>
      <style>{`
        .delivery-header {
          position: sticky;
          top: 0;
          z-index: 1040;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .delivery-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          transition: all 0.2s ease;
        }
        .delivery-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
        }
        .badge-status {
          font-weight: 700;
          font-size: 11px;
          padding: 5px 12px;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .notif-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #dc3545;
          color: white;
          border: 2px solid white;
          font-size: 9px;
          font-weight: 700;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notif-panel {
          position: absolute;
          right: 0;
          top: 48px;
          width: 320px;
          max-height: 420px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.06);
          overflow: hidden;
          z-index: 1050;
        }
        .notif-item {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          transition: background 0.15s;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .notif-item:hover {
          background: #f8faf8;
        }
        .profile-dropdown {
          position: absolute;
          right: 0;
          top: 48px;
          width: 240px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.06);
          overflow: hidden;
          z-index: 1050;
          padding: 6px;
        }
        .otp-input-field {
          letter-spacing: 12px;
          font-size: 28px;
          font-weight: 800;
          text-align: center;
          border: 2px solid #e1e7e2;
          border-radius: 12px;
          padding: 10px;
          transition: all 0.2s;
          max-width: 220px;
          margin: 0 auto;
        }
        .otp-input-field:focus {
          border-color: #2e7d32;
          box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
          outline: none;
        }
      `}</style>

      {/* Modern App Header */}
      <header className="delivery-header py-3 px-4 shadow-sm">
        <div className="d-flex align-items-center justify-content-between max-width-lg mx-auto">
          {/* Logo / Brand */}
          <div className="d-flex align-items-center gap-2.5">
            <div className="rounded-3 bg-success bg-opacity-10 p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
              <Truck className="text-success" size={20} />
            </div>
            <div>
              <span className="fw-extrabold text-success font-heading d-block" style={{ fontSize: '15px', letterSpacing: '-0.3px', lineHeight: '1.2' }}>HSP ORGANICS</span>
              <span className="text-muted text-xxs font-body fw-medium" style={{ letterSpacing: '0.5px' }}>RIDER CONSOLE</span>
            </div>
          </div>

          {/* Right Header Elements */}
          <div className="d-flex align-items-center gap-3">
            {/* Notifications */}
            <div className="position-relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifPanel(p => !p); if (!showNotifPanel && unreadCount > 0) markNotificationsRead(); }}
                className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center border"
                style={{ width: '38px', height: '38px', backgroundColor: '#ffffff', borderColor: '#eaeaea' }}
                title="Notifications"
              >
                <Bell size={18} className={unreadCount > 0 ? 'text-success' : 'text-secondary'} />
                {unreadCount > 0 && (
                  <span className="notif-badge">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Properly Aligned Notification Panel */}
              {showNotifPanel && (
                <div className="notif-panel animate-fade-in-up">
                  <div className="d-flex align-items-center justify-content-between px-3 py-2.5 border-bottom bg-light">
                    <span className="font-heading fw-bold text-success" style={{ fontSize: '13px' }}>🔔 Notifications</span>
                    <button onClick={() => setShowNotifPanel(false)}
                      className="btn btn-light btn-xs border-0 rounded-circle p-0 d-flex align-items-center justify-content-center"
                      style={{ width: '22px', height: '22px' }}>
                      <X size={12} className="text-muted" />
                    </button>
                  </div>
                  <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                    {myNotifs.length === 0 ? (
                      <div className="text-center py-5">
                        <Bell size={28} className="text-muted mb-2 text-opacity-30 mx-auto" />
                        <p className="text-muted m-0 font-body" style={{ fontSize: '12.5px' }}>No notifications yet</p>
                      </div>
                    ) : myNotifs.map(n => (
                      <div key={n.id} className="notif-item" style={{ background: !n.read ? 'rgba(46,125,50,0.03)' : 'transparent' }}>
                        <div className="rounded-circle bg-success bg-opacity-10 p-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '32px', height: '32px' }}>
                          <Bell size={14} className="text-success" />
                        </div>
                        <div className="flex-grow-1 text-start">
                          <div className="font-heading fw-bold text-dark" style={{ fontSize: '12px', lineHeight: '1.3' }}>{n.title}</div>
                          <div className="text-muted font-body mt-1" style={{ fontSize: '11px', lineHeight: '1.4' }}>{n.body}</div>
                          <div className="text-muted text-xxs mt-1.5 fw-medium">
                            {new Date(n.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {!n.read && (
                          <div className="bg-success rounded-circle flex-shrink-0" style={{ width: '6px', height: '6px', marginTop: '6px' }}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Container */}
            <div className="position-relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="btn btn-light rounded-pill p-1 pe-2.5 d-flex align-items-center gap-2 border"
                style={{ backgroundColor: '#ffffff', borderColor: '#eaeaea' }}
              >
                <img
                  src={user.photoURL || 'https://via.placeholder.com/150'}
                  alt={user.displayName}
                  className="rounded-circle object-fit-cover border border-success"
                  style={{ width: '28px', height: '28px' }}
                />
                <ChevronDown size={14} className="text-secondary" />
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="profile-dropdown animate-fade-in-up text-start">
                  <div className="px-3 py-2.5 border-bottom">
                    <div className="fw-extrabold text-success font-heading" style={{ fontSize: '13px' }}>
                      {user.displayName}
                    </div>
                    <div className="text-muted font-body text-xxs" style={{ fontSize: '10px' }}>
                      {user.email || 'Delivery Executive'}
                    </div>
                  </div>
                  <div className="py-1">
                    <div className="px-3 py-2 text-xxs text-muted fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>
                      Account Info
                    </div>
                    <div className="px-3 py-1.5 font-body text-xs text-secondary d-flex align-items-center gap-1.5">
                      <Phone size={12} className="text-success" />
                      {user.phone || 'No Phone Linked'}
                    </div>
                  </div>
                  <div className="border-top p-1">
                    <button
                      onClick={handleLogout}
                      className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger border-0 bg-transparent w-100 rounded-3 text-start font-heading fw-bold"
                      style={{ fontSize: '12px' }}
                    >
                      <LogOut size={14} />
                      Log Out Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container py-4 px-3 max-width-lg mx-auto" style={{ pb: '80px' }}>
        {/* Welcome Dashboard Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="font-heading fw-extrabold text-success m-0" style={{ fontSize: '18px' }}>
              Welcome back, {user.displayName.split(' ')[0]}!
            </h4>
            <p className="text-muted text-xxs font-body m-0 mt-0.5">Manage your assigned orders and deliveries</p>
          </div>
          <span className="badge bg-success bg-opacity-10 text-success fw-bold font-heading text-xxs px-2.5 py-1.5 rounded-pill">
            🟢 Active
          </span>
        </div>

        {/* Assigned Deliveries Header */}
        <h6 className="font-heading fw-extrabold text-secondary mb-3 d-flex align-items-center gap-2" style={{ fontSize: '13px', letterSpacing: '0.3px' }}>
          <Truck size={16} className="text-success" /> ASSIGNED DELIVERIES ({assignedOrders.length})
        </h6>

        {assignedOrders.length === 0 ? (
          <div className="delivery-card p-5 text-center">
            <Sparkles size={40} className="text-success text-opacity-30 mb-2 mx-auto" />
            <h6 className="font-heading fw-bold text-secondary">No Deliveries Pending</h6>
            <p className="text-muted text-xs font-body mb-0">
              You are completely caught up! New assigned orders from the administrator will appear here.
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {assignedOrders.map((order) => (
              <div key={order.id} className="delivery-card p-3.5">
                {/* Card Header */}
                <div className="d-flex justify-content-between align-items-start mb-3 border-bottom pb-2.5">
                  <div>
                    <h6 className="m-0 font-heading fw-extrabold text-success" style={{ fontSize: '14.5px' }}>
                      Order ID: {order.id}
                    </h6>
                    <span className="text-muted text-xxs font-body d-block mt-0.5">
                      Created: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`badge-status ${getBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="p-3 bg-light rounded-4 d-flex flex-column gap-2 text-xs font-body text-secondary border mb-3">
                  <div className="d-flex align-items-center gap-2 text-dark font-heading fw-bold">
                    <span style={{ fontSize: '13px' }}>👤 {order.customerName}</span>
                  </div>
                  <div className="d-flex align-items-start gap-2 border-top pt-2 mt-1">
                    <MapPin size={14} className="text-success mt-0.5 flex-shrink-0" />
                    <span className="text-truncate-2 text-dark">{fmtAddress(order.address)}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-1">
                    <div className="d-flex align-items-center gap-1.5 text-success font-heading fw-bold">
                      <MapIcon size={13} />
                      <span>Distance: {order.distanceKm?.toFixed(1) || '0.0'} KM</span>
                    </div>
                    {order.customerPhone ? (
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="btn btn-success btn-xs rounded-pill px-3 py-1 fw-bold text-decoration-none text-white d-flex align-items-center gap-1"
                        style={{ fontSize: '10.5px' }}
                      >
                        <Phone size={11} /> Call Customer
                      </a>
                    ) : (
                      <span className="text-muted text-xxs d-flex align-items-center gap-1">
                        <Phone size={11} /> No phone on file
                      </span>
                    )}
                  </div>
                </div>

                {/* Items Summary Card */}
                <div className="border rounded-4 p-3 mb-3 bg-white" style={{ fontSize: '11.5px' }}>
                  <span className="text-secondary fw-bold d-block mb-1.5 font-heading" style={{ letterSpacing: '0.3px' }}>ITEMS IN ORDER</span>
                  <div className="d-flex flex-column gap-1">
                    {order.items?.map(item => (
                      <div key={item.id} className="d-flex justify-content-between text-muted">
                        <span>{item.name} × {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex justify-content-between font-heading fw-extrabold text-success border-top pt-2 mt-2" style={{ fontSize: '13px' }}>
                    <span>Total Bill</span>
                    <span>₹{order.total}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                  <div className="d-flex gap-2">
                    {order.status === 'Accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                        className="btn btn-success btn-sm rounded-pill flex-grow-1 font-heading fw-bold text-white py-2 shadow-sm"
                      >
                        🌱 Mark As Preparing
                      </button>
                    )}
                    {order.status === 'Preparing' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Out for Delivery')}
                        className="btn btn-success btn-sm rounded-pill flex-grow-1 font-heading fw-bold text-white py-2 d-flex align-items-center justify-content-center gap-1 shadow-sm"
                      >
                        <Navigation size={13} /> Mark Out for Delivery
                      </button>
                    )}
                    {order.status === 'Out for Delivery' && (
                      <button
                        onClick={() => openOtpDialog(order)}
                        className="btn btn-success btn-sm rounded-pill flex-grow-1 font-heading fw-bold text-white py-2 d-flex align-items-center justify-content-center gap-1 shadow-sm"
                      >
                        <Key size={13} /> Complete Delivery (OTP)
                      </button>
                    )}
                  </div>
                )}

                {order.status === 'Delivered' && (
                  <div className="p-2.5 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 text-center text-success font-heading fw-bold text-xs">
                    ✅ Order Delivered & Verified!
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* OTP Verification Modal (Good UI & full screen layout on mobile) */}
      {showOtpModal && otpTargetOrder && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(5, 20, 10, 0.6)', backdropFilter: 'blur(5px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered text-start px-3" style={{ maxWidth: '400px' }}>
            <div className="modal-content rounded-4 border-0 shadow-lg" style={{ overflow: 'hidden' }}>
              <div className="modal-header border-0 bg-success bg-opacity-5 p-4 pb-2">
                <h5 className="modal-title font-heading fw-extrabold text-success d-flex align-items-center gap-1">
                  <Key size={18} /> Enter Security OTP
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowOtpModal(false)} />
              </div>
              <form onSubmit={handleVerifyOtpAndDeliver}>
                <div className="modal-body p-4 pt-2 font-body text-xs text-center">
                  <p className="text-muted mb-3.5">
                    Ask customer <strong>{otpTargetOrder.customerName}</strong> for the 4-digit OTP shown on their order status screen to complete delivery.
                  </p>
                  {otpError && (
                    <div className="alert alert-danger py-2 rounded-3 text-start d-flex align-items-center gap-1.5" style={{ fontSize: '11px' }}>
                      <ShieldAlert size={14} className="flex-shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}
                  <div className="my-4">
                    <input
                      type="text"
                      required
                      maxLength="4"
                      className="form-control otp-input-field"
                      placeholder="••••"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <span className="text-muted d-block text-xxs fw-medium">
                    Security verification is required to update order status.
                  </span>
                </div>
                <div className="modal-footer border-0 p-4 pt-0 d-flex gap-2.5">
                  <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1 font-heading fw-bold text-xs"
                    onClick={() => setShowOtpModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success rounded-pill px-4 flex-grow-1 text-white font-heading fw-bold text-xs py-2 shadow-sm">
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

export default DeliveryDashboard;
