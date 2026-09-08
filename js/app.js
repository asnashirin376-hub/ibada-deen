// Main Application Coordinator & Navigation Controller for Ibadah Daily
import { Storage } from "./services/storage.js";
import { HomeTab } from "./components/homeTab.js";
import { QuranTab } from "./components/quranTab.js";
import { TasbeehTab } from "./components/tasbeehTab.js";
import { QiblaTab } from "./components/qiblaTab.js";
import { MasjidTab } from "./components/masjidTab.js";
import { quranAudio } from "./services/quranApi.js";
import { notificationService } from "./services/notifications.js";

// Popular Islamic and international cities for quick location switching
export const POPULAR_CITIES = [
  { name: "Makkah Al-Mukarramah", country: "Saudi Arabia", lat: 21.4225, lng: 39.8262 },
  { name: "Al-Madinah Al-Munawwarah", country: "Saudi Arabia", lat: 24.4672, lng: 39.6111 },
  { name: "Al-Quds (Jerusalem)", country: "Palestine", lat: 31.7767, lng: 35.2345 },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357 },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
  { name: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456 },
  { name: "Kuala Lumpur", country: "Malaysia", lat: 3.1390, lng: 101.6869 },
  { name: "Karachi", country: "Pakistan", lat: 24.8607, lng: 67.0011 },
  { name: "Dhaka", country: "Bangladesh", lat: 23.8103, lng: 90.4125 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { name: "New York", country: "United States", lat: 40.7128, lng: -74.0060 },
  { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 }
];

class IbadahDailyApp {
  constructor() {
    this.currentTab = "home";
    this.tabs = {};
    this.theme = Storage.getTheme();
  }

  init() {
    this.applyTheme(this.theme);
    this.initTabs();
    this.attachGlobalListeners();
    this.setupAudioPlayerBar();

    // Seed an initial history state and honour any existing hash on load
    const startTab = ["home","quran","tasbeeh","qibla","masjid"]
      .find(t => window.location.hash === `#${t}`) || "home";
    window.history.replaceState({ tab: startTab }, "", `#${startTab}`);
    this.switchTab(startTab, { pushState: false });

    // Setup notifications scheduler and dot
    this.updateNotificationStatus();
    notificationService.startScheduler(() => {
      return this.tabs.home ? this.tabs.home.currentTimings : null;
    });

    // Automatically detect location if first time
    const loc = Storage.getLocation();
    if (!loc.isAuto && "geolocation" in navigator) {
      this.detectUserLocation(false);
    }
  }

  initTabs() {
    this.tabs = {
      home: new HomeTab(this),
      quran: new QuranTab(this),
      tasbeeh: new TasbeehTab(this),
      qibla: new QiblaTab(this),
      masjid: new MasjidTab(this)
    };
  }

  switchTab(tabName, { pushState = true } = {}) {
    if (!this.tabs[tabName]) return;

    // Call destroy on previous tab if necessary
    if (this.tabs[this.currentTab] && typeof this.tabs[this.currentTab].destroy === "function") {
      this.tabs[this.currentTab].destroy();
    }

    this.currentTab = tabName;

    // Push a browser history entry so the hardware Back button works
    if (pushState) {
      window.history.pushState({ tab: tabName }, "", `#${tabName}`);
    }

    // Update bottom nav active styling
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      const t = btn.getAttribute("data-tab");
      const icon = btn.querySelector(".nav-icon");
      const label = btn.querySelector(".nav-label");

      if (t === tabName) {
        btn.classList.add("text-emerald-700", "dark:text-emerald-400");
        btn.classList.remove("text-slate-400", "dark:text-slate-500");
        if (label) label.classList.add("font-bold");
        btn.querySelector(".nav-indicator")?.classList.remove("opacity-0");
      } else {
        btn.classList.remove("text-emerald-700", "dark:text-emerald-400");
        btn.classList.add("text-slate-400", "dark:text-slate-500");
        if (label) label.classList.remove("font-bold");
        btn.querySelector(".nav-indicator")?.classList.add("opacity-0");
      }
    });

    // Hide all tab containers & show selected
    document.querySelectorAll(".tab-view-container").forEach(el => el.classList.add("hidden"));
    const activeEl = document.getElementById(`tab-${tabName}`);
    if (activeEl) {
      activeEl.classList.remove("hidden");
    }

    // Render tab content
    this.tabs[tabName].render();
    window.scrollTo({ top: 0, behavior: "instant" });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  applyTheme(theme) {
    this.theme = theme;
    Storage.setTheme(theme);
    const html = document.documentElement;

    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = theme === "dark"
        ? `<i data-lucide="sun" class="w-4 h-4 text-amber-400"></i>`
        : `<i data-lucide="moon" class="w-4 h-4 text-slate-600"></i>`;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  toggleTheme() {
    const next = this.theme === "dark" ? "light" : "dark";
    this.applyTheme(next);
  }

  detectUserLocation(showToast = true) {
    if (!("geolocation" in navigator)) {
      if (showToast) this.showToast("Geolocation is not supported by your browser");
      return;
    }

    if (showToast) this.showToast("Detecting GPS location...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let cityName = "Current Location";
        try {
          // Reverse geocoding via OpenStreetMap Nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
          if (res.ok) {
            const data = await res.json();
            cityName = (data.address && (data.address.city || data.address.town || data.address.county || data.address.state)) || "My Location";
          }
        } catch (e) {
          // Keep default
        }

        const newLoc = { lat, lng, cityName, isAuto: true };
        Storage.saveLocation(newLoc);

        if (showToast) this.showToast(`Location set to ${cityName}`);

        // Re-render current active tab to reflect new location
        this.tabs[this.currentTab].render();
      },
      (err) => {
        console.warn("Geolocation error:", err);
        if (showToast) this.showToast("Location access denied. Using Makkah as default.");
      },
      { timeout: 8000 }
    );
  }

  openLocationModal() {
    const modal = document.getElementById("modal-location-selector");
    const citiesList = document.getElementById("modal-popular-cities-list");
    if (!modal || !citiesList) return;

    citiesList.innerHTML = POPULAR_CITIES.map(c => `
      <button data-city-name="${c.name}" class="city-select-item w-full px-3.5 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center justify-between text-left transition border border-slate-100 dark:border-slate-800">
        <div>
          <span class="font-bold text-xs text-slate-800 dark:text-slate-100 block">${c.name}</span>
          <span class="text-[11px] text-slate-400">${c.country}</span>
        </div>
        <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-400"></i>
      </button>
    `).join("");

    citiesList.querySelectorAll(".city-select-item").forEach(item => {
      item.addEventListener("click", () => {
        const name = item.getAttribute("data-city-name");
        const found = POPULAR_CITIES.find(c => c.name === name);
        if (found) {
          Storage.saveLocation({
            lat: found.lat,
            lng: found.lng,
            cityName: found.name,
            country: found.country,
            isAuto: false
          });
          modal.classList.add("hidden");
          this.showToast(`Location updated to ${found.name}`);
          this.tabs[this.currentTab].render();
        }
      });
    });

    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  setupAudioPlayerBar() {
    const playerBar = document.getElementById("global-audio-bar");
    const playBtn = document.getElementById("audio-bar-play-toggle");
    const closeBtn = document.getElementById("audio-bar-close");
    const progressBar = document.getElementById("audio-bar-progress");

    playBtn?.addEventListener("click", () => {
      quranAudio.togglePlayPause();
    });

    closeBtn?.addEventListener("click", () => {
      quranAudio.stop();
      playerBar?.classList.add("translate-y-32");
    });

    progressBar?.addEventListener("input", (e) => {
      quranAudio.seek(parseFloat(e.target.value));
    });

    quranAudio.subscribe((state) => {
      if (!playerBar) return;

      if (state.currentSurah) {
        playerBar.classList.remove("translate-y-32");
        const titleEl = document.getElementById("audio-bar-title");
        const subEl = document.getElementById("audio-bar-subtitle");
        if (titleEl) titleEl.textContent = `Surah ${state.currentSurah.name || state.currentSurah.number}`;
        if (subEl) subEl.textContent = `Ayah ${state.currentAyah} • Reciter: Mishary Alafasy`;
      }

      if (playBtn) {
        playBtn.innerHTML = state.isPlaying
          ? `<i data-lucide="pause" class="w-4 h-4 fill-current"></i>`
          : `<i data-lucide="play" class="w-4 h-4 fill-current"></i>`;
        if (window.lucide) window.lucide.createIcons();
      }

      if (progressBar && state.duration > 0) {
        progressBar.value = (state.currentTime / state.duration) * 100;
      }
    });
  }

  showAudioPlayerBar(surahName, ayahNumber) {
    const playerBar = document.getElementById("global-audio-bar");
    playerBar?.classList.remove("translate-y-32");
    const titleEl = document.getElementById("audio-bar-title");
    const subEl = document.getElementById("audio-bar-subtitle");
    if (titleEl) titleEl.textContent = `Surah ${surahName}`;
    if (subEl) subEl.textContent = `Ayah ${ayahNumber} • Reciter: Mishary Alafasy`;
  }

  showToast(message) {
    const toast = document.getElementById("app-toast");
    const msgEl = document.getElementById("toast-message");
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    toast.classList.remove("translate-y-20", "opacity-0", "pointer-events-none");

    setTimeout(() => {
      toast.classList.add("translate-y-20", "opacity-0", "pointer-events-none");
    }, 3000);
  }

  updateNotificationStatus() {
    const settings = Storage.getNotificationSettings();
    const dot = document.getElementById("header-notif-dot");
    if (dot) {
      if (settings.enabled) {
        dot.classList.remove("hidden");
      } else {
        dot.classList.add("hidden");
      }
    }
  }

  openNotificationModal() {
    const modal = document.getElementById("modal-notification-settings");
    if (!modal) return;

    const settings = Storage.getNotificationSettings();
    const masterToggle = document.getElementById("toggle-master-notifications");
    const statusText = document.getElementById("notif-permission-status");

    if (masterToggle) masterToggle.checked = Boolean(settings.enabled);
    if (statusText) {
      const perm = notificationService.getPermission();
      if (perm === "granted") {
        statusText.textContent = "Notifications active and permitted";
        statusText.className = "text-[11px] text-emerald-600 dark:text-emerald-400 font-bold";
      } else if (perm === "denied") {
        statusText.textContent = "Blocked in browser settings";
        statusText.className = "text-[11px] text-red-500 font-bold";
      } else {
        statusText.textContent = "Click Save to allow browser alerts";
        statusText.className = "text-[11px] text-amber-600 font-bold";
      }
    }

    ["fajr", "dhuhr", "asr", "maghrib", "isha"].forEach(p => {
      const el = document.getElementById(`notif-${p}`);
      if (el) el.checked = Boolean(settings[p]);
    });

    const mDhikr = document.getElementById("notif-morning-dhikr");
    const eDhikr = document.getElementById("notif-evening-dhikr");
    const mTime = document.getElementById("notif-morning-time");
    const eTime = document.getElementById("notif-evening-time");

    if (mDhikr) mDhikr.checked = Boolean(settings.morningDhikr);
    if (eDhikr) eDhikr.checked = Boolean(settings.eveningDhikr);
    if (mTime) mTime.value = settings.morningTime || "06:30";
    if (eTime) eTime.value = settings.eveningTime || "17:30";

    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  attachGlobalListeners() {
    // ── Browser Back / Forward navigation ──────────────────────────────────
    window.addEventListener("popstate", (e) => {
      const tab = (e.state && e.state.tab) || "home";
      // Handle Quran in-reader back: if reader is open, close it first
      const readerView = document.getElementById("quran-reader-view");
      if (tab === "quran" && readerView && !readerView.classList.contains("hidden")) {
        readerView.classList.add("hidden");
        document.getElementById("quran-list-view")?.classList.remove("hidden");
        if (this.tabs.quran) this.tabs.quran.activeSurahNumber = null;
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      this.switchTab(tab, { pushState: false });
    });

    // Notification modal button
    document.getElementById("notification-modal-btn")?.addEventListener("click", () => {
      this.openNotificationModal();
    });

    document.getElementById("btn-close-notif-modal")?.addEventListener("click", () => {
      document.getElementById("modal-notification-settings")?.classList.add("hidden");
    });

    // Test Notification button
    document.getElementById("btn-test-notification")?.addEventListener("click", async () => {
      const perm = await notificationService.requestPermission();
      if (perm === "granted") {
        notificationService.sendNotification("🔔 Ibadah Daily Reminder Test", {
          body: "Your prayer and daily dhikr reminders are configured and working properly!",
          tag: "test_notification"
        });
        this.showToast("Test notification sent!");
      } else {
        this.showToast("Browser notification permission denied.");
      }
    });

    // Save Notifications button
    document.getElementById("btn-save-notifications")?.addEventListener("click", async () => {
      const masterToggle = document.getElementById("toggle-master-notifications");
      let isEnabled = masterToggle ? masterToggle.checked : false;

      if (isEnabled) {
        const perm = await notificationService.requestPermission();
        if (perm !== "granted") {
          this.showToast("Please allow notifications in your browser.");
        }
      }

      const settings = {
        enabled: isEnabled,
        fajr: Boolean(document.getElementById("notif-fajr")?.checked),
        dhuhr: Boolean(document.getElementById("notif-dhuhr")?.checked),
        asr: Boolean(document.getElementById("notif-asr")?.checked),
        maghrib: Boolean(document.getElementById("notif-maghrib")?.checked),
        isha: Boolean(document.getElementById("notif-isha")?.checked),
        morningDhikr: Boolean(document.getElementById("notif-morning-dhikr")?.checked),
        eveningDhikr: Boolean(document.getElementById("notif-evening-dhikr")?.checked),
        morningTime: document.getElementById("notif-morning-time")?.value || "06:30",
        eveningTime: document.getElementById("notif-evening-time")?.value || "17:30"
      };

      Storage.saveNotificationSettings(settings);
      this.updateNotificationStatus();
      document.getElementById("modal-notification-settings")?.classList.add("hidden");
      this.showToast("Notification reminder settings saved!");
    });

    // Theme toggle button
    document.getElementById("theme-toggle-btn")?.addEventListener("click", () => {
      this.toggleTheme();
    });

    // Navigation tab buttons (Bottom Nav)
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        this.switchTab(tab);
      });
    });

    // Close location modal
    document.getElementById("btn-close-loc-modal")?.addEventListener("click", () => {
      document.getElementById("modal-location-selector")?.classList.add("hidden");
    });
    document.getElementById("btn-loc-detect-gps")?.addEventListener("click", () => {
      document.getElementById("modal-location-selector")?.classList.add("hidden");
      this.detectUserLocation();
    });
  }
}

// Instantiate and start app on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new IbadahDailyApp();
  window.ibadahApp = app;
  app.init();
});
