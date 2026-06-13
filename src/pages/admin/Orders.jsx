import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { orderService, notificationService, deliveryBoyService } from '../../firebase/db';
import { useToast } from '../../components/Toast';
import {
  Check, X, Truck, Package, MessageCircle, MapPin,
  MapIcon, Bell, ArrowRight, ClipboardCheck
} from 'lucide-react';
import DeliveryMap from '../../components/DeliveryMap';

const Orders = () => {
  const { orders } = useApp();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryBoys, setDeliveryBoys] = useState([]);

  useEffect(() => {
    const unsub = deliveryBoyService.subscribe((list) => {
      const formatted = list.map(boy => ({
        id: boy.uid || boy.id,
        uid: boy.uid || boy.id,
        name: boy.displayName || boy.name,
        phone: boy.phone || '',
        photo: boy.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(boy.displayName || boy.name)}`,
        isOnline: boy.isOnline !== false
      }));
      setDeliveryBoys(formatted);
    });
    return () => unsub();
  }, []);

  // Manual Notification Form State
  const [customNotification, setCustomNotification] = useState('');
  const [notiLoading, setNotiLoading] = useState(false);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updated = await orderService.updateStatus(orderId, newStatus);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      toast.success(`Order status updated to: ${newStatus}`, 'Status Updated');
    } catch (err) {
      toast.error('Error updating status: ' + err.message);
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
      toast.success(`Manual push notification sent to ${selectedOrder.customerName}`, 'Notification Sent');
      setCustomNotification('');
    } catch (err) {
      toast.error('Error sending alert: ' + err.message);
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
                          {/* Delivered By chip — visible only for delivered orders */}
                          {ord.status === 'Delivered' && ord.deliveryBoy && (
                            <div className="d-flex align-items-center gap-1.5 mt-1.5">
                              <img
                                src={ord.deliveryBoy.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(ord.deliveryBoy.name)}&size=32`}
                                alt={ord.deliveryBoy.name}
                                className="rounded-circle object-fit-cover border border-success"
                                style={{ width: '18px', height: '18px' }}
                              />
                              <span
                                className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 font-body fw-semibold"
                                style={{ fontSize: '9.5px', padding: '2px 7px', borderRadius: '100px' }}
                              >
                                🚴 {ord.deliveryBoy.name}
                              </span>
                            </div>
                          )}
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
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-secondary text-xs fw-semibold font-body">Deliver To:</span>
                    <a 
                      href={`tel:${selectedOrder.customerPhone || '+91 99887 76655'}`} 
                      className="btn btn-xs btn-outline-success rounded-pill px-2.5 py-0.5 font-body d-flex align-items-center gap-1"
                      style={{ fontSize: '10.5px' }}
                    >
                      📞 Call Customer
                    </a>
                  </div>
                  <p className="m-0 text-dark font-body text-xs" style={{ fontSize: '12.5px', lineHeight: '1.4' }}>
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
                    <div className="d-flex flex-column gap-2 ">
                      <span className="text-xs text-muted mb-1">Advance order state:</span>
                      <div className="d-flex gap-2">
                        {selectedOrder.status === 'Accepted' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'Preparing')}
                            className="btn btn-success btn-sm rounded-pill w-100 font-heading fw-bold py-1.5 text-white"
                          >
                            Mark As Preparing
                          </button>
                        )}
                        {selectedOrder.status === 'Preparing' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'Out for Delivery')}
                            className="btn btn-success btn-sm rounded-pill w-100 font-heading fw-bold py-1.5 text-white"
                          >
                            Mark Out for Delivery
                          </button>
                        )}
                        {selectedOrder.status === 'Out for Delivery' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'Delivered')}
                            className="btn btn-success btn-sm rounded-pill w-100 font-heading fw-bold py-1.5 text-white"
                          >
                            Mark As Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {(selectedOrder.status === 'Delivered' || selectedOrder.status === 'Cancelled') && (
                    <div className="d-flex flex-column gap-2">
                      <div className="text-center py-2 bg-light rounded-3 text-xs text-muted font-body w-100">
                        Lifecycle finished. Order status is: <strong>{selectedOrder.status}</strong>
                      </div>
                      {selectedOrder.status === 'Delivered' && selectedOrder.deliveryBoy && (
                        <div className="border rounded-4 p-2.5 bg-success bg-opacity-5 d-flex align-items-center gap-2.5 mt-1 border-success-subtle">
                          <img 
                            src={selectedOrder.deliveryBoy.photo || 'https://via.placeholder.com/150'} 
                            alt={selectedOrder.deliveryBoy.name} 
                            className="rounded-circle object-fit-cover border border-success" 
                            style={{ width: '36px', height: '36px' }}
                          />
                          <div className="flex-grow-1 text-start">
                            <span className="text-muted font-body fw-bold text-xxs d-block" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>DELIVERED BY:</span>
                            <h6 className="m-0 font-heading fw-bold text-success" style={{ fontSize: '12.5px' }}>
                              {selectedOrder.deliveryBoy.name}
                            </h6>
                            <span className="text-muted font-body text-xs" style={{ fontSize: '11px' }}>
                              {selectedOrder.deliveryBoy.phone}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Delivery Boy Assignment Panel */}
                {selectedOrder.status !== 'Pending' && selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && (
                  <div className="border-top pt-3 mt-3">
                    <h6 className="font-heading fw-bold text-secondary text-xs mb-2.5">Delivery Boy Assignment:</h6>
                    
                    {selectedOrder.deliveryBoy ? (
                      <div className="p-2 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-4 d-flex align-items-center gap-2">
                        <img 
                          src={selectedOrder.deliveryBoy.photo} 
                          alt={selectedOrder.deliveryBoy.name} 
                          className="rounded-circle object-fit-cover border border-success" 
                          style={{ width: '40px', height: '40px' }}
                        />
                        <div className="flex-grow-1">
                          <h6 className="m-0 font-heading fw-bold text-success" style={{ fontSize: '12.5px' }}>
                            {selectedOrder.deliveryBoy.name}
                          </h6>
                          <span className="text-muted font-body text-xs" style={{ fontSize: '11px' }}>
                            {selectedOrder.deliveryBoy.phone}
                          </span>
                        </div>
                        <select
                          className="form-select form-select-sm w-auto rounded-pill border-success-subtle font-body"
                          style={{ fontSize: '10.5px', padding: '2px 24px 2px 8px' }}
                          value={selectedOrder.deliveryBoy.id}
                          onChange={async (e) => {
                            const dboy = deliveryBoys.find(b => b.id === e.target.value);
                            if (dboy) {
                              try {
                                const updated = await orderService.updateOrder(selectedOrder.id, { deliveryBoy: dboy });
                                setSelectedOrder(updated);
                                
                                // Push notifications to ALL THREE (Customer, Admin, and Delivery boy)!
                                await notificationService.addSystemNotification({
                                  title: 'Delivery Partner Updated! 🚴',
                                  body: `${dboy.name} (${dboy.phone}) is now assigned to deliver order ${selectedOrder.id}.`,
                                  type: 'order_status',
                                  userId: selectedOrder.userId
                                });
                                await notificationService.addSystemNotification({
                                  title: 'Delivery Partner Updated! 🛡️',
                                  body: `Order ${selectedOrder.id} has been assigned to ${dboy.name}.`,
                                  type: 'order_status',
                                  userId: 'admin'
                                });
                                await notificationService.addSystemNotification({
                                  title: 'New Delivery Assigned! 🚴',
                                  body: `You have been assigned order ${selectedOrder.id} to deliver to ${selectedOrder.customerName}.`,
                                  type: 'order_status',
                                  userId: dboy.uid || dboy.id
                                });
                                toast.success(`Assigned ${dboy.name} to Order ${selectedOrder.id}`, 'Partner Assigned');
                              } catch (err) {
                                toast.error("Failed to re-assign delivery boy: " + err.message);
                              }
                            }
                          }}
                        >
                          {deliveryBoys.map(b => (
                            <option key={b.id} value={b.id} disabled={!b.isOnline}>
                              {b.name} {b.isOnline ? '' : '(Offline)'}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-light border border-dashed rounded-4 text-center">
                        <span className="text-muted text-xs d-block mb-2">No delivery partner assigned yet.</span>
                        <div className="d-flex flex-wrap justify-content-center gap-1.5">
                          {deliveryBoys.map(b => (
                            <button
                              key={b.id}
                              type="button"
                              disabled={!b.isOnline}
                              onClick={async () => {
                                try {
                                  const updated = await orderService.updateOrder(selectedOrder.id, { deliveryBoy: b });
                                  setSelectedOrder(updated);
                                  
                                  // Push notifications to ALL THREE (Customer, Admin, and Delivery boy)!
                                  await notificationService.addSystemNotification({
                                    title: 'Delivery Partner Assigned! 🚴',
                                    body: `${b.name} (${b.phone}) has been assigned to deliver your order ${selectedOrder.id}.`,
                                    type: 'order_status',
                                    userId: selectedOrder.userId
                                  });
                                  await notificationService.addSystemNotification({
                                    title: 'Delivery Partner Assigned! 🛡️',
                                    body: `Order ${selectedOrder.id} has been assigned to ${b.name}.`,
                                    type: 'order_status',
                                    userId: 'admin'
                                  });
                                  await notificationService.addSystemNotification({
                                    title: 'New Delivery Assigned! 🚴',
                                    body: `You have been assigned order ${selectedOrder.id} to deliver to ${selectedOrder.customerName}.`,
                                    type: 'order_status',
                                    userId: b.uid || b.id
                                  });

                                  toast.success(`Successfully assigned ${b.name} to deliver this order!`, 'Partner Assigned');
                                } catch (err) {
                                  toast.error("Failed to assign delivery boy: " + err.message);
                                }
                              }}
                              className={`btn btn-xs rounded-pill px-2.5 py-1 font-body text-xs d-flex align-items-center gap-1 ${b.isOnline ? 'btn-outline-success' : 'btn-outline-secondary opacity-50'}`}
                              style={{ fontSize: '11px' }}
                            >
                              {b.isOnline ? `+ Assign ${b.name.split(' ')[0]}` : `${b.name.split(' ')[0]} (Offline)`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
