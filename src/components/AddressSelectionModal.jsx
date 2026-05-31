import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Navigation, Plus, Trash2, Check } from 'lucide-react';
import DeliveryMap from './DeliveryMap';

const AddressSelectionModal = ({ show, onClose }) => {
  const { 
    user, addresses, selectedAddress, setSelectedAddress, 
    detectLocation, currentLocation, saveAddress, deleteAddress 
  } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [addressName, setAddressName] = useState('Home');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [postalCode, setPostalCode] = useState('');
  const [mapCoords, setMapCoords] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  // Sync coords from detected location or selected address
  useEffect(() => {
    if (selectedAddress) {
      setMapCoords({ lat: selectedAddress.lat, lng: selectedAddress.lng, name: selectedAddress.name });
    } else if (currentLocation) {
      setMapCoords({ lat: currentLocation.lat, lng: currentLocation.lng, name: currentLocation.name });
    }
  }, [selectedAddress, currentLocation]);

  if (!show) return null;

  const handleDetectLocation = async () => {
    setGeoLoading(true);
    try {
      const loc = await detectLocation();
      setAddressLine(loc.addressLine);
      setCity(loc.city);
      setPostalCode(loc.postalCode);
      setMapCoords({ lat: loc.lat, lng: loc.lng, name: 'Detected Location' });
    } catch (err) {
      alert("Could not detect location: " + err);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleMapPinChange = (newCoords) => {
    setMapCoords({
      lat: newCoords.lat,
      lng: newCoords.lng,
      name: 'Selected Pin'
    });
    setAddressLine(newCoords.addressLine);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!addressLine || !postalCode) {
      alert("Please fill in all fields.");
      return;
    }

    const payload = {
      name: addressName,
      addressLine,
      city,
      postalCode,
      lat: mapCoords?.lat || 12.9716,
      lng: mapCoords?.lng || 77.5946,
      isDefault: addresses.length === 0
    };

    try {
      const saved = await saveAddress(payload);
      setSelectedAddress(saved);
      setIsAdding(false);
      // Reset form
      setAddressLine('');
      setPostalCode('');
      onClose();
    } catch (err) {
      alert("Error saving address: " + err.message);
    }
  };

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 glass-card text-start" style={{ borderRadius: '24px' }}>
          
          {/* Header */}
          <div className="modal-header border-0 d-flex justify-content-between align-items-center px-4 pt-4">
            <h5 className="modal-title font-heading fw-bold text-success">
              {isAdding ? 'Add Delivery Address' : 'Select Delivery Location'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body px-4 pb-4">
            
            {/* Map Preview for selected / detected pin */}
            <div className="mb-4">
              <h6 className="font-heading fw-semibold mb-2 text-secondary">Interactive Delivery Route</h6>
              <DeliveryMap 
                customerLocation={mapCoords} 
                onLocationChange={handleMapPinChange} 
                isEditable={isAdding} 
              />
              <small className="text-muted d-block mt-1">
                {isAdding ? '💡 Drag the red destination pin to select your home location.' : '🗺️ Route showing distance from our organic farm hub.'}
              </small>
            </div>

            {isAdding ? (
              // Add Address Form
              <form onSubmit={handleSave} className="animate-fade-in-up">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <button 
                    type="button" 
                    onClick={handleDetectLocation} 
                    className="btn btn-outline-success btn-sm rounded-pill d-flex align-items-center gap-2"
                    disabled={geoLoading}
                  >
                    <Navigation size={14} className={geoLoading ? 'pulse-animation' : ''} />
                    {geoLoading ? 'Detecting...' : 'Detect Current Location'}
                  </button>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-secondary fw-semibold">Label (e.g. Home, Office)</label>
                    <select 
                      className="form-select form-control-organic" 
                      value={addressName} 
                      onChange={(e) => setAddressName(e.target.value)}
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label text-secondary fw-semibold">Postal Code / Pin Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 560038" 
                      className="form-control form-control-organic" 
                      value={postalCode} 
                      onChange={(e) => setPostalCode(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label text-secondary fw-semibold">Address Line</label>
                    <textarea 
                      rows="3" 
                      placeholder="House No, Building, Flat, Street Name" 
                      className="form-control form-control-organic" 
                      value={addressLine} 
                      onChange={(e) => setAddressLine(e.target.value)}
                      required 
                    ></textarea>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary fw-semibold">City</label>
                    <input 
                      type="text" 
                      className="form-control form-control-organic" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)} 
                      disabled
                    />
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn btn-organic flex-grow-1">Save Address</button>
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)} 
                    className="btn btn-light rounded-pill px-4"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // List Addresses
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="font-heading fw-semibold m-0 text-secondary">Your Saved Addresses</h6>
                  <button 
                    onClick={() => {
                      setIsAdding(true);
                      handleDetectLocation(); // Auto detect location when adding new
                    }} 
                    className="btn btn-success btn-sm rounded-pill d-flex align-items-center gap-1"
                  >
                    <Plus size={14} /> Add New
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-4 bg-light rounded-4">
                    <MapPin className="text-muted mb-2 mx-auto" size={32} />
                    <p className="text-muted m-0">No saved addresses found. Add one to see delivery charges.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {addresses.map((addr) => {
                      const isSelected = selectedAddress?.id === addr.id;
                      return (
                        <div 
                          key={addr.id}
                          className={`p-3 rounded-4 border d-flex justify-content-between align-items-center cursor-pointer transition-normal ${isSelected ? 'border-success bg-success-subtle' : 'border-light-subtle'}`}
                          onClick={() => {
                            setSelectedAddress(addr);
                            onClose();
                          }}
                          style={{
                            background: isSelected ? 'rgba(46, 125, 50, 0.05)' : 'var(--bg-card-solid)',
                            borderColor: isSelected ? 'var(--primary-leaf) !important' : 'var(--border-color)'
                          }}
                        >
                          <div className="d-flex align-items-start gap-3 text-truncate">
                            <div className={`p-2 rounded-circle ${isSelected ? 'bg-success text-white' : 'bg-light text-secondary'}`}>
                              <MapPin size={16} />
                            </div>
                            <div className="text-truncate">
                              <h6 className="m-0 font-heading fw-bold" style={{ fontSize: '14px' }}>
                                {addr.name} {addr.isDefault && <span className="badge bg-success-subtle text-success ms-1">Default</span>}
                              </h6>
                              <p className="m-0 text-muted text-truncate font-body" style={{ fontSize: '12px' }}>
                                {addr.addressLine}, {addr.city} - {addr.postalCode}
                              </p>
                            </div>
                          </div>
                          
                          <div className="d-flex gap-1 align-items-center" onClick={(e) => e.stopPropagation()}>
                            {isSelected && <Check className="text-success me-2" size={18} />}
                            <button 
                              onClick={() => deleteAddress(addr.id)} 
                              className="btn btn-sm btn-link text-danger p-1"
                              title="Delete address"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSelectionModal;
