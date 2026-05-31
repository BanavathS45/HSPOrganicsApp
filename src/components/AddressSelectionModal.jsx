import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Navigation, Plus, Trash2, Check, X, Home, Briefcase, MoreHorizontal, AlertCircle, Loader } from 'lucide-react';

const AddressSelectionModal = ({ show, onClose }) => {
  const {
    user, addresses, selectedAddress, setSelectedAddress,
    saveAddress, deleteAddress
  } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [addressName, setAddressName] = useState('Home');
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [mapCoords, setMapCoords] = useState(null);

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [geoSuccess, setGeoSuccess] = useState(false);

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!show) return;
    resetForm();
  }, [show]);

  if (!show) return null;

  // ─── Geolocation ────────────────────────────────────────────────────────────
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    setGeoSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapCoords({ lat: latitude, lng: longitude });

        // Try reverse geocode via free nominatim (no key needed)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};

          const detectedLine = [
            addr.house_number,
            addr.road || addr.pedestrian || addr.footway,
            addr.suburb || addr.neighbourhood || addr.quarter,
          ].filter(Boolean).join(', ');

          const detectedCity =
            addr.city || addr.town || addr.village || addr.county || '';
          const detectedState = addr.state || '';
          const detectedPin = addr.postcode || '';

          setAddressLine(detectedLine);
          setCity(detectedCity);
          setState(detectedState);
          if (detectedPin) {
            setPostalCode(detectedPin);
            setPincodeError('');
          }
          setGeoSuccess(true);
        } catch {
          // Nominatim failed — coords saved, user fills form manually
          setGeoSuccess(true);
          setGeoError('Location found but could not fetch address. Fill in manually.');
        }
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) setGeoError('Location permission denied. Please allow access or enter manually.');
        else if (err.code === 2) setGeoError('Location unavailable. Please enter address manually.');
        else setGeoError('Could not detect location. Please enter manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // ─── Pincode lookup (India Post API — no key) ────────────────────────────
  const handlePincodeChange = async (value) => {
    setPostalCode(value);
    setPincodeError('');

    if (value.length !== 6 || !/^\d{6}$/.test(value)) {
      if (value.length === 6) setPincodeError('Enter a valid 6-digit pincode.');
      setCity('');
      setState('');
      return;
    }

    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
      const data = await res.json();
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        setCity(po.District || po.Name || '');
        setState(po.State || '');
        setPincodeError('');
      } else {
        setCity('');
        setState('');
        setPincodeError('Pincode not found. Enter city manually.');
      }
    } catch {
      setPincodeError('Could not fetch pincode data. Enter city manually.');
    } finally {
      setPincodeLoading(false);
    }
  };

  // ─── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!addressLine.trim() || addressLine.trim().length < 10)
      e.addressLine = 'Enter at least 10 characters';
    if (!postalCode || !/^\d{6}$/.test(postalCode))
      e.postalCode = 'Enter a valid 6-digit pincode';
    if (!city.trim())
      e.city = 'City is required';
    return e;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  // ─── Save ────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    const allTouched = { addressLine: true, postalCode: true, city: true };
    setTouched(allTouched);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        name: addressName,
        addressLine: addressLine.trim(),
        landmark: landmark.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode,
        lat: mapCoords?.lat || null,
        lng: mapCoords?.lng || null,
        isDefault: addresses.length === 0,
      };
      const saved = await saveAddress(payload);
      setSelectedAddress(saved);
      resetForm();
      onClose();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save address.' });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setAddressName('Home');
    setAddressLine('');
    setLandmark('');
    setCity('');
    setState('');
    setPostalCode('');
    setMapCoords(null);
    setGeoError('');
    setGeoSuccess(false);
    setPincodeError('');
    setErrors({});
    setTouched({});
    setSaving(false);
  };

  const fieldErr = (f) => touched[f] && errors[f];

  const inputStyle = (f) => ({
    ...s.input,
    borderColor: fieldErr(f) ? '#E24B4A' : '#e0e0e0',
  });

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={s.overlay}>
      <div style={s.modal}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <p style={s.headerSub}>Delivery</p>
            <h2 style={s.headerTitle}>
              {isAdding ? 'Add New Address' : 'Select Location'}
            </h2>
          </div>
          <button onClick={onClose} style={s.closeBtn} aria-label="Close">
            <X size={16} color="#666" />
          </button>
        </div>

        <div style={s.body}>

          {/* ── ADD FORM ── */}
          {isAdding ? (
            <form onSubmit={handleSave} noValidate>

              {/* Detect location */}
              <div style={s.detectBanner}>
                <div style={s.detectLeft}>
                  <div style={s.detectIcon}>
                    {geoLoading
                      ? <Loader size={16} color="#3B6D11" style={{ animation: 'spin 1s linear infinite' }} />
                      : <Navigation size={16} color="#3B6D11" />
                    }
                  </div>
                  <div>
                    <p style={s.detectTitle}>
                      {geoLoading ? 'Detecting your location…' : 'Use current location'}
                    </p>
                    <p style={s.detectSub}>Auto-fill address from GPS</p>
                  </div>
                </div>
                {!geoLoading && (
                  <button type="button" onClick={handleDetectLocation} style={s.detectBtn}>
                    {geoSuccess ? <Check size={13} color="#3B6D11" /> : 'Detect'}
                  </button>
                )}
              </div>

              {geoError && (
                <div style={s.infoBox('#FCEBEB', '#A32D2D')}>
                  <AlertCircle size={13} /> {geoError}
                </div>
              )}
              {geoSuccess && !geoError && (
                <div style={s.infoBox('#EAF3DE', '#27500A')}>
                  <Check size={13} /> Location detected — review and confirm below
                </div>
              )}

              {/* Or divider */}
              <div style={s.orRow}>
                <div style={s.orLine} /><span style={s.orText}>fill in address</span><div style={s.orLine} />
              </div>

              {/* Label */}
              <div style={s.fieldGroup}>
                <label style={s.label}>Address Label</label>
                <div style={s.labelRow}>
                  {[['Home', Home], ['Office', Briefcase], ['Other', MoreHorizontal]].map(([l, Icon]) => (
                    <button key={l} type="button" onClick={() => setAddressName(l)}
                      style={addressName === l ? s.labelBtnOn : s.labelBtnOff}>
                      <Icon size={13} />{l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address line */}
              <div style={s.fieldGroup}>
                <label style={s.label}>Address Line <span style={{ color: '#E24B4A' }}>*</span></label>
                <textarea
                  rows={2}
                  placeholder="Flat / House No., Building, Street"
                  value={addressLine}
                  onChange={e => setAddressLine(e.target.value)}
                  onBlur={() => handleBlur('addressLine')}
                  style={{ ...s.textarea, borderColor: fieldErr('addressLine') ? '#E24B4A' : '#e0e0e0' }}
                />
                {fieldErr('addressLine') && <p style={s.errText}><AlertCircle size={11} /> {errors.addressLine}</p>}
              </div>

              {/* Landmark */}
              <div style={s.fieldGroup}>
                <label style={s.label}>Landmark <span style={s.optional}>(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. Near City Mall"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  style={s.input}
                />
              </div>

              {/* Pincode + City */}
              <div style={s.row2}>
                <div style={{ ...s.fieldGroup, flex: 1 }}>
                  <label style={s.label}>Pincode <span style={{ color: '#E24B4A' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 560038"
                      value={postalCode}
                      maxLength={6}
                      onChange={e => handlePincodeChange(e.target.value.replace(/\D/g, ''))}
                      onBlur={() => handleBlur('postalCode')}
                      style={{ ...inputStyle('postalCode'), paddingRight: '32px' }}
                    />
                    {pincodeLoading && (
                      <Loader size={14} color="#3B6D11"
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', animation: 'spin 1s linear infinite' }} />
                    )}
                    {!pincodeLoading && city && !pincodeError && (
                      <Check size={14} color="#3B6D11"
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} />
                    )}
                  </div>
                  {pincodeError && <p style={s.warnText}><AlertCircle size={11} /> {pincodeError}</p>}
                  {fieldErr('postalCode') && !pincodeError && <p style={s.errText}><AlertCircle size={11} /> {errors.postalCode}</p>}
                </div>

                <div style={{ ...s.fieldGroup, flex: 1 }}>
                  <label style={s.label}>City <span style={{ color: '#E24B4A' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="Auto-filled or enter"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    onBlur={() => handleBlur('city')}
                    style={inputStyle('city')}
                  />
                  {fieldErr('city') && <p style={s.errText}><AlertCircle size={11} /> {errors.city}</p>}
                </div>
              </div>

              {/* State (auto, editable) */}
              {state ? (
                <div style={s.fieldGroup}>
                  <label style={s.label}>State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    style={{ ...s.input, color: '#555' }}
                  />
                </div>
              ) : null}

              {/* Submit error */}
              {errors.submit && (
                <div style={s.infoBox('#FCEBEB', '#A32D2D')}>
                  <AlertCircle size={13} /> {errors.submit}
                </div>
              )}

              {/* Actions */}
              <div style={s.actionRow}>
                <button type="button" onClick={resetForm} style={s.cancelBtn}>Cancel</button>
                <button type="submit" disabled={saving} style={saving ? { ...s.saveBtn, opacity: 0.7 } : s.saveBtn}>
                  {saving
                    ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                    : 'Save Address'
                  }
                </button>
              </div>
            </form>

          ) : (
            /* ── LIST VIEW ── */
            <div>
              <button
                onClick={() => setIsAdding(true)}
                style={s.addNewBtn}
              >
                <div style={s.addNewIcon}><Plus size={18} color="#3B6D11" /></div>
                <div>
                  <p style={s.addNewTitle}>Add a new address</p>
                  <p style={s.addNewSub}>Home, Office, or any location</p>
                </div>
              </button>

              {addresses.length > 0 && (
                <>
                  <p style={s.sectionTitle}>Saved Addresses</p>
                  <div style={s.addrList}>
                    {addresses.map((addr) => {
                      const sel = selectedAddress?.id === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => { setSelectedAddress(addr); onClose(); }}
                          style={sel ? { ...s.addrCard, ...s.addrCardSel } : s.addrCard}
                        >
                          <div style={sel ? s.addrDotSel : s.addrDot}>
                            <MapPin size={15} color={sel ? '#fff' : '#888'} />
                          </div>
                          <div style={s.addrInfo}>
                            <div style={s.addrNameRow}>
                              <span style={s.addrName}>{addr.name}</span>
                              {addr.isDefault && <span style={s.defaultBadge}>Default</span>}
                            </div>
                            <p style={s.addrText}>
                              {addr.addressLine}{addr.landmark ? `, ${addr.landmark}` : ''}
                            </p>
                            <p style={s.addrText}>
                              {addr.city}{addr.state ? `, ${addr.state}` : ''} — {addr.postalCode}
                            </p>
                          </div>
                          <div style={s.addrActions} onClick={e => e.stopPropagation()}>
                            {sel && <Check size={15} color="#3B6D11" />}
                            <button onClick={() => deleteAddress(addr.id)} style={s.deleteBtn} title="Delete">
                              <Trash2 size={13} color="#E24B4A" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {addresses.length === 0 && (
                <div style={s.emptyState}>
                  <MapPin size={30} color="#ccc" />
                  <p style={s.emptyTitle}>No saved addresses</p>
                  <p style={s.emptySub}>Add one to get started</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────
const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 1050,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
  },
  modal: {
    background: '#fff',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '460px',
    maxHeight: '92vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '20px 20px 0',
  },
  headerSub: {
    fontSize: '10px', fontWeight: '500', color: '#3B6D11',
    textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 2px',
  },
  headerTitle: { fontSize: '17px', fontWeight: '600', color: '#1a1a1a', margin: 0 },
  closeBtn: {
    width: '30px', height: '30px', borderRadius: '50%',
    border: '0.5px solid #e0e0e0', background: '#fafafa',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', padding: 0, flexShrink: 0,
  },
  body: { padding: '14px 20px 24px' },

  detectBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#f4faf0', border: '0.5px solid #C0DD97',
    borderRadius: '12px', padding: '11px 13px', marginBottom: '8px',
  },
  detectLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  detectIcon: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '0.5px solid #C0DD97', flexShrink: 0,
  },
  detectTitle: { fontSize: '12px', fontWeight: '500', color: '#27500A', margin: '0 0 1px' },
  detectSub: { fontSize: '10px', color: '#3B6D11', margin: 0 },
  detectBtn: {
    padding: '6px 14px', borderRadius: '99px',
    border: '0.5px solid #3B6D11', background: '#fff',
    color: '#3B6D11', fontSize: '12px', fontWeight: '500',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', minWidth: '58px', height: '30px',
  },

  infoBox: (bg, color) => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '11px', color, background: bg,
    borderRadius: '8px', padding: '7px 10px', margin: '6px 0',
  }),

  orRow: { display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0 12px' },
  orLine: { flex: 1, height: '0.5px', background: '#ebebeb' },
  orText: { fontSize: '10px', color: '#bbb', whiteSpace: 'nowrap' },

  fieldGroup: { marginBottom: '11px' },
  label: {
    display: 'block', fontSize: '10px', fontWeight: '500',
    color: '#888', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '5px',
  },
  optional: { fontWeight: '400', color: '#bbb', textTransform: 'none', letterSpacing: 0 },

  input: {
    width: '100%', padding: '9px 12px', borderRadius: '10px',
    border: '0.5px solid #e0e0e0', fontSize: '13px', color: '#1a1a1a',
    background: '#fff', outline: 'none', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '9px 12px', borderRadius: '10px',
    border: '0.5px solid #e0e0e0', fontSize: '13px', color: '#1a1a1a',
    background: '#fff', outline: 'none', resize: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: '1.5',
  },
  errText: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', color: '#A32D2D', margin: '4px 0 0',
  },
  warnText: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', color: '#854F0B', margin: '4px 0 0',
  },

  row2: { display: 'flex', gap: '10px' },

  labelRow: { display: 'flex', gap: '7px' },
  labelBtnOff: {
    display: 'flex', alignItems: 'center', gap: '5px',
    padding: '6px 12px', borderRadius: '99px',
    border: '0.5px solid #ddd', background: '#fafafa',
    color: '#777', fontSize: '12px', fontWeight: '500', cursor: 'pointer',
  },
  labelBtnOn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    padding: '6px 12px', borderRadius: '99px',
    border: '0.5px solid #3B6D11', background: '#EAF3DE',
    color: '#27500A', fontSize: '12px', fontWeight: '500', cursor: 'pointer',
  },

  actionRow: { display: 'flex', gap: '10px', marginTop: '18px' },
  cancelBtn: {
    flex: 1, padding: '11px', borderRadius: '12px',
    border: '0.5px solid #ddd', background: '#fafafa',
    color: '#666', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
  },
  saveBtn: {
    flex: 2, padding: '11px', borderRadius: '12px',
    border: 'none', background: '#3B6D11',
    color: '#fff', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '6px',
  },

  addNewBtn: {
    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
    padding: '13px', borderRadius: '14px',
    border: '1px dashed #C0DD97', background: '#fafff7',
    cursor: 'pointer', marginBottom: '16px', textAlign: 'left',
    boxSizing: 'border-box',
  },
  addNewIcon: {
    width: '38px', height: '38px', borderRadius: '50%',
    background: '#EAF3DE', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  addNewTitle: { fontSize: '13px', fontWeight: '500', color: '#27500A', margin: '0 0 2px' },
  addNewSub: { fontSize: '11px', color: '#3B6D11', margin: 0 },

  sectionTitle: {
    fontSize: '10px', fontWeight: '500', color: '#bbb',
    textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px',
  },
  addrList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  addrCard: {
    display: 'flex', alignItems: 'center', gap: '11px',
    padding: '11px 13px', borderRadius: '13px',
    border: '0.5px solid #ebebeb', background: '#fafafa',
    cursor: 'pointer',
  },
  addrCardSel: { border: '0.5px solid #3B6D11', background: '#f4faf0' },
  addrDot: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: '#f0f0f0', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  addrDotSel: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: '#3B6D11', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  addrInfo: { flex: 1, minWidth: 0 },
  addrNameRow: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' },
  addrName: { fontSize: '13px', fontWeight: '500', color: '#1a1a1a' },
  defaultBadge: {
    fontSize: '9px', fontWeight: '500', padding: '2px 6px',
    borderRadius: '99px', background: '#EAF3DE', color: '#3B6D11',
  },
  addrText: {
    fontSize: '11px', color: '#888', margin: '0',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  addrActions: { display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 },
  deleteBtn: {
    width: '27px', height: '27px', borderRadius: '50%',
    border: '0.5px solid #f5c1c1', background: '#fff8f8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', padding: 0,
  },

  emptyState: {
    textAlign: 'center', padding: '30px 16px',
    background: '#fafafa', borderRadius: '14px',
    border: '0.5px solid #ebebeb',
  },
  emptyTitle: { fontSize: '14px', fontWeight: '500', color: '#555', margin: '10px 0 3px' },
  emptySub: { fontSize: '12px', color: '#aaa', margin: 0 },
};

export default AddressSelectionModal;