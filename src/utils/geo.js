// HSP Organics Geolocation & Distance Utilities

// Central Farm location coordinates (Bengaluru, India)
export const FARM_LOCATION = {
  lat: 12.9716,
  lng: 77.5946,
  address: 'HSP Organics Farm Hub, Cubbon Park Road, Bengaluru, Karnataka 560001'
};

// Haversine formula to calculate distance in Kilometers
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d; // distance in km
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Auto calculate delivery charge based on distance
// Base charge: ₹30, plus ₹8 per KM. Free delivery for orders above ₹500 and distance < 5 KM.
export const calculateDeliveryCharge = (distanceKm, cartSubtotal) => {
  if (cartSubtotal >= 500 && distanceKm <= 5) {
    return 0; // Free delivery
  }
  const base = 30;
  const variable = Math.ceil(distanceKm) * 8;
  return base + variable;
};
