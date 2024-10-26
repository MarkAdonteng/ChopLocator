import React, { useEffect, useState} from 'react';
import {TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { FoodSpot } from '../types';
import 'leaflet-routing-machine';
import { MapContainer } from 'react-leaflet';



interface MapComponentProps {
  userLocation: [number, number] | null;
  foodSpots: FoodSpot[];
  selectedSpot: FoodSpot | null;
  onDirectionsFound: (distance: number, duration: number) => void;
}

const RoutingMachine = ({ userLocation, selectedSpot }: { userLocation: [number, number], selectedSpot: FoodSpot }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !userLocation || !selectedSpot) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[1], userLocation[0]),
        L.latLng(selectedSpot.coordinates[1], selectedSpot.coordinates[0])
      ],
      routeWhileDragging: true,
      addWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, userLocation, selectedSpot]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ userLocation, foodSpots, selectedSpot }) => {
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (map && userLocation) {
      map.setView([userLocation[1], userLocation[0]], 14);
    }
  }, [map, userLocation]);

  if (!userLocation) {
    return <div className="h-full bg-gray-200 flex items-center justify-center">Loading map...</div>;
  }

  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const foodIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // const handleMapReady = useCallback(() => {
  //   return {
  //     handler: (map: L.Map) => {
  //       setMap(map);
  //     }
  //   };
  // }, []);

  return (
     <MapContainer 
      center={[userLocation[1], userLocation[0]]} 
      zoom={16} 
      style={{ height: '100%', width: '100%' }} 
      whenReady={() => {
        return {
          handler: (map: L.Map) => setMap(map)
        };
      }}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      <Marker position={[userLocation[1], userLocation[0]]} icon={userIcon}>
        <Popup>You are here</Popup>
      </Marker>
      {foodSpots.map((spot) => (
        <Marker key={spot.id} position={[spot.coordinates[1], spot.coordinates[0]]} icon={foodIcon}>
          <Popup>
            <div>
              <h3 className="font-semibold">{spot.name}</h3>
              <p className="text-sm">{spot.type}</p>
              <p className="text-xs text-gray-500">{spot.distance.toFixed(2)} miles away</p>
              <img src={spot.image} alt={spot.name} className="w-full h-32 object-cover mt-2 rounded" />
            </div>
          </Popup>
        </Marker>
      ))}
      {selectedSpot && userLocation && (
        <RoutingMachine userLocation={userLocation} selectedSpot={selectedSpot} />
      )}
    </MapContainer>
  );
};

export default MapComponent;