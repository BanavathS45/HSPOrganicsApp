import React, { useState, useEffect } from 'react';
import { deliveryBoyService } from '../../firebase/db';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/Toast';
import {
  Plus, Edit2, Trash2, Phone, Mail,
  User, Link as LinkIcon, Camera, Search, UserCheck, X, Bike, ClipboardList, Package
} from 'lucide-react';

const styles = `

  .db-root {
   
    --green: #1a6b3c;
    --green-mid: #22873f;
    --green-light: #e6f4ec;
    --green-muted: #c3e4ce;
    --surface: #ffffff;
    --surface-2: #f7f9f8;
    --surface-3: #f0f5f2;
    --border: #dde8e2;
    --border-strong: #b5cfbe;
    --text: #0f2318;
    --text-2: #3b5247;
    --text-3: #6b897a;
    --red: #c0392b;
    --red-light: #fcecea;
    --shadow: 0 1px 3px rgba(10,40,20,0.08), 0 4px 12px rgba(10,40,20,0.05);
    --shadow-md: 0 2px 8px rgba(10,40,20,0.10), 0 8px 24px rgba(10,40,20,0.07);
    padding: 0;
    color: var(--text);
  }

  .db-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
    gap: 16px;
  }

  .db-title {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 800;
    color: var(--green);
    margin: 0 0 4px;
    letter-spacing: -0.5px;
    line-height: 1.1;
  }

  .db-subtitle {
    font-size: 13px;
    color: var(--text-3);
    margin: 0;
    font-weight: 400;
  }

  .db-add-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 10px 20px;
    background: var(--green);
    color: white;
    border: none;
    border-radius: 100px;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
    letter-spacing: 0.2px;
    transition: background 0.15s, transform 0.1s;
    box-shadow: 0 2px 10px rgba(26,107,60,0.25);
  }

  .db-add-btn:hover { background: #145430; transform: translateY(-1px); }
  .db-add-btn:active { transform: scale(0.97); }

  .db-search-wrap {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 4px 16px 4px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .db-search-wrap:focus-within {
    border-color: var(--green-mid);
    box-shadow: 0 0 0 3px rgba(34,135,63,0.10);
  }

  .db-search-icon { color: var(--text-3); flex-shrink: 0; }

  .db-search-input {
    border: none;
    outline: none;
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--text);
    padding: 10px 0;
    width: 100%;
  }

  .db-search-input::placeholder { color: var(--text-3); }

  .db-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 18px;
  }

  .db-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 0;
    transition: box-shadow 0.2s, border-color 0.2s, transform 0.15s;
    position: relative;
    overflow: hidden;
  }

  .db-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--green-mid), var(--green-muted));
    opacity: 0;
    transition: opacity 0.2s;
  }

  .db-card:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--green-muted);
    transform: translateY(-2px);
  }

  .db-card:hover::before { opacity: 1; }

  .db-card-top {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }

  .db-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--green-muted);
    flex-shrink: 0;
  }

  .db-name {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 5px;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .db-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--green-light);
    color: var(--green);
    font-size: 11px;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 100px;
    letter-spacing: 0.2px;
  }

  .db-badge-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--green-mid);
  }

  .db-info {
    border-top: 1px solid var(--border);
    padding-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  .db-info-row {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 13px;
    color: var(--text-2);
  }

  .db-info-icon { color: var(--green-mid); flex-shrink: 0; }

  .db-info-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .db-card-footer {
    border-top: 1px solid var(--border);
    padding-top: 14px;
    margin-top: 14px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .db-icon-btn {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--surface-2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    color: var(--text-3);
  }

  .db-icon-btn:hover {
    background: var(--surface-3);
    border-color: var(--border-strong);
    color: var(--text);
  }

  .db-icon-btn.danger:hover {
    background: var(--red-light);
    border-color: #f5b7b1;
    color: var(--red);
  }

  .db-empty {
    text-align: center;
    padding: 60px 20px;
    background: var(--surface-2);
    border-radius: 18px;
    border: 1px dashed var(--border-strong);
  }

  .db-empty-icon {
    color: var(--text-3);
    margin: 0 auto 12px;
    display: block;
    opacity: 0.5;
  }

  .db-empty-text {
    color: var(--text-3);
    font-size: 14px;
    margin: 0;
  }

  /* SPINNER */
  .db-spinner-wrap {
    display: flex;
    justify-content: center;
    padding: 60px 0;
  }

  .db-spinner {
    width: 32px; height: 32px;
    border: 2.5px solid var(--green-muted);
    border-top-color: var(--green);
    border-radius: 50%;
    animation: db-spin 0.7s linear infinite;
  }
  @keyframes db-spin { to { transform: rotate(360deg); } }

  /* MODAL OVERLAY */
  .db-overlay {
    position: fixed;
    inset: 0;
    background: rgba(5, 20, 10, 0.55);
    backdrop-filter: blur(4px);
    z-index: 1050;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: db-overlay-in 0.18s ease;
  }
  @keyframes db-overlay-in { from { opacity: 0; } to { opacity: 1; } }

  .db-modal {
    background: var(--surface);
    border-radius: 22px;
    width: 100%;
    max-width: 460px;
    box-shadow: 0 8px 40px rgba(5,30,15,0.18);
    animation: db-modal-in 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
  }
  @keyframes db-modal-in {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to { opacity: 1; transform: none; }
  }

  .db-modal-header {
    padding: 22px 24px 18px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--surface-2);
  }

  .db-modal-title {
    font-family: 'Syne', sans-serif;
    font-size: 17px;
    font-weight: 800;
    color: var(--green);
    margin: 0;
    letter-spacing: -0.3px;
  }

  .db-modal-close {
    width: 30px; height: 30px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--surface);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--text-3);
    transition: all 0.15s;
  }
  .db-modal-close:hover { background: var(--surface-3); color: var(--text); }

  .db-modal-body {
    padding: 22px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .db-field label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 6px;
  }

  .db-input-wrap {
    display: flex;
    align-items: center;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    overflow: hidden;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .db-input-wrap:focus-within {
    border-color: var(--green-mid);
    box-shadow: 0 0 0 3px rgba(34,135,63,0.10);
  }

  .db-input-icon {
    padding: 0 12px;
    color: var(--text-3);
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .db-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 11px 12px 11px 0;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--text);
    background: transparent;
  }

  .db-input::placeholder { color: var(--text-3); }
  .db-input:disabled { color: var(--text-3); cursor: not-allowed; }

  .db-hint {
    font-size: 11.5px;
    color: var(--text-3);
    margin-top: 5px;
  }

  .db-modal-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    background: var(--surface-2);
  }

  .db-btn-cancel {
    padding: 9px 20px;
    border: 1px solid var(--border);
    background: var(--surface);
    border-radius: 100px;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.15s;
  }
  .db-btn-cancel:hover { background: var(--surface-3); }

  .db-btn-submit {
    padding: 9px 22px;
    border: none;
    background: var(--green);
    border-radius: 100px;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: white;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(26,107,60,0.25);
    transition: background 0.15s, transform 0.1s;
  }
  .db-btn-submit:hover { background: #145430; }
  .db-btn-submit:active { transform: scale(0.97); }

  @media (max-width: 640px) {
    .db-header { flex-direction: column; align-items: flex-start; }
    .db-grid { grid-template-columns: 1fr; }
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
      photoURL: formPhoto || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80`
    };

    try {
      if (modalMode === 'add') {
        await deliveryBoyService.add({ ...payload, password: formPassword || 'delivery123' });
        toast.success('New delivery partner registered! 🚴', 'Partner Added');
      } else {
        await deliveryBoyService.update(currentId, {
          displayName: formName, name: formName,
          email: formEmail, phone: formPhone, photoURL: payload.photoURL
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

  return (
    <div className="db-root">
      <style>{styles}</style>

      {/* Header */}
      <div className="db-header">
        <div>
          <h4 className="db-title">Delivery Partners</h4>
          <p className="db-subtitle">Manage registered delivery agents and system logins</p>
        </div>
        <button className="db-add-btn" onClick={handleOpenAdd}>
          <Plus size={15} />
          Add Delivery Boy
        </button>
      </div>

      {/* Search */}
      <div className="db-search-wrap">
        <Search size={16} className="db-search-icon" />
        <input
          type="text"
          className="db-search-input"
          placeholder="Search by name, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="db-spinner-wrap">
          <div className="db-spinner" />
        </div>
      ) : filteredBoys.length === 0 ? (
        <div className="db-empty">
          <UserCheck className="db-empty-icon" size={40} />
          <p className="db-empty-text">No active delivery partners found.</p>
        </div>
      ) : (
        <div className="db-grid">
          {filteredBoys.map((boy) => (
            <div key={boy.uid || boy.id} className="db-card">
              <div className="db-card-top">
                <img
                  src={boy.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(boy.displayName || boy.name || '')}&background=c3e4ce&color=1a6b3c`}
                  alt={boy.displayName || boy.name}
                  className="db-avatar"
                />
                <div style={{ minWidth: 0 }}>
                  <h6 className="db-name">{boy.displayName || boy.name}</h6>
                  <span className="db-badge">
                    <span className="db-badge-dot" />
                    Active Agent
                  </span>
                </div>
              </div>

              <div className="db-info">
                <div className="db-info-row">
                  <Phone size={13} className="db-info-icon" />
                  <span className="db-info-text">{boy.phone || 'No phone added'}</span>
                </div>
                <div className="db-info-row">
                  <Mail size={13} className="db-info-icon" />
                  <span className="db-info-text">{boy.email}</span>
                </div>
              </div>

              <div className="db-card-footer">
                <button
                  className="db-icon-btn"
                  onClick={() => setSelectedBoy(boy)}
                  title="Delivery History"
                  style={{ flex: 1, gap: '5px', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--green)' }}
                >
                  <ClipboardList size={13} />
                </button>
                <button
                  className="db-icon-btn"
                  onClick={() => handleOpenEdit(boy)}
                  title="Edit Partner"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  className="db-icon-btn danger"
                  onClick={() => handleDelete(boy.uid || boy.id)}
                  title="Delete Partner"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
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
        return (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(5,20,10,0.55)', backdropFilter: 'blur(5px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={(e) => e.target === e.currentTarget && setSelectedBoy(null)}
          >
            <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              {/* Header */}
              <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={selectedBoy.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedBoy.displayName || selectedBoy.name || '')}&background=c3e4ce&color=1a6b3c`}
                  alt={selectedBoy.displayName || selectedBoy.name}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #22873f' }}
                />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '15px', color: '#1a6b3c' }}>
                    {selectedBoy.displayName || selectedBoy.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b897a', marginTop: '2px' }}>
                    {delivered.length} order{delivered.length !== 1 ? 's' : ''} delivered
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBoy(null)}
                  style={{ border: 'none', background: '#f0f5f2', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={14} color="#6b897a" />
                </button>
              </div>

              {/* Order List */}
              <div style={{ overflowY: 'auto', flexGrow: 1, padding: '12px 16px' }}>
                {delivered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <Package size={36} color="#b5cfbe" style={{ marginBottom: '10px' }} />
                    <p style={{ color: '#6b897a', fontSize: '13px', margin: 0 }}>No deliveries completed yet</p>
                  </div>
                ) : delivered.map(ord => (
                  <div key={ord.id} style={{ background: '#f7f9f8', border: '1px solid #dde8e2', borderRadius: '14px', padding: '14px 16px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: '#1a6b3c' }}>Order #{ord.id}</div>
                        <div style={{ fontSize: '11.5px', color: '#6b897a', marginTop: '2px' }}>{ord.customerName}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '15px', color: '#0f2318' }}>₹{ord.total}</div>
                        <div style={{ fontSize: '10px', color: '#6b897a', marginTop: '2px' }}>
                          {new Date(ord.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid #dde8e2', paddingTop: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#6b897a' }}>{ord.items?.length || 0} items</span>
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#b5cfbe', display: 'inline-block' }}></span>
                      <span style={{ fontSize: '10px', color: '#6b897a' }}>{ord.distanceKm?.toFixed(1)} KM</span>
                      <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 700, color: '#22873f', background: '#e6f4ec', padding: '2px 9px', borderRadius: '100px' }}>✅ Delivered</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Total */}
              {delivered.length > 0 && (
                <div style={{ padding: '14px 24px', borderTop: '1px solid #eee', background: '#f7f9f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: '#3b5247' }}>Total Delivered Revenue</span>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '17px', color: '#1a6b3c' }}>₹{delivered.reduce((s, o) => s + (o.total || 0), 0)}</span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Modal */}
      {showModal && (
        <div className="db-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="db-modal">
            <div className="db-modal-header">
              <h5 className="db-modal-title">
                {modalMode === 'add' ? 'Register Delivery Boy' : 'Edit Delivery Boy'}
              </h5>
              <button className="db-modal-close" onClick={() => setShowModal(false)}>
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="db-modal-body">

                {/* Name */}
                <div className="db-field">
                  <label>Name *</label>
                  <div className="db-input-wrap">
                    <span className="db-input-icon"><User size={14} /></span>
                    <input
                      type="text"
                      required
                      className="db-input"
                      placeholder="e.g. Ramesh Kumar"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="db-field">
                  <label>Phone Number *</label>
                  <div className="db-input-wrap">
                    <span className="db-input-icon"><Phone size={14} /></span>
                    <input
                      type="tel"
                      required
                      className="db-input"
                      placeholder="e.g. +91 98765 43210"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="db-field">
                  <label>Email Address *</label>
                  <div className="db-input-wrap">
                    <span className="db-input-icon"><Mail size={14} /></span>
                    <input
                      type="email"
                      required
                      disabled={modalMode === 'edit'}
                      className="db-input"
                      placeholder="e.g. ramesh@hsporganics.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password (add only) */}
                {modalMode === 'add' && (
                  <div className="db-field">
                    <label>Login Password</label>
                    <div className="db-input-wrap">
                      <span className="db-input-icon"><LinkIcon size={14} /></span>
                      <input
                        type="password"
                        className="db-input"
                        placeholder="Default: delivery123"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                      />
                    </div>
                    <p className="db-hint">Leave blank to use the default password.</p>
                  </div>
                )}

                {/* Photo URL */}
                <div className="db-field">
                  <label>Profile Photo URL</label>
                  <div className="db-input-wrap">
                    <span className="db-input-icon"><Camera size={14} /></span>
                    <input
                      type="url"
                      className="db-input"
                      placeholder="https://example.com/photo.jpg"
                      value={formPhoto}
                      onChange={(e) => setFormPhoto(e.target.value)}
                    />
                  </div>
                  <p className="db-hint">Leave blank to assign a default portrait.</p>
                </div>

              </div>

              <div className="db-modal-footer">
                <button type="button" className="db-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="db-btn-submit">
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