// MapPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Grid,
  Autocomplete,
  Card,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import LeafletMapContainer from "../components/LeafletMapContainer";
import { getStores, getRouteBetween, getGeoCode } from "../api/stores";

const MapPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeMatrix, setRouteMatrix] = useState([]);

  // filters + search state
  const [filters, setFilters] = useState({
    tataplay: true,
    pavathi: true,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]); // {lat, lon, display_name}
  const [nearestStore, setNearestStore] = useState(null); // { store, distance }
  const [nearestStores, setNearestStores] = useState([]); // array of { store, distance }
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [technician, setTechnician] = useState("");
  const [showFloatingCard, setShowFloatingCard] = useState(false);

  // === Load stores ===
  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await getStores();
      setStores(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  // === Nominatim search ===
  const handleSearchPlace = async () => {
    if (!searchQuery.trim()) return;

    const res = await getGeoCode(searchQuery.trim());
    const fc = res.data; // FeatureCollection
    const data = fc.features || [];

    if (Array.isArray(data) && data.length > 0) {
      setSearchResults(data); // keep all features
    } else {
      setSearchResults([]);
      alert("No results");
    }
  };

  const handleSelectPlace = (feature) => {
    const [lon, lat] = feature.geometry.coordinates;
    setSelectedPlace({
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      display_name: feature.properties.formatted,
    });

    setSearchQuery(feature.properties.formatted); // optional: fill textbox
    setSearchResults([]); // optional: hide list after choose
  };

  // === Haversine distance in km ===
  const distanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // === Filtered stores by product flags ===
  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      const hasTataplay = s.product?.name?.toLowerCase().includes("tataplay");
      const hasPavathi = s.product?.name?.toLowerCase().includes("pavathi");

      if (filters.tataplay && filters.pavathi) return true; // no filters active
      if (filters.tataplay && hasTataplay) return true;
      if (filters.pavathi && hasPavathi) return true;
      return false;
    });
  }, [stores, filters]);

  // === Find nearest + fetch ORS route ===
  const handleFindNearestToSearch = async () => {
    if (!searchResults) {
      alert("Search a place first");
      return;
    }
    if (!stores || stores.length === 0) {
      alert("No stores loaded");
      return;
    }

    const { lat, lon } = selectedPlace;

    // build array with distance
    const withDistances = filteredStores
      .filter(
        (s) =>
          s.lat != null &&
          s.long != null &&
          !isNaN(s.lat) &&
          !isNaN(s.long) &&
          s.isTechnician === true
      )
      .map((s) => ({
        store: s,
        distance: distanceKm(lat, lon, s.lat, s.long),
      }));

    if (withDistances.length === 0) {
      alert("No valid store locations");
      return;
    }

    // sort by distance asc
    withDistances.sort((a, b) => a.distance - b.distance);

    // pick top 3
    const top3 = withDistances.slice(0, 3);

    setNearestStores(top3);
    setNearestStore(top3[0]); // keep your existing single nearest for map marker highlighting
    setSelectedStoreId(top3[0].store._id); // assuming you have _id

    // load route for first item by default
    try {
      const from = { lat: selectedPlace.lat, lon: selectedPlace.lon };
      const to = { lat: top3[0].store.lat, lon: top3[0].store.long };
      const { coords, features } = await getRouteBetween(from, to);
      setRouteCoords(coords);
      setRouteMatrix(features);
      setShowFloatingCard(true);
    } catch (e) {
      console.error(e);
      alert("Failed to load route");
    }
  };

  const handleSelectTechnician = async (item) => {
    if (!searchResults) return;

    setSelectedStoreId(item.store._id);
    setNearestStore(item); // update highlighted store on the map
    /*
  setMessage(
    `Selected store: ${item.store.name} (${item.distance.toFixed(2)} km)`
  );*/

    try {
      const from = { lat: selectedPlace.lat, lon: selectedPlace.lon };
      const to = { lat: item.store.lat, lon: item.store.long };
      const { coords, features } = await getRouteBetween(from, to);
      setRouteCoords(coords);
      setRouteMatrix(features);
      setShowFloatingCard(true);
    } catch (e) {
      console.error(e);
      alert("Failed to load route for selected store");
    }
  };

  const handleGetRoute = async () => {
    if (!selectedPlace || !technician) {
      alert("Select a place and technician first");
      return;
    }
    try {
      const from = { lat: selectedPlace.lat, lon: selectedPlace.lon };
      const to = { lat: technician.lat, lon: technician.long };
      const { coords, features } = await getRouteBetween(from, to);
      setRouteCoords(coords);
      setRouteMatrix(features);
      setShowFloatingCard(true);
    } catch (e) {
      console.error(e);
      alert("Failed to load route");
    }
  };

  const metersToKilometers = (meters) => {
    if (meters == null || isNaN(meters)) return 0;
    return (meters / 1000).toFixed(2);
  };

  // Convert seconds to hours:minutes format (e.g., "2h 30m")
  const secondsToHoursMinutes = (seconds) => {
    if (seconds == null || isNaN(seconds)) return "0h 0m";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <Box sx={{ height: "800px", display: "flex", position: "relative" }}>
      {/* Map - 80% */}
      <Box
        sx={{
          flex: 4, // 4 / (4 + 1) = 80%
          display: "flex",
          flexDirection: "column",
          pr: 1,
          minWidth: 0, // important so Leaflet can use full width
        }}
      >
        <Typography variant="h7" gutterBottom sx={{ mb: 1 }}>
          Store Locations Map
        </Typography>

        <Box sx={{ flex: 1 }}>
          <LeafletMapContainer
            stores={filteredStores}
            searchResult={selectedPlace}
            nearestStore={nearestStore}
            routeCoords={routeCoords}
          />
        </Box>
      </Box>

      {/* Controls - 20% */}
      <Box
        sx={{
          flex: 1, // 1 / (4 + 1) = 20%
          pl: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            height: "100%",
            p: 2,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Filters & Search
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {/* Search place with Nominatim */}
          <Typography variant="subtitle2" gutterBottom>
            Search place
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="City, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleSearchPlace}
            >
              Go
            </Button>
          </Box>
          {searchResults && (
            <Typography variant="caption" display="block" sx={{ mb: 1 }}>
              {searchResults.display_name}
            </Typography>
          )}

          {searchResults.length > 0 && (
            <Box
              sx={{
                mb: 2,
                maxHeight: 200,
                overflowY: "auto",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              {searchResults.map((feature, idx) => (
                <Box
                  key={feature.properties.place_id || idx}
                  sx={{
                    p: 1,
                    borderBottom:
                      idx !== searchResults.length - 1 ? "1px solid" : "none",
                    borderColor: "divider",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                  onClick={() => handleSelectPlace(feature)}
                >
                  <Typography variant="body2">
                    {feature.properties.formatted}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {feature.properties.name} ({feature.properties.category})
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          <Grid item xs={12}>
            <Autocomplete
              options={stores.filter((s) => s.isTechnician === true)}
              getOptionLabel={(option) => option.name || ""}
              // if technician is id instead of object, use isOptionEqualToValue
              isOptionEqualToValue={(option, value) => option._id === value._id}
              value={technician}
              onChange={(e, newValue) => setTechnician(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Technician"
                  placeholder="Type to search technician"
                  helperText="Select a technician"
                  fullWidth
                />
              )}
            />
          </Grid>

          {/* Find nearest store to searched place */}
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            startIcon={<MyLocationIcon />}
            onClick={handleGetRoute}
            size="medium"
          >
            Get Route
          </Button>

          <Divider sx={{ mb: 2 }} />

          {/* Product filters */}
          <Typography variant="subtitle2" gutterBottom>
            Products
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.tataplay}
                onChange={handleFilterChange}
                name="tataplay"
                size="small"
              />
            }
            label="Tataplay"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.pavathi}
                onChange={handleFilterChange}
                name="pavathi"
                size="small"
              />
            }
            label="Pavathi"
          />

          <Divider sx={{ my: 2 }} />

          {/* Find nearest store to searched place */}
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            startIcon={<MyLocationIcon />}
            onClick={handleFindNearestToSearch}
            size="medium"
          >
            Nearest store to place
          </Button>

          <Divider sx={{ my: 2 }} />

          {nearestStores.length > 0 && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Top 3 nearest technicians
              </Typography>
              {nearestStores.map((item, index) => (
                <Box
                  key={item.store._id || item.store.id || index}
                  sx={{
                    p: 1,
                    mb: 1,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor:
                      selectedStoreId === (item.store._id || item.store.id)
                        ? "primary.main"
                        : "divider",
                    bgcolor:
                      selectedStoreId === (item.store._id || item.store.id)
                        ? "action.hover"
                        : "background.paper",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSelectTechnician(item)}
                >
                  <Typography variant="body2">
                    {index + 1}. {item.store.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.distance.toFixed(2)} km away
                  </Typography>
                </Box>
              ))}
            </>
          )}
        </Box>
      </Box>
      {showFloatingCard && (
        <Card
          sx={{
            position: "absolute",
            top: "60%",
            left: "10%",
            transform: "translateX(-50%)",
            cursor: "move",
            minWidth: 340,
            maxWidth: 420,
            zIndex: 1400,
            boxShadow: 12,
            borderRadius: 3,
            bgcolor: "white",
            border: "1px solid",
            borderColor: "divider",
            // Glassmorphism effect
            backdropFilter: "blur(12px)",
            background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          <Box sx={{ px: 3, pt: 2, pb: 1 }}>
            {/* Header with gradient icon */}
            <Box
              sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1.5 }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor:
                    "linear-gradient(135deg, primary.main 0%, primary.dark 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: 3,
                }}
              >
                <MyLocationIcon sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  Route Summary
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Fastest route calculated
                </Typography>
              </Box>
              <Box sx={{ ml: "auto" }}>
                <IconButton
                  size="small"
                  sx={{ color: "text.secondary" }}
                  onClick={() => setShowFloatingCard(false)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Distance - Large prominent */}
            <Box sx={{ textAlign: "center", mb: 2.5 }}>
              <Typography
                variant="h4"
                fontWeight={800}
                color="primary.main"
                sx={{ lineHeight: 1.1 }}
              >
                {routeMatrix
                  ? metersToKilometers(routeMatrix.properties.summary.distance)
                  : "0"}
                <Typography
                  component="span"
                  variant="h6"
                  color="text.secondary"
                >
                  km
                </Typography>
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                Distance
              </Typography>
            </Box>

            {/* Duration - Secondary info */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                p: 1.5,
                bgcolor: "action.hover",
                borderRadius: 2,
              }}
            >
              <AccessTimeIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {routeMatrix
                    ? secondsToHoursMinutes(
                        routeMatrix.properties.summary.duration
                      )
                    : "0"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Estimated time
                </Typography>
              </Box>
            </Box>

            {/* Optional: Action button */}
            <Button
              fullWidth
              variant="outlined"
              size="small"
              sx={{
                mt: 2,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              View Full Directions
            </Button>
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default MapPage;
