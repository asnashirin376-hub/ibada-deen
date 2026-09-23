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

  // app.js ആവശ്യപ്പെടുന്ന പ്രധാന റെൻഡർ ഫങ്ക്ഷൻ
  render() {
    // മാപ്പ് കണ്ടെയ്നർ ഉണ്ടെന്ന് ഉറപ്പാക്കാനും അതിന് കൃത്യമായ ഉയരം നൽകാനും
    if (this.container) {
      this.container.innerHTML = `
        <div class="space-y-4 max-w-4xl mx-auto pb-12">
          <div class="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between shadow-sm">
            <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <i data-lucide="map-pin" class="w-4 h-4 animate-bounce"></i> Live GPS Masjid Finder
            </span>
            <span id="gps-status" class="text-[11px] font-bold text-slate-500">Connecting GPS...</span>
          </div>
          <div id="masjid-map" style="height: 450px; width: 100%; min-height: 400px;" class="rounded-3xl shadow-md border border-slate-200 dark:border-slate-700/80 z-10"></div>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }

    // ആദ്യ തവണ മാപ്പ് ലോഡ് ചെയ്യാൻ വേണ്ടി
    if (!this.map) {
      setTimeout(() => {
        this.initMap();
        this.startLocationTracking();
      }, 100);
    }
  }

  // പഴയ app.js കോഡ് സപ്പോർട്ട് ചെയ്യാൻ വേണ്ടി തൽക്കാലം ഇതും വെക്കുന്നു
  init() {
    this.render();
  }

  // Leaflet Map സെറ്റ് ചെയ്യാനുള്ള ഫങ്ക്ഷൻ
  initMap() {
    if (this.map) return; 

    const mapDiv = document.getElementById("masjid-map");
    if (!mapDiv) return;

    // മാപ്പ് തുടക്കത്തിൽ കേരള ലൊക്കേഷനിൽ ലോഡ് ചെയ്യുന്നു (ലൊക്കേഷൻ കിട്ടുമ്പോൾ ഇത് മാറും)
    this.map = L.map('masjid-map').setView([10.8505, 76.2711], 13); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  // ബ്രൗസറിന്റെ ജി.പി.എസ് വഴി ലൈവ് ലൊക്കേഷൻ ട്രാക്ക് ചെയ്യുക
  startLocationTracking() {
    if (!navigator.geolocation) {
      alert("നിങ്ങളുടെ ബ്രൗസർ ജി.പി.എസ് ലൊക്കേഷൻ സപ്പോർട്ട് ചെയ്യുന്നില്ല.");
      return;
    }

    this.isLoading = true;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.gpsLat = position.coords.latitude;
        this.gpsLng = position.coords.longitude;
        this.gpsAccuracy = position.coords.accuracy;
        this.isGpsActive = true;
        this.isLoading = false;

        const statusEl = document.getElementById("gps-status");
        if (statusEl) statusEl.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">● GPS Active</span>`;

        this.updateUserLocationOnMap();
      },
      (error) => {
        console.error("Error tracking location: ", error);
        this.isLoading = false;
        const statusEl = document.getElementById("gps-status");
        if (statusEl) statusEl.innerHTML = `<span class="text-red-500">● GPS Error</span>`;
        
        if (error.code === error.PERMISSION_DENIED) {
          alert("മാപ്പിൽ ലൊക്കേഷൻ കാണിക്കാൻ ദയവായി ലൊക്കേഷൻ പെർമിഷൻ അനുവദിക്കുക.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );
  }

  // മാപ്പിന്റെ സെന്ററിലേക്ക് യൂസറുടെ ലൊക്കേഷൻ കൊണ്ടുവരാനും മാർക്കർ കാണിക്കാനും
  updateUserLocationOnMap() {
    if (!this.map || !this.gpsLat || !this.gpsLng) return;

    const userPos = [this.gpsLat, this.gpsLng];
    this.map.setView(userPos, 15);

    if (this.userMarker) this.map.removeLayer(this.userMarker);
    if (this.accuracyCircle) this.map.removeLayer(this.accuracyCircle);

    this.userMarker = L.marker(userPos, {
      title: "നിങ്ങളുടെ സ്ഥാനം"
    }).addTo(this.map).bindPopup("നിങ്ങൾ ഇപ്പോൾ ഇവിടെയാണ്").openPopup();

    this.accuracyCircle = L.circle(userPos, {
      radius: this.gpsAccuracy,
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.15
    }).addTo(this.map);

    this.fetchNearbyMosques();
  }

  // പള്ളികളുടെ ഡാറ്റ എടുക്കാൻ
  async fetchNearbyMosques() {
    try {
      this.masjids = await searchNearbyMasjids(this.gpsLat, this.gpsLng, this.searchRadiusKm);
      this.renderMosqueMarkers();
    } catch (err) {
      console.error("പള്ളികളുടെ വിവരങ്ങൾ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല:", err);
    }
  }

  // പള്ളികൾ മാപ്പിൽ മാർക്കർ ആയി കാണിക്കാൻ
  renderMosqueMarkers() {
    this.mosqueMarkers.forEach(marker => this.map.removeLayer(marker));
    this.mosqueMarkers = [];

    if (!this.masjids || this.masjids.length === 0) return;

    this.masjids.forEach(masjid => {
      const mosquePos = [masjid.lat, masjid.lng];
      const directionsUrl = getDirectionsUrl(this.gpsLat, this.gpsLng, masjid.lat, masjid.lng);

      const marker = L.marker(mosquePos)
        .addTo(this.map)
        .bindPopup(`
          <div class="p-1">
            <h6 class="font-bold text-slate-800 text-sm m-0">${masjid.name}</h6>
            <p class="text-xs text-slate-500 my-1">Distance: ${masjid.distanceKm} km</p>
            <a href="${directionsUrl}" target="_blank" class="inline-block mt-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition no-underline" style="color: white !important;">Navigate</a>
          </div>
        `);
      
      this.mosqueMarkers.push(marker);
    });
  }

  // ടാബ് മാറുമ്പോൾ ട്രാക്കിംഗ് നിർത്താൻ
  destroy() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isGpsActive = false;
    }
    this.map = null;
  }
}
