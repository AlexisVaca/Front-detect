import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Asegúrate de importar el CSS de Leaflet
import 'react-leaflet-markercluster/dist/styles.min.css'; // Asegúrate de importar el CSS de MarkerClusterGroup
import MarkerClusterGroup from 'react-leaflet-markercluster'; // Importa MarkerClusterGroup

const MapComponent = ({ locations }) => {
  const defaultCenter = [0, 0];

  // Configura el icono personalizado para los marcadores
  const markerIcon = new L.Icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png').default,
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
    shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <MapContainer center={defaultCenter} zoom={2} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <MarkerClusterGroup>
        {locations.map((location, index) => (
          <Marker key={index} position={[location.latitude, location.longitude]} icon={markerIcon}>
            <Popup>
              Ubicación: {location.latitude}, {location.longitude}
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default MapComponent;
