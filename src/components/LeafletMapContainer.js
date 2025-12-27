// LeafletMapContainer.jsx
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { Box, Typography } from "@mui/material";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const blueIcon = new L.Icon({ iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],});

const redIcon = new L.Icon({  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41], });

const greenIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],});

const pinkIcon = new L.Icon({ 
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const FitBoundsOnRoute = ({ searchResult, nearestStore }) => {
  const map = useMap();

  console.log("FitBoundsOnRoute rendered with:", { searchResult, nearestStore });
  useEffect(() => {
    if (!searchResult || !nearestStore?.store) return;
    const from = L.latLng(searchResult.lat, searchResult.lon);
    const to = L.latLng(nearestStore.store.lat, nearestStore.store.long);
    const bounds = L.latLngBounds(from, to);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [searchResult, nearestStore, map]);

  return null;
};

const LeafletMapContainer = ({ stores, searchResult, nearestStore, routeCoords }) => {
  const defaultCenter = [13.262504, 74.768938];
  const center =
    stores.length > 0 ? [stores[0].lat, stores[0].long] : defaultCenter;

  const routePoints =
    searchResult && nearestStore?.store
      ? [
          [searchResult.lat, searchResult.lon],
          [nearestStore.store.lat, nearestStore.store.long],
        ]
      : null;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}@2x.png?key=DtBYm9N4PqZMG77jbL9S"
        />

        {/* auto-fit to route */}
        {routePoints && (
          <FitBoundsOnRoute
            searchResult={searchResult}
            nearestStore={nearestStore}
          />
        )}

        {/* searched place marker */}
        {searchResult && (
          <Marker
            position={[searchResult.lat, searchResult.lon]}
            icon={greenIcon}
          >
            <Popup>
              <Typography variant="subtitle2">
                Searched place
              </Typography>
              <Typography variant="body2">
                {searchResult.display_name}
              </Typography>
            </Popup>
          </Marker>
        )}

        {/* store markers */}
        {stores.map((store) => {
          const isNearest =
            nearestStore?.store && nearestStore.store._id === store._id;
          const icon = store.product.name.toLowerCase() === "pavathi" ? pinkIcon : store.isTechnician === false ? redIcon : blueIcon;

          return (
            <Marker
              key={store._id}
              position={[store.lat, store.long]}
              icon={icon}
            >
              <Popup>
                <Box>
                  <Typography variant="subtitle1">
                    {store.name} {isNearest ? "(Nearest)" : ""}
                  </Typography>
                  <Typography variant="body2">Owner: {store.owner}</Typography>
                  <Typography variant="body2">
                    Contact: {store.contact}
                  </Typography>
                  <Typography variant="caption">
                    Lat: {store.lat.toFixed(4)}, Long: {store.long.toFixed(4)}
                  </Typography>
                  {store.storeImage && (
                    <Box mt={1}>
                      <img
                        src={`${API_BASE_URL}${store.storeImage}`}
                        alt={store.name}
                        style={{
                          maxWidth: "100px",
                          maxHeight: "100px",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Popup>
            </Marker>
          );
        })}

        {/* route polyline from searched place to nearest store */}
        {routeCoords && routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: "blue", weight: 5 }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default LeafletMapContainer;
