// Home Dashboard Component
import { fetchPrayerTimes, getPrayerTimeline } from "../services/prayerTimes.js";
import { getDailyInspiration } from "../data/daily_content.js";
import { Storage } from "../services/storage.js";

export class HomeTab {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById("tab-home");
    this.countdownTimer = null;
    this.inspirationType = "verse"; // "verse" | "hadith"
    this.currentTimings = null;
  }

  async render() {
    const loc = Storage.getLocation();
    const lastRead = Storage.getLastRead();
    const { verse, hadith } = getDailyInspiration();

    const todayGregorian = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    this.container.innerHTML = `
      <!-- Header Banner with Islamic Greeting -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white p-6 md:p-8 shadow-xl border border-emerald-700/40">
        <div class="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none"></div>
        <div class="absolute top-0 right-0 p-4 opacity-15 pointer-events-none">
          <svg class="w-36 h-36" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 L58 35 L93 25 L68 50 L93 75 L58 65 L50 100 L42 65 L7 75 L32 50 L7 25 L42 35 Z" opacity="0.3"/>
          </svg>
        </div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 text-emerald-200 text-sm font-medium">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span id="home-hijri-date">Loading Hijri Date...</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-bold mt-1 text-white font-display">
              As-Salamu Alaykum
            </h1>
            <p class="text-emerald-200/80 text-sm mt-0.5">${todayGregorian}</p>
          </div>

          <!-- Location Selector Badge -->
          <div class="flex items-center gap-2">
            <button id="home-change-loc-btn" class="flex items-center gap-2 bg-emerald-700/50 hover:bg-emerald-700/80 transition-colors backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-semibold border border-emerald-600/40 text-emerald-100 shadow-sm">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-amber-400"></i>
              <span id="home-loc-name">${loc.cityName || "Detecting Location..."}</span>
              <i data-lucide="chevron-down" class="w-3 h-3 text-emerald-300"></i>
            </button>
            <button id="home-refresh-gps-btn" title="Detect GPS Location" class="p-2 bg-emerald-700/40 hover:bg-emerald-700/80 text-emerald-200 hover:text-white rounded-xl transition border border-emerald-600/40">
              <i data-lucide="crosshair" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- Next Prayer Countdown Hero Card -->
        <div id="home-countdown-hero" class="mt-6 pt-5 border-t border-emerald-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <i data-lucide="clock" class="w-6 h-6"></i>
            </div>
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-amber-300">Next Prayer</span>
              <div class="flex items-baseline gap-2">
                <span id="next-prayer-name" class="text-2xl font-extrabold text-white">Loading...</span>
                <span id="next-prayer-time" class="text-sm font-medium text-emerald-200">--:--</span>
              </div>
            </div>
          </div>

          <!-- Countdown Digits -->
          <div class="flex items-center gap-2">
            <div class="bg-black/30 backdrop-blur-sm border border-emerald-600/30 rounded-xl px-3 py-1.5 text-center min-w-[54px]">
              <span id="cd-hours" class="block text-lg font-bold text-amber-300 leading-none">00</span>
              <span class="text-[10px] text-emerald-300/70 font-medium">HRS</span>
            </div>
            <span class="text-amber-400 font-bold">:</span>
            <div class="bg-black/30 backdrop-blur-sm border border-emerald-600/30 rounded-xl px-3 py-1.5 text-center min-w-[54px]">
              <span id="cd-mins" class="block text-lg font-bold text-amber-300 leading-none">00</span>
              <span class="text-[10px] text-emerald-300/70 font-medium">MIN</span>
            </div>
            <span class="text-amber-400 font-bold">:</span>
            <div class="bg-black/30 backdrop-blur-sm border border-emerald-600/30 rounded-xl px-3 py-1.5 text-center min-w-[54px]">
              <span id="cd-secs" class="block text-lg font-bold text-amber-300 leading-none">00</span>
              <span class="text-[10px] text-emerald-300/70 font-medium">SEC</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 5 Daily Prayer Cards Grid -->
      <div class="mt-6">
        <div class="flex items-center justify-between mb-3 px-1">
          <h2 class="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <i data-lucide="sun-medium" class="w-4 h-4 text-emerald-600 dark:text-emerald-400"></i>
            Daily Prayer Times
          </h2>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Standard / ISNA</span>
        </div>

        <div id="prayer-cards-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          ${["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"].map(p => `
            <div id="card-prayer-${p.toLowerCase()}" class="prayer-card bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">${p}</span>
                <span class="prayer-icon-box text-emerald-600 dark:text-emerald-400">
                  <i data-lucide="${this.getPrayerIcon(p)}" class="w-4 h-4"></i>
                </span>
              </div>
              <div class="mt-2">
                <span id="time-${p.toLowerCase()}" class="text-lg font-bold text-slate-800 dark:text-slate-100">--:--</span>
              </div>
              <div id="status-${p.toLowerCase()}" class="mt-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                Upcoming
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Quick Access Cards Carousel/Grid -->
      <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button id="home-quick-tasbeeh" class="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl p-4 text-left transition group">
          <div class="w-10 h-10 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <i data-lucide="circle-dot" class="w-5 h-5"></i>
          </div>
          <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm mt-3">Tasbeeh Counter</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Track daily Adhkar</p>
        </button>

        <button id="home-quick-qibla" class="bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-4 text-left transition group">
          <div class="w-10 h-10 rounded-xl bg-amber-600/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <i data-lucide="compass" class="w-5 h-5"></i>
          </div>
          <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm mt-3">Qibla Direction</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time compass</p>
        </button>

        <button id="home-quick-quran" class="bg-gradient-to-br from-teal-500/10 to-teal-600/5 dark:from-teal-950/40 dark:to-teal-900/20 border border-teal-500/20 hover:border-teal-500/40 rounded-2xl p-4 text-left transition group">
          <div class="w-10 h-10 rounded-xl bg-teal-600/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <i data-lucide="book-open" class="w-5 h-5"></i>
          </div>
          <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm mt-3">Read Quran</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${lastRead ? `Resume ${lastRead.surahName}` : "114 Surahs"}</p>
        </button>

        <button id="home-quick-masjid" class="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 dark:from-cyan-950/40 dark:to-cyan-900/20 border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl p-4 text-left transition group">
          <div class="w-10 h-10 rounded-xl bg-cyan-600/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <i data-lucide="map-pin" class="w-5 h-5"></i>
          </div>
          <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm mt-3">Find Masjids</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Navigate nearby</p>
        </button>
      </div>

      <!-- Daily Inspiration Section (Daily Verse / Hadith) -->
      <div class="mt-6">
        <div class="bg-white dark:bg-slate-800/95 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-md relative overflow-hidden">
          <!-- Card Header & Toggle -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl">
              <button id="btn-toggle-verse" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${this.inspirationType === "verse" ? "bg-emerald-700 text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:text-emerald-600"}">
                Daily Verse
              </button>
              <button id="btn-toggle-hadith" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${this.inspirationType === "hadith" ? "bg-emerald-700 text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:text-emerald-600"}">
                Daily Hadith
              </button>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-2">
              <button id="btn-copy-inspiration" title="Copy to clipboard" class="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <i data-lucide="copy" class="w-4 h-4"></i>
              </button>
              <button id="btn-share-inspiration" title="Share inspiration" class="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <i data-lucide="share-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <!-- Dynamic Inspiration Content -->
          <div id="inspiration-card-content" class="text-center py-2">
            <!-- Populated dynamically -->
          </div>
        </div>
      </div>
    `;

    // Render icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    this.renderInspirationContent();
    this.attachEventListeners();
    await this.loadPrayerTimes();
  }

  getPrayerIcon(name) {
    switch (name) {
      case "Fajr": return "sunrise";
      case "Sunrise": return "sun";
      case "Dhuhr": return "sun-medium";
      case "Asr": return "cloud-sun";
      case "Maghrib": return "sunset";
      case "Isha": return "moon";
      default: return "clock";
    }
  }

  renderInspirationContent() {
    const { verse, hadith } = getDailyInspiration();
    const isVerse = this.inspirationType === "verse";
    const item = isVerse ? verse : hadith;

    const contentDiv = document.getElementById("inspiration-card-content");
    if (!contentDiv) return;

    contentDiv.innerHTML = `
      <div class="max-w-2xl mx-auto space-y-4">
        <!-- Arabic script -->
        <p class="font-arabic text-2xl md:text-3xl text-emerald-950 dark:text-emerald-100 leading-loose py-2 select-text" dir="rtl">
          ${item.arabic}
        </p>

        <!-- Transliteration -->
        <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 italic font-medium">
          "${item.transliteration}"
        </p>

        <!-- Translation -->
        <p class="text-sm md:text-base text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
          "${item.translation}"
        </p>

        <!-- Reference Citation Badge -->
        <div class="pt-2 flex items-center justify-center">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <i data-lucide="bookmark" class="w-3 h-3"></i>
            ${item.reference}
          </span>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  async loadPrayerTimes() {
    const loc = Storage.getLocation();
    try {
      const data = await fetchPrayerTimes(loc.lat, loc.lng);
      this.currentTimings = data.timings;

      // Update Hijri Date text
      const hijriEl = document.getElementById("home-hijri-date");
      if (hijriEl && data.hijriDate) {
        hijriEl.textContent = `${data.hijriDate.day} ${data.hijriDate.monthEn} ${data.hijriDate.year} ${data.hijriDate.designation}`;
      }

      // Update 5 prayer times
      const names = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
      names.forEach(p => {
        const key = p.charAt(0).toUpperCase() + p.slice(1);
        const timeEl = document.getElementById(`time-${p}`);
        if (timeEl && data.timings[key]) {
          timeEl.textContent = data.timings[key];
        }
      });

      this.startCountdown();
    } catch (err) {
      console.warn("Could not load prayer times:", err);
    }
  }

  startCountdown() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);

    const tick = () => {
      if (!this.currentTimings || !this.currentTimings.rawTimes) return;
      const timeline = getPrayerTimeline(this.currentTimings.rawTimes);
      if (!timeline) return;

      const nextNameEl = document.getElementById("next-prayer-name");
      const nextTimeEl = document.getElementById("next-prayer-time");
      const hEl = document.getElementById("cd-hours");
      const mEl = document.getElementById("cd-mins");
      const sEl = document.getElementById("cd-secs");

      if (nextNameEl) nextNameEl.textContent = timeline.next;
      if (nextTimeEl) nextTimeEl.textContent = this.currentTimings[timeline.next] || timeline.nextTime;

      if (hEl) hEl.textContent = timeline.countdown.hours.toString().padStart(2, "0");
      if (mEl) mEl.textContent = timeline.countdown.minutes.toString().padStart(2, "0");
      if (sEl) sEl.textContent = timeline.countdown.seconds.toString().padStart(2, "0");

      // Highlight active card
      ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"].forEach(p => {
        const card = document.getElementById(`card-prayer-${p}`);
        const status = document.getElementById(`status-${p}`);
        const pCapital = p.charAt(0).toUpperCase() + p.slice(1);

        if (card && status) {
          if (pCapital === timeline.current) {
            card.classList.add("ring-2", "ring-emerald-500", "bg-emerald-50/50", "dark:bg-emerald-950/30");
            status.textContent = "Active Now";
            status.className = "mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400";
          } else if (pCapital === timeline.next) {
            card.classList.remove("ring-2", "ring-emerald-500", "bg-emerald-50/50", "dark:bg-emerald-950/30");
            card.classList.add("border-amber-400/80");
            status.textContent = "Next Prayer";
            status.className = "mt-1 text-[11px] font-bold text-amber-500 dark:text-amber-400";
          } else {
            card.classList.remove("ring-2", "ring-emerald-500", "bg-emerald-50/50", "dark:bg-emerald-950/30", "border-amber-400/80");
            status.textContent = "Completed";
            status.className = "mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500";
          }
        }
      });
    };

    tick();
    this.countdownTimer = setInterval(tick, 1000);
  }

  attachEventListeners() {
    // Toggle verse / hadith
    const verseBtn = document.getElementById("btn-toggle-verse");
    const hadithBtn = document.getElementById("btn-toggle-hadith");
    if (verseBtn && hadithBtn) {
      verseBtn.onclick = () => {
        this.inspirationType = "verse";
        verseBtn.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition bg-emerald-700 text-white shadow-sm";
        hadithBtn.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:text-emerald-600";
        this.renderInspirationContent();
      };
      hadithBtn.onclick = () => {
        this.inspirationType = "hadith";
        hadithBtn.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition bg-emerald-700 text-white shadow-sm";
        verseBtn.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:text-emerald-600";
        this.renderInspirationContent();
      };
    }

    // Copy inspiration
    const copyBtn = document.getElementById("btn-copy-inspiration");
    if (copyBtn) {
      copyBtn.onclick = () => {
        const { verse, hadith } = getDailyInspiration();
        const item = this.inspirationType === "verse" ? verse : hadith;
        const textToCopy = `${item.arabic}\n\n"${item.translation}"\n- ${item.reference}\n(Shared via Ibadah Daily)`;
        navigator.clipboard.writeText(textToCopy).then(() => {
          this.app.showToast("Copied to clipboard!");
        });
      };
    }

    // Share inspiration
    const shareBtn = document.getElementById("btn-share-inspiration");
    if (shareBtn) {
      shareBtn.onclick = () => {
        const { verse, hadith } = getDailyInspiration();
        const item = this.inspirationType === "verse" ? verse : hadith;
        if (navigator.share) {
          navigator.share({
            title: "Ibadah Daily Inspiration",
            text: `${item.arabic}\n\n"${item.translation}"\n- ${item.reference}`
          }).catch(() => {});
        } else {
          navigator.clipboard.writeText(`${item.arabic}\n"${item.translation}" - ${item.reference}`);
          this.app.showToast("Copied to clipboard!");
        }
      };
    }

    // Quick Action cards navigation
    document.getElementById("home-quick-tasbeeh")?.addEventListener("click", () => this.app.switchTab("tasbeeh"));
    document.getElementById("home-quick-qibla")?.addEventListener("click", () => this.app.switchTab("qibla"));
    document.getElementById("home-quick-quran")?.addEventListener("click", () => this.app.switchTab("quran"));
    document.getElementById("home-quick-masjid")?.addEventListener("click", () => this.app.switchTab("masjid"));

    // Location selector button
    document.getElementById("home-change-loc-btn")?.addEventListener("click", () => {
      this.app.openLocationModal();
    });

    // Refresh GPS button
    document.getElementById("home-refresh-gps-btn")?.addEventListener("click", () => {
      this.app.detectUserLocation();
    });
  }

  destroy() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
}
