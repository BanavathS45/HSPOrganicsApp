import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { FARM_LOCATION } from '../utils/geo';

// Fix Leaflet marker icon asset resolution issues by using SVG data URIs
const farmIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#1B5E20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
  <polyline points="9 22 9 12 15 12 15 22"></polyline>
  <circle cx="12" cy="7" r="1.5" fill="#4CAF50"></circle>
</svg>
`;

const customerIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#D32F2F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
  <circle cx="12" cy="10" r="3" fill="#D32F2F"></circle>
</svg>
`;

const createSVGIcon = (svgMarkup) => {
  return new L.DivIcon({
    html: `<div style="transform: translate(-18px, -36px);">${svgMarkup}</div>`,
    className: 'custom-leaflet-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 36]
  });
};

// Component to handle map centering when coordinates change
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

// Component to handle map clicks and update pin
const MapEvents = ({ isEditable, onLocationChange }) => {
  useMapEvents({
    click(e) {
      if (isEditable && onLocationChange) {
        onLocationChange({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          addressLine: `Selected Pin Location (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`,
          city: 'Bengaluru',
          postalCode: '560001'
        });
      }
    }
  });
  return null;
};

const DeliveryMap = ({ customerLocation, onLocationChange, isEditable = false }) => {
  const farmIcon = useMemo(() => createSVGIcon(farmIconSVG), []);
  const customerIcon = useMemo(() => createSVGIcon(customerIconSVG), []);
  
  const markerRef = useRef(null);

  const customerCoords = useMemo(() => {
    if (customerLocation && customerLocation.lat && customerLocation.lng) {
      return [customerLocation.lat, customerLocation.lng];
    }
    // Default Indiranagar, Bangalore location coordinates
    return [12.9784, 77.6408];
  }, [customerLocation]);

  const mapCenter = useMemo(() => {
    // Center between Farm and Customer
    const lat = (FARM_LOCATION.lat + customerCoords[0]) / 2;
    const lng = (FARM_LOCATION.lng + customerCoords[1]) / 2;
    return [lat, lng];
  }, [customerCoords]);

  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker != null && onLocationChange) {
        const latLng = marker.getLatLng();
        onLocationChange({
          lat: latLng.lat,
          lng: latLng.lng,
          addressLine: `Dragged Pin Location (${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)})`,
          city: 'Bengaluru',
          postalCode: '560001'
        });
      }
    },
  }), [onLocationChange]);

  return (
    <div className="w-100 position-relative">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        scrollWheelZoom={false}
        style={{ height: '300px', width: '100%', borderRadius: '16px', border: '2px solid var(--border-color)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {/* Map Recenter logic */}
        <MapRecenter center={customerCoords} />

        {/* Map Click events to change marker location */}
        <MapEvents isEditable={isEditable} onLocationChange={onLocationChange} />

        {/* 1. Farm Hub Marker */}
        <Marker position={[FARM_LOCATION.lat, FARM_LOCATION.lng]} icon={farmIcon}>
          <Popup>
            <div style={{ fontFamily: 'var(--font-heading)' }}>
              <strong>HSP Organics Farm</strong><br />
              Origin Hub
            </div>
          </Popup>
        </Marker>

        {/* 2. Customer Location Marker */}
        <Marker
          draggable={isEditable}
          eventHandlers={isEditable ? eventHandlers : undefined}
          position={customerCoords}
          icon={customerIcon}
          ref={markerRef}
        >
          <Popup>
            <div style={{ fontFamily: 'var(--font-heading)' }}>
              <strong>Delivery Destination</strong><br />
              {customerLocation?.name || 'Your Address'}<br />
              {isEditable && <span className="text-muted text-xs">Drag marker to adjust location pin</span>}
            </div>
          </Popup>
        </Marker>

        {/* 3. Delivery Path Line */}
        <Polyline 
          positions={[
            [FARM_LOCATION.lat, FARM_LOCATION.lng],
            customerCoords
          ]}
          pathOptions={{
            color: 'var(--primary-leaf)', 
            weight: 3, 
            dashArray: '5, 10',
            opacity: 0.8
          }} 
        />
      </MapContainer>
      
      {/* Floating coordinates indicator */}
      <div className="position-absolute bottom-2 left-2 z-3 bg-white px-2 py-1 rounded shadow-sm text-xs border" style={{ bottom: '10px', left: '10px', zIndex: 400, color: 'var(--text-primary)' }}>
        Route Pin: {customerCoords[0].toFixed(4)}, {customerCoords[1].toFixed(4)}
      </div>
    </div>
  );
};

export default DeliveryMap;
