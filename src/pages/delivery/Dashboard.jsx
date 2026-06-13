import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { orderService, notificationService, biometricService, deliveryBoyService } from '../../firebase/db';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import {
  Truck, LogOut, Phone, MapPin, MapIcon,
  ShieldAlert, Key, Sparkles, Navigation, Bell, X,
  ChevronDown, History, Fingerprint, Package
} from 'lucide-react';

const styles = `

  .dd {
    --g: #166534;
    --gm: #16a34a;
    --gl: #dcfce7;
    --gmid: #bbf7d0;
    --bg: #ffffff;
    --bg2: #f8faf9;
    --bg3: #f0f7f3;
    --bd: #e2ece7;
    --bds: #c8ddd1;
    --t1: #0d1f15;
    --t2: #2d4a39;
    --t3: #6b8a78;
    --red: #dc2626;
    --redl: #fef2f2;
    --amber: #b45309;
    --amberl: #fffbeb;
    --blue: #1d4ed8;
    --bluel: #eff6ff;
    min-height: 100vh;
    background: var(--bg2);
   
    color: var(--t1);
  }

  /* ── HEADER ── */
  .dd-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--bg);
    border-bottom: 0.5px solid var(--bd);
    padding: 0 20px;
    height: 58px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dd-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .dd-brand-icon {
    width: 36px;
    height: 36px;
    background: var(--gl);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--g);
  }

  .dd-brand-name {
  
    font-size: 14px;
    font-weight: 800;
    color: var(--g);
    letter-spacing: -0.3px;
    line-height: 1.1;
  }

  .dd-brand-sub {
    font-size: 10px;
    font-weight: 600;
    color: var(--t3);
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }

  .dd-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dd-icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 0.5px solid var(--bd);
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--t3);
    transition: all 0.14s;
    position: relative;
    flex-shrink: 0;
  }
  .dd-icon-btn:hover { background: var(--bg3); border-color: var(--bds); color: var(--t2); }
  .dd-icon-btn.active { background: var(--gl); border-color: var(--gmid); color: var(--g); }

  .dd-notif-dot {
    position: absolute;
    top: -1px;
    right: -1px;
    width: 17px;
    height: 17px;
    background: var(--red);
    color: #fff;
    border: 2px solid var(--bg);
    font-size: 9px;
    font-weight: 700;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dd-profile-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px 4px 4px;
    border: 0.5px solid var(--bd);
    border-radius: 999px;
    background: var(--bg);
    cursor: pointer;
    transition: all 0.14s;
  }
  .dd-profile-btn:hover { background: var(--bg3); border-color: var(--bds); }

  .dd-profile-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    object-fit: cover;
    border: 1.5px solid var(--gm);
  }

  /* ── DROPDOWN PANELS ── */
  .dd-panel-wrap {
    position: relative;
  }

  .dd-panel {
    position: absolute;
    right: 0;
    top: 44px;
    background: var(--bg);
    border: 0.5px solid var(--bd);
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.10);
    z-index: 200;
    overflow: hidden;
    animation: dd-panel-in 0.18s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes dd-panel-in {
    from { opacity: 0; transform: translateY(8px) scale(0.97); }
    to   { opacity: 1; transform: none; }
  }

  .dd-notif-panel { width: 300px; }
  .dd-profile-panel { width: 220px; }

  .dd-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-bottom: 0.5px solid var(--bd);
    background: var(--bg2);
  }

  .dd-panel-head-title {
 
    font-size: 12.5px;
    font-weight: 800;
    color: var(--g);
  }

  .dd-panel-close {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 0.5px solid var(--bd);
    background: var(--bg);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--t3);
  }

  .dd-notif-scroll {
    max-height: 340px;
    overflow-y: auto;
  }

  .dd-notif-item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 11px 14px;
    border-bottom: 0.5px solid var(--bd);
    transition: background 0.12s;
  }
  .dd-notif-item:hover { background: var(--bg2); }
  .dd-notif-item:last-child { border-bottom: none; }

  .dd-notif-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--gl);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--g);
    flex-shrink: 0;
  }

  .dd-notif-title {
  
    font-size: 11.5px;
    font-weight: 700;
    color: var(--t1);
    line-height: 1.3;
  }

  .dd-notif-body {
    font-size: 11px;
    color: var(--t3);
    margin-top: 2px;
    line-height: 1.4;
  }

  .dd-notif-time {
    font-size: 10px;
    color: var(--t3);
    margin-top: 3px;
    font-weight: 500;
  }

  .dd-notif-unread-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--gm);
    flex-shrink: 0;
    margin-top: 5px;
  }

  .dd-notif-empty {
    text-align: center;
    padding: 36px 20px;
    color: var(--t3);
    font-size: 12.5px;
  }

  /* Profile panel */
  .dd-profile-info {
    padding: 12px 14px;
    border-bottom: 0.5px solid var(--bd);
    background: var(--bg2);
  }

  .dd-profile-name {

    font-size: 13px;
    font-weight: 800;
    color: var(--g);
  }

  .dd-profile-email {
    font-size: 10.5px;
    color: var(--t3);
    margin-top: 2px;
  }

  .dd-menu-section {
    padding: 4px;
  }

  .dd-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
 
    font-size: 12px;
    font-weight: 700;
    color: var(--t2);
    text-align: left;
    transition: background 0.12s;
  }
  .dd-menu-item:hover { background: var(--bg3); }
  .dd-menu-item.danger { color: var(--red); }
  .dd-menu-item.danger:hover { background: var(--redl); }

  /* ── MAIN ── */
  .dd-main {
    max-width: 640px;
    margin: 0 auto;
    padding: 24px 16px 80px;
  }

  /* Welcome strip */
  .dd-welcome {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .dd-welcome-name {
 
    font-size: 18px;
    font-weight: 800;
    color: var(--g);
    margin: 0;
    letter-spacing: -0.3px;
  }

  .dd-welcome-sub {
    font-size: 12px;
    color: var(--t3);
    margin: 3px 0 0;
  }

  .dd-active-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 700;
    color: var(--g);
    background: var(--gl);
    padding: 5px 12px;
    border-radius: 999px;
 
  }

  .dd-active-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--gm);
  }

  /* Section header */
  .dd-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .dd-section-title {
    display: flex;
    align-items: center;
    gap: 7px;

    font-size: 12px;
    font-weight: 700;
    color: var(--t3);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin: 0;
  }

  .dd-toggle-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border: 0.5px solid var(--bd);
    border-radius: 999px;
    background: var(--bg);

    font-size: 11.5px;
    font-weight: 700;
    color: var(--t2);
    cursor: pointer;
    transition: all 0.14s;
  }
  .dd-toggle-btn:hover { background: var(--bg3); border-color: var(--bds); }
  .dd-toggle-btn.active { background: var(--gl); border-color: var(--gmid); color: var(--g); }

  /* Empty state */
  .dd-empty {
    background: var(--bg);
    border: 0.5px solid var(--bd);
    border-radius: 18px;
    text-align: center;
    padding: 56px 24px;
  }

  .dd-empty-icon { color: var(--bds); margin: 0 auto 14px; display: block; }
  .dd-empty-title {  font-weight: 800; font-size: 15px; color: var(--t2); margin: 0 0 6px; }
  .dd-empty-sub { font-size: 12.5px; color: var(--t3); margin: 0; line-height: 1.5; }

  /* ── ORDER CARD ── */
  .dd-order-card {
    background: var(--bg);
    border: 0.5px solid var(--bd);
    border-radius: 18px;
    overflow: hidden;
    margin-bottom: 14px;
    transition: box-shadow 0.18s, border-color 0.18s;
  }
  .dd-order-card:hover {
    box-shadow: 0 4px 18px rgba(22,101,52,0.08);
    border-color: var(--bds);
  }

  .dd-order-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px 18px 14px;
    border-bottom: 0.5px solid var(--bd);
    background: var(--bg2);
  }

  .dd-order-id {
  
    font-size: 14px;
    font-weight: 800;
    color: var(--g);
    margin: 0;
  }

  .dd-order-date {
    font-size: 11px;
    color: var(--t3);
    margin: 3px 0 0;
  }

  /* Status badges */
  .dd-status {
    font-size: 10.5px;
    font-weight: 700;
    padding: 4px 11px;
    border-radius: 999px;
    letter-spacing: 0.2px;
    white-space: nowrap;
   
  }

  .dd-status-accepted { background: var(--bluel); color: var(--blue); }
  .dd-status-preparing { background: var(--amberl); color: var(--amber); }
  .dd-status-out { background: var(--gl); color: var(--g); }
  .dd-status-delivered { background: var(--bg3); color: var(--t3); }
  .dd-status-cancelled { background: var(--redl); color: var(--red); }

  /* Customer block */
  .dd-customer-block {
    margin: 14px 18px;
    background: var(--bg2);
    border: 0.5px solid var(--bd);
    border-radius: 14px;
    padding: 13px 15px;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .dd-cust-name {
  
    font-size: 13.5px;
    font-weight: 800;
    color: var(--t1);
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .dd-cust-row {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    font-size: 12.5px;
    color: var(--t2);
    padding-top: 9px;
    border-top: 0.5px solid var(--bd);
  }

  .dd-cust-row-icon { color: var(--gm); flex-shrink: 0; margin-top: 1px; }

  .dd-cust-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 9px;
    border-top: 0.5px solid var(--bd);
  }

  .dd-dist-chip {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
    color: var(--g);
  }

  .dd-call-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 13px;
    background: var(--g);
    color: #fff;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
   
    transition: background 0.14s;
    border: none;
  }
  .dd-call-btn:hover { background: #14532d; color: #fff; }

  /* Items block */
  .dd-items-block {
    margin: 0 18px 14px;
    border: 0.5px solid var(--bd);
    border-radius: 14px;
    overflow: hidden;
  }

  .dd-items-head {
    padding: 9px 14px;
    background: var(--bg2);
    border-bottom: 0.5px solid var(--bd);
    font-size: 10.5px;
    font-weight: 700;
    color: var(--t3);
    text-transform: uppercase;
    letter-spacing: 0.6px;
  
  }

  .dd-item-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 9px 14px;
    font-size: 12.5px;
    color: var(--t2);
    border-bottom: 0.5px solid var(--bd);
  }
  .dd-item-row:last-child { border-bottom: none; }

  .dd-items-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 11px 14px;
    border-top: 0.5px solid var(--bd);
    background: var(--bg2);
  }

  .dd-items-total-label {
  
    font-size: 13px;
    font-weight: 800;
    color: var(--t2);
  }

  .dd-items-total-val {
 
    font-size: 15px;
    font-weight: 800;
    color: var(--g);
  }

  /* Action footer */
  .dd-order-footer {
    padding: 12px 18px;
    border-top: 0.5px solid var(--bd);
    background: var(--bg2);
  }

  .dd-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    width: 100%;
    padding: 11px;
    border: none;
    border-radius: 999px;

    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.14s, transform 0.1s;
    letter-spacing: 0.1px;
  }
  .dd-action-btn:active { transform: scale(0.98); }

  .dd-action-btn.primary {
    background: var(--g);
    color: #fff;
    box-shadow: 0 2px 10px rgba(22,101,52,0.20);
  }
  .dd-action-btn.primary:hover { background: #14532d; }

  .dd-delivered-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    background: var(--gl);
    border-radius: 10px;
 
    font-size: 12.5px;
    font-weight: 700;
    color: var(--g);
  }

  /* ── OTP MODAL ── */
  .dd-otp-overlay {
    position: fixed;
    inset: 0;
    background: rgba(5, 20, 10, 0.55);
    backdrop-filter: blur(5px);
    z-index: 1060;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .dd-otp-modal {
    background: var(--bg);
    border-radius: 22px;
    width: 100%;
    max-width: 380px;
    overflow: hidden;
    border: 0.5px solid var(--bd);
    box-shadow: 0 24px 60px rgba(0,0,0,0.15);
    animation: dd-modal-in 0.22s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes dd-modal-in {
    from { opacity: 0; transform: translateY(14px) scale(0.97); }
    to   { opacity: 1; transform: none; }
  }

  .dd-otp-head {
    padding: 20px 22px 16px;
    border-bottom: 0.5px solid var(--bd);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg2);
  }

  .dd-otp-title {
 
    font-size: 15px;
    font-weight: 800;
    color: var(--g);
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 0;
  }

  .dd-otp-close {
    width: 26px; height: 26px;
    border-radius: 50%;
    border: 0.5px solid var(--bd);
    background: var(--bg);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--t3);
    transition: all 0.14s;
  }
  .dd-otp-close:hover { background: var(--bg3); color: var(--t1); }

  .dd-otp-body {
    padding: 22px;
    text-align: center;
  }

  .dd-otp-desc {
    font-size: 13px;
    color: var(--t3);
    line-height: 1.6;
    margin: 0 0 20px;
  }

  .dd-otp-desc strong { color: var(--t2); }

  .dd-otp-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--redl);
    border: 0.5px solid #fecaca;
    border-radius: 10px;
    padding: 10px 13px;
    font-size: 12px;
    color: var(--red);
    text-align: left;
    margin-bottom: 16px;
  }

  .dd-otp-input {
    letter-spacing: 14px;
    font-size: 30px;
    font-weight: 800;
    text-align: center;
    border: 1.5px solid var(--bd);
    border-radius: 14px;
    padding: 12px 10px 12px 24px;
    width: 100%;
    max-width: 200px;
  
    color: var(--t1);
    background: var(--bg);
    transition: border-color 0.15s, box-shadow 0.15s;
    outline: none;
    box-sizing: border-box;
  }
  .dd-otp-input:focus {
    border-color: var(--gm);
    box-shadow: 0 0 0 3px rgba(22,163,74,0.10);
  }

  .dd-otp-hint {
    font-size: 11px;
    color: var(--t3);
    margin-top: 12px;
  }

  .dd-otp-foot {
    padding: 14px 22px;
    border-top: 0.5px solid var(--bd);
    display: flex;
    gap: 10px;
    background: var(--bg2);
  }

  .dd-otp-cancel {
    flex: 1;
    padding: 9px;
    border: 0.5px solid var(--bd);
    background: var(--bg);
    border-radius: 999px;
   
    font-size: 13px;
    font-weight: 700;
    color: var(--t2);
    cursor: pointer;
    transition: background 0.14s;
  }
  .dd-otp-cancel:hover { background: var(--bg3); }

  .dd-otp-submit {
    flex: 1;
    padding: 9px;
    border: none;
    background: var(--g);
    border-radius: 999px;
   
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(22,101,52,0.22);
    transition: background 0.14s;
  }
  .dd-otp-submit:hover { background: #14532d; }

  @media (max-width: 480px) {
    .dd-header { padding: 0 12px; }
    .dd-main { padding: 16px 12px 80px; }
    .dd-notif-panel { width: 280px; }
  }
`;

const DeliveryDashboard = () => {
  const { user, loading, logout, orders, notifications, markNotificationsRead } = useApp();
  const { toast, confirm } = useToast();
  const navigate = useNavigate();
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpTargetOrder, setOtpTargetOrder] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const [isOnline, setIsOnline] = useState(user?.isOnline !== false);

  const handleToggleOnline = async () => {
    const newStatus = !isOnline;
    try {
      await deliveryBoyService.update(user.uid || user.id, { isOnline: newStatus });
      setIsOnline(newStatus);
      user.isOnline = newStatus;
      toast.success(newStatus ? 'You are now online' : 'You are now offline', 'Status Updated');
    } catch (err) {
      toast.error('Could not update status: ' + err.message);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) navigate('/login');
    else if (user.role !== 'delivery') navigate('/');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      const myOrders = orders.filter(o =>
        o.deliveryBoy &&
        (o.deliveryBoy.uid === user.uid || o.deliveryBoy.id === user.uid) &&
        o.status !== 'Delivered' && o.status !== 'Cancelled'
      );
      const myHistory = orders.filter(o =>
        o.deliveryBoy &&
        (o.deliveryBoy.uid === user.uid || o.deliveryBoy.id === user.uid) &&
        (o.status === 'Delivered' || o.status === 'Cancelled')
      );
      setAssignedOrders(myOrders);
      setHistoryOrders(myHistory);
    }
  }, [orders, user]);

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifPanel(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (loading || !user || user.role !== 'delivery') return null;

  const myNotifs = notifications
    .filter(n => n.userId === user.uid || n.userId === 'all' || n.userId === 'delivery')
    .slice(0, 25);
  const unreadCount = myNotifs.filter(n => !n.read).length;

  const handleLogout = async () => {
    const ok = await confirm('You will be signed out of your delivery session.', {
      title: 'Log Out?', confirmLabel: 'Log Out', cancelLabel: 'Stay', danger: true,
    });
    if (ok) { await logout(); navigate('/login'); }
  };

  const handleBiometricToggle = async () => {
    if (biometricService.hasRegistered(user.uid)) {
      const ok = await confirm('This will remove fingerprint login from this device.', {
        title: 'Disable Fingerprint?', confirmLabel: 'Disable', cancelLabel: 'Keep', danger: true,
      });
      if (ok) {
        localStorage.removeItem('hsp_biometric_cred_' + user.uid);
        localStorage.removeItem('hsp_biometric_user_' + user.uid);
        toast.success('Fingerprint login disabled.');
        setShowProfileMenu(false);
      }
    } else {
      try {
        await biometricService.register(user.uid);
        localStorage.setItem(`hsp_biometric_user_${user.uid}`, JSON.stringify(user));
        toast.success('Fingerprint / Face ID login enabled for this device!');
        setShowProfileMenu(false);
      } catch (e) {
        toast.error('Could not enable biometric: ' + e.message);
      }
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updated = await orderService.updateStatus(orderId, newStatus);
      await notificationService.addSystemNotification({
        title: `Order is ${newStatus}! 📦`,
        body: `Order ${orderId} marked as ${newStatus} by your delivery partner.`,
        type: 'order_status', userId: updated.userId,
      });
      await notificationService.addSystemNotification({
        title: `Order ${newStatus}! 🛡️`,
        body: `Rider ${user.displayName} updated Order ${orderId} to ${newStatus}.`,
        type: 'order_status', userId: 'admin',
      });
      toast.success(`Order marked as: ${newStatus}`, 'Status Updated');
    } catch (err) { toast.error('Error updating order: ' + err.message); }
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
      setOtpError('Invalid OTP! Please check with the customer.');
      return;
    }
    try {
      const updated = await orderService.updateStatus(otpTargetOrder.id, 'Delivered');
      await notificationService.addSystemNotification({
        title: 'Order Delivered! 🎉🌱',
        body: `Your order ${otpTargetOrder.id} has been verified & delivered. Enjoy!`,
        type: 'order_status', userId: updated.userId,
      });
      await notificationService.addSystemNotification({
        title: 'Order Delivered! 🛡️',
        body: `Order ${otpTargetOrder.id} delivered by ${user.displayName}.`,
        type: 'order_status', userId: 'admin',
      });
      await notificationService.addSystemNotification({
        title: 'Delivery Completed! 🚴',
        body: `Well done! Order ${otpTargetOrder.id} delivered successfully.`,
        type: 'order_status', userId: user.uid,
      });
      toast.success('Delivery verified and completed!', 'Delivered!');
      setShowOtpModal(false);
    } catch (err) { setOtpError('Error: ' + err.message); }
  };

  const fmtAddress = (addr) => {
    if (!addr) return 'No address';
    if (typeof addr === 'string') return addr;
    return [addr.addressLine, addr.city, addr.postalCode].filter(Boolean).join(', ');
  };

  const statusClass = (s) => ({
    'Accepted': 'dd-status-accepted',
    'Preparing': 'dd-status-preparing',
    'Out for Delivery': 'dd-status-out',
    'Delivered': 'dd-status-delivered',
    'Cancelled': 'dd-status-cancelled',
  }[s] || 'dd-status-delivered');

  const displayOrders = showHistory ? historyOrders : assignedOrders;

  return (
    <div className="dd">
      <style>{styles}</style>

      {/* ── Header ── */}
      <header className="dd-header">
        <div className="dd-brand">
          <div className="dd-brand-icon">
            <Truck size={18} />
          </div>
          <div>
            <div className="dd-brand-name">HSP Organics</div>
            <div className="dd-brand-sub">Rider Console</div>
          </div>
        </div>

        <div className="dd-header-right">
          {/* History toggle */}
          <button
            className={`dd-icon-btn${showHistory ? ' active' : ''}`}
            onClick={() => setShowHistory(h => !h)}
            title="Delivery History"
          >
            <History size={16} />
          </button>

          {/* Notifications */}
          <div className="dd-panel-wrap" ref={notifRef}>
            <button
              className={`dd-icon-btn${showNotifPanel ? ' active' : ''}`}
              onClick={() => {
                setShowNotifPanel(p => !p);
                if (!showNotifPanel && unreadCount > 0) markNotificationsRead();
              }}
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="dd-notif-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>

            {showNotifPanel && (
              <div className="dd-panel dd-notif-panel">
                <div className="dd-panel-head">
                  <span className="dd-panel-head-title">Notifications</span>
                  <button className="dd-panel-close" onClick={() => setShowNotifPanel(false)}>
                    <X size={12} />
                  </button>
                </div>
                <div className="dd-notif-scroll">
                  {myNotifs.length === 0 ? (
                    <div className="dd-notif-empty">
                      <Bell size={26} style={{ marginBottom: '8px', opacity: 0.3 }} />
                      <div>No notifications yet</div>
                    </div>
                  ) : myNotifs.map(n => (
                    <div key={n.id} className="dd-notif-item" style={{ background: !n.read ? 'rgba(22,163,74,0.03)' : undefined }}>
                      <div className="dd-notif-icon"><Bell size={13} /></div>
                      <div style={{ flex: 1 }}>
                        <div className="dd-notif-title">{n.title}</div>
                        <div className="dd-notif-body">{n.body}</div>
                        <div className="dd-notif-time">
                          {new Date(n.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {!n.read && <div className="dd-notif-unread-dot" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="dd-panel-wrap" ref={profileRef}>
            <button className="dd-profile-btn" onClick={() => setShowProfileMenu(p => !p)}>
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || '')}&background=bbf7d0&color=166534`}
                alt={user.displayName}
                className="dd-profile-avatar"
              />
              <ChevronDown size={12} style={{ color: 'var(--t3)' }} />
            </button>

            {showProfileMenu && (
              <div className="dd-panel dd-profile-panel">
                <div className="dd-profile-info">
                  <div className="dd-profile-name">{user.displayName}</div>
                  <div className="dd-profile-email">{user.email || 'Delivery Executive'}</div>
                  {user.phone && (
                    <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={11} style={{ color: 'var(--gm)' }} />
                      {user.phone}
                    </div>
                  )}
                </div>
                <div className="dd-menu-section">
                  {biometricService.isAvailable() && (
                    <button className="dd-menu-item" onClick={handleBiometricToggle}>
                      <Fingerprint size={14} style={{ color: biometricService.hasRegistered(user.uid) ? 'var(--gm)' : 'var(--t3)' }} />
                      {biometricService.hasRegistered(user.uid) ? 'Fingerprint Active' : 'Enable Fingerprint'}
                    </button>
                  )}
                  <button className="dd-menu-item danger" onClick={handleLogout}>
                    <LogOut size={14} />
                    Log Out Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="dd-main">

        {/* Welcome */}
        <div className="dd-welcome">
          <div>
            <h1 className="dd-welcome-name">
              Welcome back, {(user.displayName || '').split(' ')[0]}!
            </h1>
            <p className="dd-welcome-sub">Manage your assigned orders and deliveries</p>
          </div>
          <div 
            className="dd-active-badge" 
            style={{ 
              cursor: 'pointer', 
              background: isOnline ? 'var(--gl)' : '#f3f4f6',
              color: isOnline ? 'var(--g)' : '#6b7280'
            }} 
            onClick={handleToggleOnline}
            title="Click to toggle status"
          >
            <span 
              className="dd-active-dot" 
              style={{ background: isOnline ? 'var(--gm)' : '#9ca3af' }} 
            />
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        {/* Section header */}
        <div className="dd-section-head">
          <h2 className="dd-section-title">
            {showHistory
              ? <><History size={14} /> History ({historyOrders.length})</>
              : <><Truck size={14} /> Assigned ({assignedOrders.length})</>
            }
          </h2>
          <button
            className={`dd-toggle-btn${showHistory ? ' active' : ''}`}
            onClick={() => setShowHistory(h => !h)}
          >
            <History size={13} />
            {showHistory ? 'Back to Active' : 'View History'}
          </button>
        </div>

        {/* Orders */}
        {displayOrders.length === 0 ? (
          <div className="dd-empty">
            <Sparkles className="dd-empty-icon" size={40} />
            <div className="dd-empty-title">
              {showHistory ? 'No delivery history yet' : 'No deliveries pending'}
            </div>
            <p className="dd-empty-sub">
              {showHistory
                ? 'Completed and cancelled orders will appear here.'
                : 'New assigned orders from the administrator will appear here.'}
            </p>
          </div>
        ) : (
          <div>
            {displayOrders.map((order) => (
              <div key={order.id} className="dd-order-card">

                {/* Card head */}
                <div className="dd-order-head">
                  <div>
                    <div className="dd-order-id">Order #{order.id}</div>
                    <div className="dd-order-date">
                      {new Date(order.createdAt).toLocaleDateString()} · {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className={`dd-status ${statusClass(order.status)}`}>{order.status}</span>
                </div>

                {/* Customer block */}
                <div className="dd-customer-block">
                  <div className="dd-cust-name">
                    <span style={{ fontSize: '16px' }}>👤</span>
                    {order.customerName}
                  </div>
                  <div className="dd-cust-row">
                    <MapPin size={13} className="dd-cust-row-icon" />
                    <span>{fmtAddress(order.address)}</span>
                  </div>
                  <div className="dd-cust-meta">
                    <div className="dd-dist-chip">
                      <MapIcon size={13} />
                      {order.distanceKm?.toFixed(1) || '0.0'} KM
                    </div>
                    {order.customerPhone ? (
                      <a href={`tel:${order.customerPhone}`} className="dd-call-btn">
                        <Phone size={11} /> Call Customer
                      </a>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={11} /> No phone on file
                      </span>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="dd-items-block">
                  <div className="dd-items-head">Items in order</div>
                  {order.items?.map(item => (
                    <div key={item.id} className="dd-item-row">
                      <span>{item.name} × {item.quantity}</span>
                      <span style={{ fontWeight: 600, color: 'var(--t2)' }}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="dd-items-total">
                    <span className="dd-items-total-label">Total Bill</span>
                    <span className="dd-items-total-val">₹{order.total}</span>
                  </div>
                </div>

                {/* Action footer */}
                {!showHistory && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                  <div className="dd-order-footer">
                    {order.status === 'Accepted' && (
                      <button className="dd-action-btn primary" onClick={() => handleUpdateStatus(order.id, 'Preparing')}>
                        🌱 Mark as Preparing
                      </button>
                    )}
                    {order.status === 'Preparing' && (
                      <button className="dd-action-btn primary" onClick={() => handleUpdateStatus(order.id, 'Out for Delivery')}>
                        <Navigation size={14} /> Mark Out for Delivery
                      </button>
                    )}
                    {order.status === 'Out for Delivery' && (
                      <button className="dd-action-btn primary" onClick={() => openOtpDialog(order)}>
                        <Key size={14} /> Complete Delivery (OTP)
                      </button>
                    )}
                  </div>
                )}

                {order.status === 'Delivered' && (
                  <div className="dd-order-footer">
                    <div className="dd-delivered-banner">
                      ✅ Order Delivered & Verified
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── OTP Modal ── */}
      {showOtpModal && otpTargetOrder && (
        <div className="dd-otp-overlay" onClick={(e) => e.target === e.currentTarget && setShowOtpModal(false)}>
          <div className="dd-otp-modal">
            <div className="dd-otp-head">
              <h5 className="dd-otp-title">
                <Key size={16} /> Enter Security OTP
              </h5>
              <button className="dd-otp-close" onClick={() => setShowOtpModal(false)}>
                <X size={13} />
              </button>
            </div>

            <form onSubmit={handleVerifyOtpAndDeliver}>
              <div className="dd-otp-body">
                <p className="dd-otp-desc">
                  Ask <strong>{otpTargetOrder.customerName}</strong> for the 4-digit OTP shown on their order status screen to complete delivery.
                </p>

                {otpError && (
                  <div className="dd-otp-error">
                    <ShieldAlert size={14} />
                    <span>{otpError}</span>
                  </div>
                )}

                <input
                  type="text"
                  required
                  maxLength="4"
                  className="dd-otp-input"
                  placeholder="••••"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
                <p className="dd-otp-hint">Security verification required to update order status.</p>
              </div>

              <div className="dd-otp-foot">
                <button type="button" className="dd-otp-cancel" onClick={() => setShowOtpModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="dd-otp-submit">
                  Verify & Deliver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;