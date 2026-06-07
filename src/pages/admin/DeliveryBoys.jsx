import React, { useState, useEffect } from 'react';
import { deliveryBoyService } from '../../firebase/db';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/Toast';
import { Plus, Edit2, Trash2, Phone, Mail, User, Link as LinkIcon, Camera, Search, UserCheck, X, ClipboardList, Package } from 'lucide-react';

const styles = `

  .db2 {
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
  
    color: var(--t1);
    padding: 0;
  }

  .db2-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;
  }

  .db2-title {
   
    font-size: 22px;
    font-weight: 800;
    color: var(--g);
    margin: 0;
    letter-spacing: -0.4px;
    line-height: 1.1;
  }

  .db2-sub {
    font-size: 12.5px;
    color: var(--t3);
    margin: 3px 0 0;
  }

  .db2-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 18px;
    background: var(--g);
    color: #fff;
    border: none;
    border-radius: 999px;
    
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 2px 12px rgba(22,101,52,0.22);
    transition: background 0.15s, transform 0.1s;
    letter-spacing: 0.1px;
  }
  .db2-add-btn:hover { background: #14532d; transform: translateY(-1px); }
  .db2-add-btn:active { transform: scale(0.97); }

  .db2-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .db2-stat {
    background: var(--bg2);
    border: 0.5px solid var(--bd);
    border-radius: 14px;
    padding: 14px 16px;
  }

  .db2-stat-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--t3);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 6px;
  }

  .db2-stat-val {
    
    font-size: 22px;
    font-weight: 800;
    color: var(--t1);
    line-height: 1;
  }

  .db2-stat-chip {
    display: inline-block;
    font-size: 10px;
    font-weight: 600;
    color: var(--g);
    background: var(--gl);
    padding: 2px 8px;
    border-radius: 999px;
    margin-top: 6px;
  }

  .db2-search-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    border: 0.5px solid var(--bds);
    border-radius: 12px;
    background: var(--bg);
    padding: 0 14px;
    margin-bottom: 20px;
    transition: box-shadow 0.15s, border-color 0.15s;
  }
  .db2-search-wrap:focus-within {
    box-shadow: 0 0 0 3px rgba(22,163,74,0.12);
    border-color: var(--gm);
  }

  .db2-search-icon { color: var(--t3); flex-shrink: 0; }

  .db2-search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
   
    font-size: 13.5px;
    color: var(--t1);
    padding: 11px 0;
  }
  .db2-search-input::placeholder { color: var(--t3); }

  .db2-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 14px;
  }

  .db2-card {
    background: var(--bg);
    border: 0.5px solid var(--bd);
    border-radius: 18px;
    overflow: hidden;
    transition: box-shadow 0.18s, border-color 0.18s, transform 0.15s;
    position: relative;
  }
  .db2-card:hover {
    box-shadow: 0 6px 24px rgba(22,101,52,0.10);
    border-color: var(--bds);
    transform: translateY(-2px);
  }

  .db2-card-top {
    background: var(--bg3);
    padding: 20px 18px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border-bottom: 0.5px solid var(--bd);
    position: relative;
  }

  .db2-avatar-wrap {
    position: relative;
    margin-bottom: 12px;
  }

  .db2-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--bg);
    box-shadow: 0 0 0 2px var(--gmid);
  }

  .db2-status-dot {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    background: var(--gm);
    border-radius: 50%;
    border: 2px solid var(--bg);
  }

  .db2-name {
  
    font-size: 14px;
    font-weight: 800;
    color: var(--t1);
    margin: 0 0 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .db2-role-badge {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--g);
    background: var(--gl);
    padding: 3px 10px;
    border-radius: 999px;
    letter-spacing: 0.2px;
  }

  .db2-card-body {
    padding: 14px 16px 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .db2-info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: var(--t2);
  }

  .db2-info-icon { color: var(--gm); flex-shrink: 0; }

  .db2-info-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .db2-card-footer {
    border-top: 0.5px solid var(--bd);
    padding: 10px 14px;
    display: flex;
    gap: 7px;
  }

  .db2-history-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 7px;
    background: var(--gl);
    border: 0.5px solid var(--gmid);
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    color: var(--g);
    cursor: pointer;
    transition: background 0.15s;
 
  }
  .db2-history-btn:hover { background: var(--gmid); }

  .db2-icon-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 0.5px solid var(--bd);
    background: var(--bg2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--t3);
    transition: all 0.14s;
    flex-shrink: 0;
  }
  .db2-icon-btn:hover { background: var(--bg3); border-color: var(--bds); color: var(--t2); }
  .db2-icon-btn.danger:hover { background: var(--redl); border-color: #fecaca; color: var(--red); }

  .db2-empty {
    text-align: center;
    padding: 64px 24px;
    background: var(--bg2);
    border-radius: 18px;
    border: 0.5px dashed var(--bds);
  }
  .db2-empty-icon { color: var(--bds); margin: 0 auto 12px; display: block; opacity: 0.7; }
  .db2-empty p { color: var(--t3); font-size: 13.5px; margin: 0; }

  .db2-spinner-wrap { display: flex; justify-content: center; padding: 60px 0; }
  .db2-spinner {
    width: 30px; height: 30px;
    border: 2.5px solid var(--gmid);
    border-top-color: var(--g);
    border-radius: 50%;
    animation: db2-spin 0.7s linear infinite;
  }
  @keyframes db2-spin { to { transform: rotate(360deg); } }

  /* MODAL */
  .db2-overlay {
    position: fixed;
    inset: 0;
    background: rgba(5, 20, 10, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1050;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: db2-overlay-in 0.18s ease;
  }
  @keyframes db2-overlay-in { from { opacity: 0; } to { opacity: 1; } }

  .db2-modal {
    background: var(--bg);
    border-radius: 22px;
    width: 100%;
    max-width: 440px;
    overflow: hidden;
    border: 0.5px solid var(--bd);
    box-shadow: 0 24px 60px rgba(0,0,0,0.14);
    animation: db2-modal-in 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes db2-modal-in {
    from { opacity: 0; transform: translateY(14px) scale(0.97); }
    to   { opacity: 1; transform: none; }
  }

  .db2-modal-head {
    padding: 20px 22px 18px;
    border-bottom: 0.5px solid var(--bd);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg2);
  }

  .db2-modal-title {
   
    font-size: 16px;
    font-weight: 800;
    color: var(--g);
    margin: 0;
    letter-spacing: -0.2px;
  }

  .db2-modal-close {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 0.5px solid var(--bd);
    background: var(--bg);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--t3);
    transition: all 0.14s;
  }
  .db2-modal-close:hover { background: var(--bg3); color: var(--t1); }

  .db2-modal-body {
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .db2-field label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: var(--t3);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin-bottom: 5px;
  }

  .db2-input-wrap {
    display: flex;
    align-items: center;
    border: 0.5px solid var(--bd);
    border-radius: 10px;
    background: var(--bg);
    overflow: hidden;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .db2-input-wrap:focus-within {
    border-color: var(--gm);
    box-shadow: 0 0 0 3px rgba(22,163,74,0.10);
  }

  .db2-input-icon {
    padding: 0 11px;
    color: var(--t3);
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .db2-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 10px 12px 10px 0;
 
    font-size: 13.5px;
    color: var(--t1);
    background: transparent;
  }
  .db2-input::placeholder { color: var(--t3); }
  .db2-input:disabled { color: var(--t3); cursor: not-allowed; }

  .db2-hint { font-size: 11px; color: var(--t3); margin-top: 4px; }

  .db2-modal-foot {
    padding: 14px 22px;
    border-top: 0.5px solid var(--bd);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    background: var(--bg2);
  }

  .db2-btn-cancel {
    padding: 8px 18px;
    border: 0.5px solid var(--bd);
    background: var(--bg);
    border-radius: 999px;
   
    font-size: 13px;
    font-weight: 600;
    color: var(--t2);
    cursor: pointer;
    transition: background 0.14s;
  }
  .db2-btn-cancel:hover { background: var(--bg3); }

  .db2-btn-submit {
    padding: 8px 22px;
    border: none;
    background: var(--g);
    border-radius: 999px;
   
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(22,101,52,0.22);
    transition: background 0.14s, transform 0.1s;
  }
  .db2-btn-submit:hover { background: #14532d; }
  .db2-btn-submit:active { transform: scale(0.97); }

  /* History modal */
  .db2-hist-overlay {
    position: fixed;
    inset: 0;
    background: rgba(5,20,10,0.50);
    backdrop-filter: blur(5px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .db2-hist-modal {
    background: var(--bg);
    border-radius: 20px;
    width: 100%;
    max-width: 480px;
    max-height: 85vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    border: 0.5px solid var(--bd);
  }

  .db2-hist-head {
    padding: 20px 24px 16px;
    border-bottom: 0.5px solid var(--bd);
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--bg2);
  }

  .db2-hist-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--gm);
  }

  .db2-hist-name {
   
    font-weight: 800;
    font-size: 15px;
    color: var(--g);
  }

  .db2-hist-count {
    font-size: 11px;
    color: var(--t3);
    margin-top: 2px;
  }

  .db2-hist-close {
    margin-left: auto;
    border: none;
    background: var(--bg3);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--t3);
    transition: background 0.14s;
    flex-shrink: 0;
  }
  .db2-hist-close:hover { background: var(--bd); color: var(--t1); }

  .db2-hist-list {
    overflow-y: auto;
    flex-grow: 1;
    padding: 12px 16px;
  }

  .db2-hist-empty {
    text-align: center;
    padding: 48px 0;
  }

  .db2-hist-empty p { color: var(--t3); font-size: 13px; margin: 10px 0 0; }

  .db2-order-card {
    background: var(--bg2);
    border: 0.5px solid var(--bd);
    border-radius: 14px;
    padding: 14px 16px;
    margin-bottom: 10px;
  }

  .db2-order-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }

  .db2-order-id {
   
    font-weight: 700;
    font-size: 13px;
    color: var(--g);
  }

  .db2-order-customer {
    font-size: 11.5px;
    color: var(--t3);
    margin-top: 2px;
  }

  .db2-order-total {
   
    font-weight: 800;
    font-size: 15px;
    color: var(--t1);
    text-align: right;
  }

  .db2-order-date {
    font-size: 10px;
    color: var(--t3);
    margin-top: 2px;
    text-align: right;
  }

  .db2-order-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    border-top: 0.5px solid var(--bd);
    padding-top: 8px;
  }

  .db2-order-meta span { font-size: 10px; color: var(--t3); }
  .db2-order-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--bds); display: inline-block; }

  .db2-order-badge {
    margin-left: auto;
    font-size: 10px;
    font-weight: 700;
    color: var(--g);
    background: var(--gl);
    padding: 2px 9px;
    border-radius: 999px;
  }

  .db2-hist-foot {
    padding: 14px 24px;
    border-top: 0.5px solid var(--bd);
    background: var(--bg2);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .db2-hist-foot-label {
  
    font-weight: 700;
    font-size: 13px;
    color: var(--t2);
  }

  .db2-hist-foot-val {
  
    font-weight: 800;
    font-size: 17px;
    color: var(--g);
  }

  @media (max-width: 640px) {
    .db2-header { flex-direction: column; align-items: flex-start; }
    .db2-grid { grid-template-columns: 1fr; }
    .db2-stats { grid-template-columns: 1fr 1fr; }
  }
`;

const DeliveryBoys = () => {
  const { toast, confirm } = useToast();
  const { orders } = useApp();
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBoy, setSelectedBoy] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentId, setCurrentId] = useState(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [formPassword, setFormPassword] = useState('');

  useEffect(() => {
    setLoading(true);
    const unsub = deliveryBoyService.subscribe((list) => {
      setDeliveryBoys(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setModalMode('add');
    setCurrentId(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPhoto('');
    setFormPassword('');
    setShowModal(true);
  };

  const handleOpenEdit = (boy) => {
    setModalMode('edit');
    setCurrentId(boy.id || boy.uid);
    setFormName(boy.displayName || boy.name || '');
    setFormEmail(boy.email || '');
    setFormPhone(boy.phone || '');
    setFormPhoto(boy.photoURL || '');
    setFormPassword('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const ok = await confirm('This delivery partner will be permanently removed.', {
      title: 'Remove Partner?',
      confirmLabel: 'Remove',
      cancelLabel: 'Cancel',
      danger: true,
    });
    if (ok) {
      try {
        await deliveryBoyService.delete(id);
        toast.success('Delivery partner removed successfully.');
      } catch (err) {
        toast.error('Error deleting partner: ' + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPhone) {
      toast.warning('Please fill all mandatory fields!', 'Missing Fields');
      return;
    }
    const payload = {
      name: formName,
      email: formEmail,
      phone: formPhone,
      photoURL: formPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(formName)}&background=bbf7d0&color=166534`,
    };
    try {
      if (modalMode === 'add') {
        await deliveryBoyService.add({ ...payload, password: formPassword || 'delivery123' });
        toast.success('New delivery partner registered! 🚴', 'Partner Added');
      } else {
        await deliveryBoyService.update(currentId, {
          displayName: formName, name: formName,
          email: formEmail, phone: formPhone, photoURL: payload.photoURL,
        });
        toast.success('Delivery partner details updated!', 'Partner Updated');
      }
      setShowModal(false);
    } catch (err) {
      if (err.message.includes('Missing or insufficient permissions')) {
        toast.error('Firebase rules not deployed. Go to Firebase Console → Firestore → Rules and publish the updated rules.', 'Permission Error');
      } else {
        toast.error('Error saving: ' + err.message);
      }
    }
  };

  const filteredBoys = deliveryBoys.filter(boy => {
    const term = searchQuery.toLowerCase();
    const name = (boy.displayName || boy.name || '').toLowerCase();
    const email = (boy.email || '').toLowerCase();
    const phone = (boy.phone || '').toLowerCase();
    return name.includes(term) || email.includes(term) || phone.includes(term);
  });

  // Compute delivery count per boy
  const getDeliveryCount = (boyId) =>
    orders.filter(o =>
      o.status === 'Delivered' &&
      o.deliveryBoy &&
      (o.deliveryBoy.uid === boyId || o.deliveryBoy.id === boyId)
    ).length;

  const totalDeliveries = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div className="db2">
      <style>{styles}</style>

      {/* Header */}
      <div className="db2-header">
        <div>
          <h4 className="db2-title">Delivery Partners</h4>
          <p className="db2-sub">Manage registered delivery agents and system logins</p>
        </div>
        <button className="db2-add-btn" onClick={handleOpenAdd}>
          <Plus size={14} />
          Add Partner
        </button>
      </div>

      {/* Stats Strip */}
      <div className="db2-stats">
        <div className="db2-stat">
          <div className="db2-stat-label">Total Agents</div>
          <div className="db2-stat-val">{deliveryBoys.length}</div>
          <div className="db2-stat-chip">All time</div>
        </div>
        <div className="db2-stat">
          <div className="db2-stat-label">Active Today</div>
          <div className="db2-stat-val">{deliveryBoys.length}</div>
          <div className="db2-stat-chip">On shift</div>
        </div>
        <div className="db2-stat">
          <div className="db2-stat-label">Deliveries</div>
          <div className="db2-stat-val">{totalDeliveries}</div>
          <div className="db2-stat-chip">This month</div>
        </div>
      </div>

      {/* Search */}
      <div className="db2-search-wrap">
        <Search size={15} className="db2-search-icon" />
        <input
          type="text"
          className="db2-search-input"
          placeholder="Search by name, email or phone…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="db2-spinner-wrap">
          <div className="db2-spinner" />
        </div>
      ) : filteredBoys.length === 0 ? (
        <div className="db2-empty">
          <UserCheck className="db2-empty-icon" size={40} />
          <p>No active delivery partners found.</p>
        </div>
      ) : (
        <div className="db2-grid">
          {filteredBoys.map((boy) => {
            const boyId = boy.uid || boy.id;
            const deliveryCount = getDeliveryCount(boyId);
            const avatarSrc = boy.photoURL ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(boy.displayName || boy.name || '')}&background=bbf7d0&color=166534&size=120`;

            return (
              <div key={boyId} className="db2-card">
                <div className="db2-card-top">
                  <div className="db2-avatar-wrap">
                    <img
                      src={avatarSrc}
                      alt={boy.displayName || boy.name}
                      className="db2-avatar"
                    />
                    <span className="db2-status-dot" />
                  </div>
                  <div className="db2-name">{boy.displayName || boy.name}</div>
                  <span className="db2-role-badge">Active Agent</span>
                </div>

                <div className="db2-card-body">
                  <div className="db2-info-row">
                    <Phone size={13} className="db2-info-icon" />
                    <span className="db2-info-text">{boy.phone || 'No phone added'}</span>
                  </div>
                  <div className="db2-info-row">
                    <Mail size={13} className="db2-info-icon" />
                    <span className="db2-info-text">{boy.email}</span>
                  </div>
                  <div className="db2-info-row">
                    <Package size={13} className="db2-info-icon" />
                    <span className="db2-info-text" style={{ color: 'var(--g)', fontWeight: 600 }}>
                      {deliveryCount} {deliveryCount === 1 ? 'delivery' : 'deliveries'}
                    </span>
                  </div>
                </div>

                <div className="db2-card-footer">
                  <button
                    className="db2-history-btn"
                    onClick={() => setSelectedBoy(boy)}
                    title="Delivery History"
                  >
                    <ClipboardList size={12} />
                    History
                  </button>
                  <button
                    className="db2-icon-btn"
                    onClick={() => handleOpenEdit(boy)}
                    title="Edit Partner"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="db2-icon-btn danger"
                    onClick={() => handleDelete(boyId)}
                    title="Delete Partner"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delivery History Modal */}
      {selectedBoy && (() => {
        const boyId = selectedBoy.uid || selectedBoy.id;
        const delivered = orders.filter(o =>
          o.status === 'Delivered' &&
          o.deliveryBoy &&
          (o.deliveryBoy.uid === boyId || o.deliveryBoy.id === boyId)
        );
        const avatarSrc = selectedBoy.photoURL ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedBoy.displayName || selectedBoy.name || '')}&background=bbf7d0&color=166534&size=120`;

        return (
          <div
            className="db2-hist-overlay"
            onClick={(e) => e.target === e.currentTarget && setSelectedBoy(null)}
          >
            <div className="db2-hist-modal">
              <div className="db2-hist-head">
                <img src={avatarSrc} alt={selectedBoy.displayName || selectedBoy.name} className="db2-hist-avatar" />
                <div>
                  <div className="db2-hist-name">{selectedBoy.displayName || selectedBoy.name}</div>
                  <div className="db2-hist-count">
                    {delivered.length} order{delivered.length !== 1 ? 's' : ''} delivered
                  </div>
                </div>
                <button className="db2-hist-close" onClick={() => setSelectedBoy(null)}>
                  <X size={14} />
                </button>
              </div>

              <div className="db2-hist-list">
                {delivered.length === 0 ? (
                  <div className="db2-hist-empty">
                    <Package size={36} color="var(--bds)" />
                    <p>No deliveries completed yet</p>
                  </div>
                ) : delivered.map(ord => (
                  <div key={ord.id} className="db2-order-card">
                    <div className="db2-order-top">
                      <div>
                        <div className="db2-order-id">Order #{ord.id}</div>
                        <div className="db2-order-customer">{ord.customerName}</div>
                      </div>
                      <div>
                        <div className="db2-order-total">₹{ord.total}</div>
                        <div className="db2-order-date">
                          {new Date(ord.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="db2-order-meta">
                      <span>{ord.items?.length || 0} items</span>
                      <span className="db2-order-dot" />
                      <span>{ord.distanceKm?.toFixed(1)} KM</span>
                      <span className="db2-order-badge">✅ Delivered</span>
                    </div>
                  </div>
                ))}
              </div>

              {delivered.length > 0 && (
                <div className="db2-hist-foot">
                  <span className="db2-hist-foot-label">Total Delivered Revenue</span>
                  <span className="db2-hist-foot-val">
                    ₹{delivered.reduce((s, o) => s + (o.total || 0), 0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="db2-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="db2-modal">
            <div className="db2-modal-head">
              <h5 className="db2-modal-title">
                {modalMode === 'add' ? 'Register Delivery Partner' : 'Edit Delivery Partner'}
              </h5>
              <button className="db2-modal-close" onClick={() => setShowModal(false)}>
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="db2-modal-body">

                <div className="db2-field">
                  <label>Name *</label>
                  <div className="db2-input-wrap">
                    <span className="db2-input-icon"><User size={14} /></span>
                    <input
                      type="text"
                      required
                      className="db2-input"
                      placeholder="e.g. Ramesh Kumar"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="db2-field">
                  <label>Phone Number *</label>
                  <div className="db2-input-wrap">
                    <span className="db2-input-icon"><Phone size={14} /></span>
                    <input
                      type="tel"
                      required
                      className="db2-input"
                      placeholder="e.g. +91 98765 43210"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="db2-field">
                  <label>Email Address *</label>
                  <div className="db2-input-wrap">
                    <span className="db2-input-icon"><Mail size={14} /></span>
                    <input
                      type="email"
                      required
                      disabled={modalMode === 'edit'}
                      className="db2-input"
                      placeholder="e.g. ramesh@hsporganics.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>
                </div>

                {modalMode === 'add' && (
                  <div className="db2-field">
                    <label>Login Password</label>
                    <div className="db2-input-wrap">
                      <span className="db2-input-icon"><LinkIcon size={14} /></span>
                      <input
                        type="password"
                        className="db2-input"
                        placeholder="Default: delivery123"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                      />
                    </div>
                    <p className="db2-hint">Leave blank to use the default password.</p>
                  </div>
                )}

                <div className="db2-field">
                  <label>Profile Photo URL</label>
                  <div className="db2-input-wrap">
                    <span className="db2-input-icon"><Camera size={14} /></span>
                    <input
                      type="url"
                      className="db2-input"
                      placeholder="https://example.com/photo.jpg"
                      value={formPhoto}
                      onChange={(e) => setFormPhoto(e.target.value)}
                    />
                  </div>
                  <p className="db2-hint">Leave blank to assign a default portrait.</p>
                </div>

              </div>

              <div className="db2-modal-foot">
                <button type="button" className="db2-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="db2-btn-submit">
                  {modalMode === 'add' ? 'Register Agent' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoys;