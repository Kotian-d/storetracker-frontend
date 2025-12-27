// components/RoutingMachine.jsx
import L from "leaflet";
import "leaflet-routing-machine";
import "lrm-openrouteservice"; // extends L.Routing with OpenRouteService[web:56]
import { createControlComponent } from "@react-leaflet/core";

const createRoutingMachineLayer = ({ from, to, orsApiKey }) => {
  if (!from || !to) return null;

  const instance = L.Routing.control({
    waypoints: [
      L.latLng(from.lat, from.lon),
      L.latLng(to.lat, to.lon),
    ],
    router: new L.Routing.openrouteserviceV2(orsApiKey, {
      profile: "driving-car", // or cycling-regular, foot-walking, etc.[web:56][web:71]
      geometry_simplify: true,
    }),
    lineOptions: {
      styles: [{ color: "blue", weight: 5 }],
    },
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    show: false, // hide default directions panel, only show route line
  });

  return instance;
};

const RoutingMachine = createControlComponent(createRoutingMachineLayer);

export default RoutingMachine;
