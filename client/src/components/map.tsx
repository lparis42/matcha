import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const LocationMarker = ({ setSelectedPosition, default_value }) => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    setPosition(default_value);
  }, [default_value]);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setSelectedPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const MapView = ({setter, default_value}) => {
  const [selectedPosition, setSelectedPosition] = useState({ lat: default_value[0], lng: default_value[1] });

  useEffect(() => {
    setSelectedPosition({ lat: default_value[0], lng: default_value[1] });
  }, [default_value]);

  useEffect(() => {
    setter("geolocation", selectedPosition);
  }, [selectedPosition]);

  const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center);
    }, [center, map]);
    return null;
  };

  return (
    <div>
      <MapContainer center={default_value} zoom={13} style={{ height: '500px', width: '100%' }}>
        <MapUpdater center={default_value} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker setSelectedPosition={setSelectedPosition} default_value={default_value}/>
      </MapContainer>
      {selectedPosition && (
        <div>
          <p>Selected Position: {`Latitude: ${selectedPosition.lat}, Longitude: ${selectedPosition.lng}`}</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
