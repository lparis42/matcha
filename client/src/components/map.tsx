import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLngExpression } from 'leaflet'; // Importer LatLngExpression pour le typage
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

L.Marker.prototype.options.icon = defaultIcon; // Set the default icon

const LocationMarker: React.FC<{ setSelectedPosition: (position: LatLngExpression) => void; default_value: LatLngExpression }> = ({ setSelectedPosition, default_value }) => {
  const [position, setPosition] = useState<LatLngExpression | null>(default_value);

  useEffect(() => {
    setPosition(default_value); // Met à jour la position si `default_value` change
  }, [default_value]);

  useMapEvents({
    click(e) {
      const latLng = e.latlng as LatLngExpression; // S'assurer que e.latlng est bien typé
      setPosition(latLng);
      setSelectedPosition(latLng);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

const MapView: React.FC<{ setter: (key: string, value: LatLngExpression) => void; default_value: LatLngExpression }> = ({ setter, default_value }) => {
  const [selectedPosition, setSelectedPosition] = useState<LatLngExpression>(default_value);

  useEffect(() => {
    setter('geolocation', selectedPosition);
  }, [selectedPosition, setter]);

  return (
    <div>
      <MapContainer center={default_value} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker setSelectedPosition={setSelectedPosition} default_value={default_value} />
      </MapContainer>
      {selectedPosition && (
        <div>
          <p>
            Selected Position: {`Latitude: ${selectedPosition[0]}, Longitude: ${selectedPosition[1]}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapView;
