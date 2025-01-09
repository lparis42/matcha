import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useSocket } from '@/api/Socket';

// Fix for default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const LocationMarker = ({ setSelectedPosition, default_value }) => {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    setPosition(default_value);
  }, [default_value]);

  useMapEvents({
    click(e) {
      map.setView(e.latlng);
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
  const [map, setMap] = useState<L.Map | null>(null);

  const {eventGeolocation} = useSocket();

  useEffect(() => {
    setSelectedPosition({ lat: default_value[0], lng: default_value[1] });
  }, [default_value]);

  useEffect(() => {
    setter("geolocation", selectedPosition);
  }, [selectedPosition]);

  async function getGeolocation() {
    const [err, data] = await eventGeolocation()
    if (err) {
      return
    }
    map.setView({lat: data.latitude, lng: data.longitude})
    setSelectedPosition({lat: data.latitude, lng: data.longitude})
  }

  return (
    <div>
      {map ? <button type='button' onClick={() => getGeolocation()}>Use my location</button> : null}
      <MapContainer center={default_value} zoom={13} style={{ height: '500px', width: '100%' }} ref={setMap}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution={"&copy; <a href='https://www.openstreetmap.org/copyright'>"}
        />
        <LocationMarker setSelectedPosition={setSelectedPosition} default_value={default_value}/>
      </MapContainer>
    </div>
  );
};

export default MapView;
