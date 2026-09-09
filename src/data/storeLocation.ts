export interface StoreLocationData {
  name: string;
  legalName: string;
  address: string;
  shortAddress: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsappNumber: string;
  email: string;
  openingHoursToday: string;
  openingHoursWeek: string;
  googleMapsUrl: string;
  directionsUrl: string;
}

/**
 * AUTHORITATIVE SINGLE SOURCE OF TRUTH FOR STORE LOCATION
 * Marudhar Fashion Point
 * JOJRI NADI KE PASS, MISTRI MARKET, PIPAR CITY, JODHPUR, RAJASTHAN, INDIA
 */
export const CANONICAL_STORE_LOCATION: StoreLocationData = {
  name: "Marudhar Fashion Point",
  legalName: "Marudhar Fashion Point — Main Store Pipar City",
  address: "JOJRI NADI KE PASS, MISTRI MARKET, PIPAR CITY, JODHPUR, RAJASTHAN, INDIA",
  shortAddress: "JOJRI NADI KE PASS, MISTRI MARKET, PIPAR CITY, Rajasthan 342601",
  landmark: "Near Jojri Nadi & Mistri Market",
  city: "Pipar City",
  district: "Jodhpur",
  state: "Rajasthan",
  country: "India",
  pincode: "342601",
  latitude: 26.3862,
  longitude: 73.5414,
  phone: "+91 9782482250",
  whatsappNumber: "919782482250",
  email: "marudharfashionpoint@gmail.com",
  openingHoursToday: "9:00 AM - 9:30 PM",
  openingHoursWeek: "Mon - Sun: 9:00 AM - 9:30 PM",
  // Single Source of Truth for Google Maps links:
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=26.3862,73.5414",
  directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=26.3862,73.5414",
};

export const getGoogleMapsDirectionsUrl = (
  lat: number = CANONICAL_STORE_LOCATION.latitude,
  lng: number = CANONICAL_STORE_LOCATION.longitude
) => {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
};

export const getGoogleMapsOpenUrl = (
  lat: number = CANONICAL_STORE_LOCATION.latitude,
  lng: number = CANONICAL_STORE_LOCATION.longitude
) => {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
};
