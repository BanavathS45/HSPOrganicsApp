import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { notificationService } from '../../firebase/db';
import { sendInAppNotification } from '../../firebase/messaging';
import { 
  Bell, Plus, Calendar, Trash2, Megaphone, ShieldAlert, 
  Sparkles, ShoppingBag, Send, CheckCircle2, Info, Key, AlertTriangle
} from 'lucide-react';

const VAPID_SET = !!import.meta.env.VITE_FIREBASE_VAPID_KEY;

const Notifications = () => {
  const { notifications } = useApp();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !body) {
      alert("Please enter a title and message.");
      return;
    }

    setLoading(true);
    setSent(false);
    try {
      const notiPayload = {
        title,
        body,
        type: 'general',
        userId: targetRole,
        createdAt: Date.now()
      };

      // 1. Save notification to Firestore (persists in log + real-time snapshot picks it up)
      await notificationService.addSystemNotification(notiPayload);

      // 2. Fire in-app toast on all active browser tabs via DOM event
      sendInAppNotification(notiPayload);

      // 3. If browser Notification API is granted, fire a native OS-level notification
      //    (works when the admin's browser has permission granted)
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: 'hsp-admin-broadcast',
          renotify: true,
        });
      }

      setSent(true);
      setTitle('');
      setBody('');
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      alert("Error broadcasting notification: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getNotiIcon = (type) => {
    switch (type) {
      case 'new_order': return <ShoppingBag className="text-warning" size={16} />;
      case 'inventory_alert': return <ShieldAlert className="text-danger" size={16} />;
      case 'new_product': return <Sparkles className="text-info" size={16} />;
      default: return <Megaphone className="text-success" size={16} />;
    }
  };

  const notifPermission = typeof window !== 'undefined' && 'Notification' in window
    ? Notification.permission
    : 'unsupported';

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-4">
        <h4 className="font-heading fw-extrabold text-success m-0">Push Notifications Panel</h4>
        <span className="text-muted text-xs font-body">
          Broadcast system alerts · Monitor live notification stream
        </span>
      </div>

      {/* VAPID / Permission Status Banner */}
      <div className="row g-3 mb-4">
        {/* Browser Permission Status */}
        <div className="col-md-6">
          <div
            className={`p-3 rounded-4 d-flex align-items-start gap-3 border ${
              notifPermission === 'granted'
                ? 'bg-success-subtle border-success'
                : notifPermission === 'denied'
                ? 'bg-danger-subtle border-danger'
                : 'bg-warning-subtle border-warning'
            }`}
          >
            <div className="mt-0.5">
              {notifPermission === 'granted'
                ? <CheckCircle2 size={20} className="text-success" />
                : <AlertTriangle size={20} className={notifPermission === 'denied' ? 'text-danger' : 'text-warning'} />}
            </div>
            <div>
              <h6 className="m-0 font-heading fw-bold" style={{ fontSize: '13px' }}>
                Browser Permission:{' '}
                <span className={notifPermission === 'granted' ? 'text-success' : notifPermission === 'denied' ? 'text-danger' : 'text-warning'}>
                  {notifPermission === 'granted' ? '✅ Granted' : notifPermission === 'denied' ? '🚫 Blocked' : '⚠️ Not Yet Asked'}
                </span>
              </h6>
              <p className="m-0 text-muted font-body" style={{ fontSize: '11.5px', lineHeight: 1.5 }}>
                {notifPermission === 'granted'
                  ? 'Native OS-level push notifications will appear even when the app is in the background.'
                  : notifPermission === 'denied'
                  ? 'Unblock notifications in browser settings → Site Settings → Notifications for this site.'
                  : 'Log in to the app to trigger the browser permission request automatically.'}
              </p>
            </div>
          </div>
        </div>

        {/* VAPID Key Status */}
        <div className="col-md-6">
          <div
            className={`p-3 rounded-4 d-flex align-items-start gap-3 border ${
              VAPID_SET ? 'bg-success-subtle border-success' : 'bg-warning-subtle border-warning'
            }`}
          >
            <Key size={20} className={VAPID_SET ? 'text-success mt-0.5' : 'text-warning mt-0.5'} />
            <div>
              <h6 className="m-0 font-heading fw-bold" style={{ fontSize: '13px' }}>
                FCM VAPID Key:{' '}
                <span className={VAPID_SET ? 'text-success' : 'text-warning'}>
                  {VAPID_SET ? '✅ Configured' : '⚠️ Not Set'}
                </span>
              </h6>
              <p className="m-0 text-muted font-body" style={{ fontSize: '11.5px', lineHeight: 1.5 }}>
                {VAPID_SET
                  ? 'FCM token registration is active. Background push will work on all registered devices.'
                  : <>Add <code className="bg-light px-1 rounded" style={{ fontSize: '10.5px' }}>VITE_FIREBASE_VAPID_KEY=&lt;key&gt;</code> in your <code>.env</code> file. Get it from: Firebase Console → Project Settings → Cloud Messaging → Web Push Certificates → Generate Key Pair.</>}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 text-start">
        {/* Left Side: Broadcast Form */}
        <div className="col-12 col-md-5">
          <div className="card border-0 glass-card p-4 rounded-4 shadow-sm h-100">
            <h5 className="font-heading fw-bold text-success mb-1 d-flex align-items-center gap-1.5">
              <Bell size={20} /> Broadcast Announcement
            </h5>
            <p className="text-muted font-body mb-3" style={{ fontSize: '12px' }}>
              Sends an in-app toast + OS push notification to all active users.
            </p>

            <form onSubmit={handleBroadcast} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label text-secondary fw-semibold text-xs">Target Audience</label>
                <select
                  className="form-select form-control-organic text-sm"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                >
                  <option value="all">📢 All Customers & Admins</option>
                  <option value="admin">🔒 Admins Only</option>
                </select>
              </div>

              <div>
                <label className="form-label text-secondary fw-semibold text-xs">Notification Title *</label>
                <input
                  type="text"
                  placeholder="e.g. 🥭 Fresh Mangoes Are Back!"
                  className="form-control form-control-organic text-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label text-secondary fw-semibold text-xs">Message Body *</label>
                <textarea
                  rows="4"
                  placeholder="e.g. Sweet Devgad Alphonso Mangoes are back in stock. Order now before they sell out!"
                  className="form-control form-control-organic text-sm"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Success feedback */}
              {sent && (
                <div className="d-flex align-items-center gap-2 p-2 rounded-3 bg-success-subtle border border-success">
                  <CheckCircle2 size={16} className="text-success" />
                  <span className="font-heading fw-bold text-success" style={{ fontSize: '13px' }}>
                    Notification sent successfully!
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-organic w-100 py-2 rounded-pill font-heading fw-bold shadow d-flex align-items-center justify-content-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Broadcast Alert</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Notification Log */}
        <div className="col-12 col-md-7">
          <div className="card border-0 glass-card p-4 rounded-4 shadow-sm h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="font-heading fw-bold text-success m-0">Live Log Stream</h5>
              <span className="badge bg-success-subtle text-success border border-success font-heading" style={{ fontSize: '10px' }}>
                {notifications.length} Total
              </span>
            </div>

            <div className="d-flex flex-column gap-2" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Bell size={32} className="mb-2 opacity-25" />
                  <p className="font-body m-0" style={{ fontSize: '13px' }}>No notifications yet. Broadcast your first alert!</p>
                </div>
              ) : [...notifications].reverse().map((noti) => (
                <div
                  key={noti.id}
                  className="p-3 border rounded-4 bg-white d-flex align-items-start gap-3"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div
                    className="p-2 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ background: 'var(--accent-green-bg, #f0fdf4)', width: '36px', height: '36px' }}
                  >
                    {getNotiIcon(noti.type)}
                  </div>
                  <div className="flex-grow-1 min-width-0">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <h6 className="m-0 font-heading fw-bold text-success text-truncate" style={{ fontSize: '13px' }}>
                        {noti.title}
                      </h6>
                      <span className="text-muted font-body d-flex align-items-center gap-1 flex-shrink-0" style={{ fontSize: '10px' }}>
                        <Calendar size={9} />
                        {new Date(noti.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="m-0 text-muted font-body mt-1" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                      {noti.body}
                    </p>
                    <div className="d-flex gap-1.5 mt-1.5">
                      <span className="badge bg-light text-muted border font-heading" style={{ fontSize: '9px' }}>
                        → {noti.userId === 'all' ? 'Everyone' : noti.userId}
                      </span>
                      <span className="badge bg-success-subtle text-success border border-success font-heading" style={{ fontSize: '9px' }}>
                        {noti.type || 'general'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
