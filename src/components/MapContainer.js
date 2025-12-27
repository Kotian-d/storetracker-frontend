import React from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

const MapContainer = ({ stores, center }) => {
  // Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual API key
  const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  
  // Default center point (e.g., New York City) if no stores are provided
  const defaultCenter = { lat: 13.2544832, lng: 74.7692374 };
  
  // Set center to the first store's location if available
  const initialCenter = stores.length > 0 && !center 
    ? { lat: stores[0].lat, lng: stores[0].long } 
    : (center || defaultCenter);

  return (
    
    <APIProvider apiKey={API_KEY}>
      <div style={{ height: '500px', width: '100%' }}>
        <Map
          defaultCenter={initialCenter}
          defaultZoom={12}
          gestureHandling={'greedy'}
          //mapId={"YOUR_MAP_ID"} // You can generate a Map ID in the Google Console
        >
          {stores.map((store) => (
            <Marker
              key={store._id}
              position={{ lat: store.lat, lng: store.long }}
              title={store.name}
            />
          ))}
        </Map>
      </div>
    </APIProvider>

  );
};

export default MapContainer;