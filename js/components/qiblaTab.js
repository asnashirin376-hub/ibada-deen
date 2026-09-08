// Qibla Finder Component
// Real-time compass pointing to Mecca using location & DeviceOrientation sensors
import { calculateQiblaDirection, calculateDistanceToMecca } from "../services/prayerTimes.js";
import { Storage } from "../services/storage.js";
import { sounds } from "../services/soundEffects.js";

export class QiblaTab {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById("tab-qibla");
    this.qiblaAngle = 0; // Angle from North to Kaaba
    this.currentHeading = 0; // Device compass heading
    this.hasSensor = false;
    this.isAligned = false;
    this.orientationHandler = null;
    this.manualHeading = 0;
  }

  render() {
    const loc = Storage.getLocation();
    this.qiblaAngle = Math.round(calculateQiblaDirection(loc.lat, loc.lng));
    const distanceKm = calculateDistanceToMecca(loc.lat, loc.lng);

    this.container.innerHTML = `
      <div class="space-y-6 max-w-xl mx-auto pb-12">
        <!-- Top Title & Location Info -->
        <div class="text-center space-y-2">
          <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
            <i data-lucide="compass" class="w-6 h-6 text-amber-500"></i>
            Qibla Finder
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Real-time compass pointing directly towards the Holy Kaaba in Makkah
          </p>

          <!-- Current Location & Mecca Distance Badge -->
          <div class="flex items-center justify-center gap-3 pt-1">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
              ${loc.cityName}
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
              <i data-lucide="navigation" class="w-3.5 h-3.5"></i>
              ${distanceKm.toLocaleString()} km to Kaaba
            </span>
          </div>
        </div>

        <!-- Compass Main Stage -->
        <div class="bg-white dark:bg-slate-800/90 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-md relative overflow-hidden flex flex-col items-center justify-center">
          <!-- Alignment Status Pill -->
          <div id="qibla-alignment-badge" class="mb-6 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-slate-400"></span>
            <span id="qibla-status-text">Rotate device to align with Qibla</span>
          </div>

          <!-- Compass Visual Dial Container -->
          <div class="relative w-72 h-72 md:w-80 md:h-80 select-none">
            <!-- Outer Ring with Degree Markings -->
            <div id="compass-dial" class="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-inner flex items-center justify-center transition-transform duration-100 ease-out">
              <!-- Cardinal Points -->
              <span class="absolute top-2.5 font-bold text-xs text-red-500">N</span>
              <span class="absolute right-3.5 font-bold text-xs text-slate-400">E</span>
              <span class="absolute bottom-2.5 font-bold text-xs text-slate-400">S</span>
              <span class="absolute left-3.5 font-bold text-xs text-slate-400">W</span>

              <!-- Compass Tick marks around circle -->
              <div class="absolute inset-6 rounded-full border border-dashed border-slate-300 dark:border-slate-600/60"></div>

              <!-- Kaaba Direction Pointer on Dial -->
              <div
                id="kaaba-marker"
                class="absolute w-full h-full pointer-events-none flex flex-col items-center justify-start pt-1"
                style="transform: rotate(${this.qiblaAngle}deg);"
              >
                <div class="flex flex-col items-center -translate-y-2">
                  <div class="w-6 h-6 rounded-md bg-black border-2 border-amber-400 shadow-lg flex items-center justify-center text-[10px] text-amber-400 font-black">
                    🕋
                  </div>
                  <span class="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tighter">Kaaba</span>
                </div>
              </div>
            </div>

            <!-- Central Needle / Arrow pointing towards Qibla -->
            <div id="compass-needle-container" class="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-150 ease-out">
              <!-- Needle Pointer -->
              <div class="relative w-8 h-48 flex flex-col items-center justify-between">
                <!-- Golden Needle Top Point -->
                <div class="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[90px] border-b-amber-500 drop-shadow-md"></div>
                <!-- Needle Pivot Center -->
                <div class="w-6 h-6 rounded-full bg-slate-900 dark:bg-white border-4 border-amber-400 shadow-md z-10"></div>
                <!-- Needle Bottom Tail -->
                <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[70px] border-t-slate-400 dark:border-t-slate-600"></div>
              </div>
            </div>
          </div>

          <!-- Bearing readout display -->
          <div class="mt-6 text-center space-y-1">
            <div class="flex items-baseline justify-center gap-1">
              <span id="qibla-bearing-val" class="text-4xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
                ${this.qiblaAngle}°
              </span>
              <span class="text-xs font-bold text-amber-500 uppercase">${this.getCompassDirection(this.qiblaAngle)}</span>
            </div>
            <p class="text-xs text-slate-400">Qibla direction from True North</p>
          </div>

          <!-- Sensor / Simulation fallback banner -->
          <div class="mt-6 w-full pt-4 border-t border-slate-100 dark:border-slate-700/60">
            <div id="sensor-permission-box" class="space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-slate-600 dark:text-slate-400">Device Sensor Status:</span>
                <span id="sensor-status-label" class="font-bold text-amber-600">Checking...</span>
              </div>
              <button id="btn-request-sensor" class="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm">
                Enable Compass Sensors (Mobile)
              </button>

              <!-- Manual Orientation Slider for Desktop / Testing -->
              <div class="pt-2 space-y-1">
                <div class="flex justify-between text-[11px] text-slate-400">
                  <span>Simulate Device Rotation:</span>
                  <span id="manual-heading-label">0°</span>
                </div>
                <input id="slider-manual-heading" type="range" min="0" max="360" value="0" class="w-full accent-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        <!-- Calibration Tip Card -->
        <div class="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-2xl p-4 flex items-start gap-3">
          <i data-lucide="info" class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"></i>
          <div class="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
            <strong class="font-bold">Compass Calibration Tip:</strong> Hold your phone flat horizontally like a real compass. If the needle seems inaccurate, move the phone in a slow <strong>figure-8</strong> motion to recalibrate magnetic sensors away from metal cases or magnets.
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.initOrientationSensors();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  getCompassDirection(deg) {
    const cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const idx = Math.round(deg / 22.5) % 16;
    return cardinals[idx];
  }

  updateCompassUI(deviceHeading) {
    this.currentHeading = deviceHeading;
    const dial = document.getElementById("compass-dial");
    const needleContainer = document.getElementById("compass-needle-container");
    const badge = document.getElementById("qibla-alignment-badge");
    const statusText = document.getElementById("qibla-status-text");

    if (!dial || !needleContainer) return;

    // Rotate compass dial with device heading so North aligns with physical North
    dial.style.transform = `rotate(${-deviceHeading}deg)`;

    // Calculate angle difference between heading and Qibla angle
    // Needle should point directly to Kaaba relative to the phone's top
    const relativeQibla = (this.qiblaAngle - deviceHeading + 360) % 360;
    needleContainer.style.transform = `rotate(${relativeQibla}deg)`;

    // Check alignment within ±4 degrees
    const diff = Math.min(relativeQibla, 360 - relativeQibla);
    const isNowAligned = diff <= 4;

    if (isNowAligned) {
      if (!this.isAligned) {
        sounds.vibrate(50);
        this.isAligned = true;
      }
      badge.className = "mb-6 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 bg-amber-400 text-emerald-950 border border-amber-300 shadow-lg shadow-amber-400/20 ring-4 ring-amber-400/30 flex items-center gap-2 animate-pulse";
      statusText.innerHTML = `✨ You are facing Mecca (${this.qiblaAngle}°)`;
    } else {
      this.isAligned = false;
      badge.className = "mb-6 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 flex items-center gap-2";
      const turnDir = relativeQibla > 180 ? "Turn Left" : "Turn Right";
      statusText.textContent = `${turnDir} (Off by ${Math.round(diff)}°)`;
    }
  }

  initOrientationSensors() {
    const statusLabel = document.getElementById("sensor-status-label");

    if (window.DeviceOrientationEvent) {
      this.orientationHandler = (event) => {
        let heading = null;

        // iOS webkitCompassHeading is accurate relative to magnetic North
        if (event.webkitCompassHeading !== undefined) {
          heading = event.webkitCompassHeading;
          this.hasSensor = true;
        } else if (event.alpha !== null) {
          // Android deviceorientation absolute or standard
          heading = 360 - event.alpha;
          this.hasSensor = true;
        }

        if (heading !== null) {
          if (statusLabel) {
            statusLabel.textContent = "Active (Compass Connected)";
            statusLabel.className = "font-bold text-emerald-600";
          }
          this.updateCompassUI(heading);
        }
      };

      window.addEventListener("deviceorientation", this.orientationHandler, true);
    } else {
      if (statusLabel) {
        statusLabel.textContent = "Sensor not detected (Use Slider)";
        statusLabel.className = "font-bold text-slate-500";
      }
    }
  }

  attachEventListeners() {
    // Request permission on iOS 13+
    const reqBtn = document.getElementById("btn-request-sensor");
    if (reqBtn) {
      reqBtn.addEventListener("click", () => {
        if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
          DeviceOrientationEvent.requestPermission()
            .then(response => {
              if (response === "granted") {
                window.addEventListener("deviceorientation", this.orientationHandler, true);
                this.app.showToast("Sensors enabled!");
              } else {
                this.app.showToast("Sensor permission denied");
              }
            })
            .catch(console.error);
        } else {
          this.app.showToast("Sensor API active");
        }
      });
    }

    // Manual slider for testing or desktop
    const slider = document.getElementById("slider-manual-heading");
    const sliderLabel = document.getElementById("manual-heading-label");
    if (slider) {
      slider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        if (sliderLabel) sliderLabel.textContent = `${val}°`;
        this.updateCompassUI(val);
      });
    }
  }

  destroy() {
    if (this.orientationHandler) {
      window.removeEventListener("deviceorientation", this.orientationHandler, true);
      this.orientationHandler = null;
    }
  }
}
