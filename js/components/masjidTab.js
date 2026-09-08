// Masjid Locator Component
// Interactive Leaflet Map integration to find and navigate to nearest Masjids/Mosques
// Live GPS tracking via navigator.geolocation.watchPosition
import { searchNearbyMasjids, getDirectionsUrl } from "../services/mosqueFinder.js";
import { Storage } from "../services/storage.js";

export class MasjidTab {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById("tab-masjid");
    this.map = null;
    this.userMarker = null;
    this.mosqueMarkers = [];
    this.masjids = [];
    this.searchRadiusKm = 5;
    this.isLoading = false;
    // GPS tracking state
    this.watchId = null;
    this.gpsLat = null;
    this.gpsLng = null;
    this.gpsAccuracy = null;
    this.accuracyCircle = null;
    this.isGpsActive = false;
  }
