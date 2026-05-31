import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { couponService } from '../../firebase/db';
import { Ticket, Plus, Trash2, Tag, Percent } from 'lucide-react';

const Coupons = () => {
  const { coupons } = useApp();

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minCartValue, setMinCartValue] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !discountValue) {
      alert("Please fill in coupon code and value.");
      return;
    }

    setLoading(true);
    const payload = {
      code,
      discountType,
      discountValue: parseFloat(discountValue),
      minCartValue: parseFloat(minCartValue || 0),
      description: description || `${discountValue}% Off Promo Coupon`
    };

    try {
      await couponService.add(payload);
      alert("New coupon created successfully!");
      // Reset form
      setCode('');
      setDiscountValue('');
      setMinCartValue('');
      setDescription('');
    } catch (err) {
      alert("Error adding coupon: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this coupon code?")) {
      try {
        await couponService.delete(id);
        alert("Coupon deactivated.");
      } catch (err) {
        alert("Error deactivating coupon: " + err.message);
      }
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-4">
        <h4 className="font-heading fw-extrabold text-success m-0">Discount Coupons</h4>
        <span className="text-muted text-xs font-body">Create and manage promo coupon codes for the storefront</span>
      </div>

      <div className="row g-4">
        {/* Left Side: Create Coupon Form */}
        <div className="col-12 col-md-5">
          <div className="card border-0 glass-card p-4 rounded-4 shadow-sm text-start">
            <h5 className="font-heading fw-bold text-success mb-3 d-flex align-items-center gap-1.5">
              <Ticket size={20} /> Create Coupon
            </h5>

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label text-secondary fw-semibold text-xs">Coupon Code (Uppercase)</label>
                <input 
                  type="text" 
                  placeholder="e.g. SUMMER30" 
                  className="form-control form-control-organic text-sm" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required 
                />
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label text-secondary fw-semibold text-xs">Discount Type</label>
                  <select 
                    className="form-select form-control-organic text-sm" 
                    value={discountType} 
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                
                <div className="col-6">
                  <label className="form-label text-secondary fw-semibold text-xs">Discount Value</label>
                  <input 
                    type="number" 
                    min="1" 
                    placeholder={discountType === 'percentage' ? '%' : '₹'} 
                    className="form-control form-control-organic text-sm" 
                    value={discountValue} 
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-secondary fw-semibold text-xs">Min Cart Value Required (₹)</label>
                <input 
                  type="number" 
                  min="0" 
                  placeholder="e.g. 299" 
                  className="form-control form-control-organic text-sm" 
                  value={minCartValue} 
                  onChange={(e) => setMinCartValue(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label text-secondary fw-semibold text-xs">Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Get 20% off on orders above ₹200" 
                  className="form-control form-control-organic text-sm" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-organic w-100 py-2 mt-2 rounded-pill font-heading fw-bold shadow d-flex align-items-center justify-content-center gap-1.5"
              >
                <Plus size={16} /> {loading ? 'Saving...' : 'Generate Coupon'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Coupons List */}
        <div className="col-12 col-md-7">
          <div className="card border-0 glass-card p-4 rounded-4 shadow-sm text-start">
            <h5 className="font-heading fw-bold text-success mb-3">Active Storefront Coupons</h5>

            {coupons.length === 0 ? (
              <div className="text-center py-5 bg-white rounded-4 border">
                <Ticket className="text-muted mb-2 mx-auto" size={32} />
                <p className="text-muted m-0 text-xs font-body">No coupons generated yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2.5">
                {coupons.map((c) => (
                  <div 
                    key={c.id} 
                    className="p-3 border rounded-4 bg-white d-flex justify-content-between align-items-center"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2.5 rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center" style={{ background: 'var(--accent-green-bg)' }}>
                        {c.discountType === 'percentage' ? <Percent size={18} /> : <Tag size={18} />}
                      </div>
                      <div>
                        <h6 className="m-0 font-heading fw-extrabold text-success" style={{ fontSize: '14px' }}>
                          {c.code}
                        </h6>
                        <span className="text-muted text-xs font-body d-block mt-0.5" style={{ fontSize: '11.5px' }}>
                          {c.description} • Min Cart: ₹{c.minCartValue}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDelete(c.id)}
                      className="btn btn-sm btn-outline-danger p-1.5 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px' }}
                      title="Deactivate Coupon"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Coupons;
