import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  CANONICAL_STORE_LOCATION,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsOpenUrl,
} from '../../data/storeLocation';

export interface MapStoreItem {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  reviewsCount?: number;
  isOpen?: boolean;
  phone?: string;
}

interface LeafletStoreMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  stores?: MapStoreItem[];
  selectedStoreId?: string | null;
  onSelectStore?: (store: MapStoreItem) => void;
  className?: string;
  mapViewMode?: 'roadmap' | 'satellite';
  userLocation?: { lat: number; lng: number } | null;
}

export const LeafletStoreMap: React.FC<LeafletStoreMapProps> = ({
  center,
  zoom = 14,
  stores = [],
  selectedStoreId = null,
  onSelectStore,
  className = 'w-full h-full min-h-[350px]',
  mapViewMode = 'roadmap',
  userLocation = null,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Custom DivIcon pin creator to avoid 404 asset bugs
  const createPinIcon = (isSelected: boolean) => {
    const color = isSelected ? '#059669' : '#111827';
    const border = '#FFFFFF';
    const size = isSelected ? 36 : 30;

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; width: ${size}px; height: ${size}px; transform: translate(-50%, -100%);">
          <div style="
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border: 2px solid ${border};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          ">
            <div style="
              width: ${isSelected ? 12 : 10}px;
              height: ${isSelected ? 12 : 10}px;
              background: #FFFFFF;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    });
  };

  const createUserPinIcon = () => {
    return L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background: #2563EB;
          border: 3px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(37,99,235,0.6);
          transform: translate(-50%, -50%);
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  // 1. Initialize Leaflet Map safely
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent re-initialization in React StrictMode
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: true,
        attributionControl: true,
      });

      mapInstanceRef.current = map;

      // Force immediate resize recalculation
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Handle Tile Layer switching (Roadmap vs Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl =
      mapViewMode === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution =
      mapViewMode === 'satellite'
        ? 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    const newTileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution,
    });

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [mapViewMode]);

  // 3. Update center and zoom on prop changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView([center.lat, center.lng], zoom, { animate: true });

    // Handle container size changes
    map.invalidateSize();
  }, [center.lat, center.lng, zoom]);

  // 4. Update Store Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old store markers
    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};

    const activeStores = stores.length > 0 ? stores : [
      {
        id: 'main-store',
        name: CANONICAL_STORE_LOCATION.name,
        address: CANONICAL_STORE_LOCATION.address,
        latitude: CANONICAL_STORE_LOCATION.latitude,
        longitude: CANONICAL_STORE_LOCATION.longitude,
        phone: CANONICAL_STORE_LOCATION.phone,
        isOpen: true,
      }
    ];

    activeStores.forEach((store) => {
      const isSelected = selectedStoreId === store.id || activeStores.length === 1;
      const marker = L.marker([store.latitude, store.longitude], {
        icon: createPinIcon(isSelected),
      });

      const openUrl = getGoogleMapsOpenUrl(store.latitude, store.longitude);
      const directionsUrl = getGoogleMapsDirectionsUrl(store.latitude, store.longitude);

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; max-width: 220px; color: #111827;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #059669;">${store.name}</h4>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #4B5563; line-height: 1.4;">${store.address}</p>
          <div style="display: flex; gap: 6px; border-top: 1px solid #E5E7EB; padding-top: 6px;">
            <a href="${openUrl}" target="_blank" rel="noopener noreferrer" style="
              flex: 1; text-align: center; background: #111827; color: #FFFFFF; text-decoration: none;
              font-size: 10px; font-weight: 700; padding: 5px 8px; border-radius: 6px;
            ">Open Map</a>
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="
              flex: 1; text-align: center; background: #2563EB; color: #FFFFFF; text-decoration: none;
              font-size: 10px; font-weight: 700; padding: 5px 8px; border-radius: 6px;
            ">Directions</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectStore) onSelectStore(store);
      });

      marker.addTo(map);
      markersRef.current[store.id] = marker;
    });
  }, [stores, selectedStoreId]);

  // 5. Update User Location Marker if available
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserPinIcon(),
      });

      userMarker.bindPopup('<b>Your Current Location</b>');
      userMarker.addTo(map);
      userMarkerRef.current = userMarker;
    }
  }, [userLocation]);

  // 6. Handle container resize (e.g., when modal opens)
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px] z-0" />
    </div>
  );
};
