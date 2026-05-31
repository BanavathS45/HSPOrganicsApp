import React, { useState, useEffect } from 'react';
import { deliveryBoyService } from '../../firebase/db';
import { 
  Plus, Edit2, Trash2, ShieldAlert, Phone, Mail, 
  User, Link as LinkIcon, Camera, Search, UserCheck
} from 'lucide-react';

const DeliveryBoys = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentId, setCurrentId] = useState(null);
  
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [formPassword, setFormPassword] = useState('');

  // 1. Fetch & Subscribe Delivery boys
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
    setFormPassword(''); // hide password for edits
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this delivery partner?")) {
      try {
        await deliveryBoyService.delete(id);
        alert("Delivery partner removed successfully!");
      } catch (err) {
        alert("Error deleting delivery partner: " + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPhone) {
      alert("Please fill all mandatory fields!");
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
        // For emulation/login purposes, add the password field too
        await deliveryBoyService.add({
          ...payload,
          password: formPassword || 'delivery123'
        });
        alert("New delivery partner added successfully!");
      } else {
        await deliveryBoyService.update(currentId, {
          displayName: formName,
          name: formName,
          email: formEmail,
          phone: formPhone,
          photoURL: payload.photoURL
        });
        alert("Delivery partner details updated!");
      }
      setShowModal(false);
    } catch (err) {
      alert("Error saving: " + err.message);
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
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="d-flex flex-sm-row flex-column justify-content-between align-items-sm-center align-items-start gap-3 mb-4 text-start">
        <div>
          <h4 className="font-heading fw-extrabold text-success m-0">Delivery Partners</h4>
          <span className="text-muted text-xs font-body">Manage registered delivery agents and system logins</span>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn btn-organic btn-sm rounded-pill px-3.5 py-2 font-heading fw-bold d-flex align-items-center gap-1.5 shadow-sm text-white"
        >
          <Plus size={16} /> Add Delivery Boy
        </button>
      </div>

      {/* Search Input bar */}
      <div className="card border-0 glass-card p-3 rounded-4 shadow-sm mb-4 text-start">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0 border-light-subtle rounded-start-pill px-3">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control form-control-organic rounded-end-pill py-2.5 font-body text-xs border-start-0"
            placeholder="Search by name, email or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredBoys.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border">
          <UserCheck className="text-muted mb-2 mx-auto" size={36} />
          <p className="text-muted m-0 font-body text-xs">No active delivery partners found.</p>
        </div>
      ) : (
        <div className="row g-4 text-start">
          {filteredBoys.map((boy) => (
            <div key={boy.uid || boy.id} className="col-12 col-md-6 col-lg-4">
              <div className="card border-light-subtle glass-card p-3 rounded-4 shadow-sm hover-expand h-100 d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={boy.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(boy.displayName || boy.name || '')}`}
                    alt={boy.displayName}
                    className="rounded-circle object-fit-cover border border-success"
                    style={{ width: '60px', height: '60px' }}
                  />
                  <div className="text-truncate">
                    <h6 className="m-0 font-heading fw-extrabold text-success text-truncate" style={{ fontSize: '15px' }}>
                      {boy.displayName || boy.name}
                    </h6>
                    <span className="badge bg-success-subtle text-success font-heading text-xxs px-2 py-0.5 rounded-pill mt-1">
                      Active Agent
                    </span>
                  </div>
                </div>

                <div className="border-top pt-2.5 mt-3 d-flex flex-column gap-2 text-xs font-body text-secondary">
                  <div className="d-flex align-items-center gap-2">
                    <Phone size={13} className="text-success" />
                    <span>{boy.phone || 'No phone added'}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Mail size={13} className="text-success" />
                    <span className="text-truncate">{boy.email}</span>
                  </div>
                </div>

                <div className="border-top pt-2.5 mt-3 d-flex justify-content-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(boy)}
                    className="btn btn-light btn-xs rounded-circle p-2 d-flex align-items-center justify-content-center border"
                    style={{ width: '32px', height: '32px' }}
                    title="Edit Partner"
                  >
                    <Edit2 size={13} className="text-secondary" />
                  </button>
                  <button
                    onClick={() => handleDelete(boy.uid || boy.id)}
                    className="btn btn-outline-danger btn-xs rounded-circle p-2 d-flex align-items-center justify-content-center border"
                    style={{ width: '32px', height: '32px' }}
                    title="Delete Partner"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog Form */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered text-start">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 bg-success bg-opacity-5 p-4 pb-2">
                <h5 className="modal-title font-heading fw-extrabold text-success">
                  {modalMode === 'add' ? 'Register Delivery Boy' : 'Edit Delivery Boy'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4 pt-2 font-body text-xs">
                  {/* Name field */}
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-semibold">Name *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><User size={14} className="text-muted" /></span>
                      <input
                        type="text"
                        required
                        className="form-control text-xs border-start-0"
                        placeholder="e.g. Ramesh Kumar"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Phone field */}
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-semibold">Phone Number *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><Phone size={14} className="text-muted" /></span>
                      <input
                        type="tel"
                        required
                        className="form-control text-xs border-start-0"
                        placeholder="e.g. +91 98765 43210"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-semibold">Email Address *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><Mail size={14} className="text-muted" /></span>
                      <input
                        type="email"
                        required
                        disabled={modalMode === 'edit'}
                        className="form-control text-xs border-start-0"
                        placeholder="e.g. ramesh@hsporganics.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password field (only for new registers) */}
                  {modalMode === 'add' && (
                    <div className="mb-3">
                      <label className="form-label text-secondary fw-semibold">Login Password (Default: delivery123)</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0"><LinkIcon size={14} className="text-muted" /></span>
                        <input
                          type="password"
                          className="form-control text-xs border-start-0"
                          placeholder="delivery123"
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Profile Picture field */}
                  <div className="mb-3">
                    <label className="form-label text-secondary fw-semibold">Profile Photo Link (Optional)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><Camera size={14} className="text-muted" /></span>
                      <input
                        type="url"
                        className="form-control text-xs border-start-0"
                        placeholder="https://example.com/photo.jpg"
                        value={formPhoto}
                        onChange={(e) => setFormPhoto(e.target.value)}
                      />
                    </div>
                    <span className="text-muted mt-1 d-block text-xxs">Leave blank to assign a premium default portrait.</span>
                  </div>
                </div>

                <div className="modal-footer border-0 p-4 pt-0">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-3 font-heading fw-bold"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success rounded-pill px-4 text-white font-heading fw-bold"
                  >
                    {modalMode === 'add' ? 'Register Agent' : 'Save Changes'}
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

export default DeliveryBoys;
