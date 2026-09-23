// Quran Tab Component: Surah List, Reader, and Audio Recitation Integration
import { SURAHS_DATA } from "../data/surahs.js";
import { getSurahDetails, quranAudio } from "../services/quranApi.js";
import { Storage } from "../services/storage.js";

const QURAN_API_BASE = "https://api.alquran.cloud/v1/surah";

export class QuranTab {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById("tab-quran");
    this.activeSurahNumber = null;
    this.currentSurahData = null;
    this.searchQuery = "";
    this.filterType = "all"; // all, Meccan, Medinan
    this.arabicFontSize = Storage.getSettings().arabicFontSize || 26;
    this.unsubscribeAudio = null;
  }

  render() {
    this.container.innerHTML = `
      <div id="quran-list-view" class="space-y-6">
        <!-- Quran Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
              <i data-lucide="book-open" class="w-6 h-6 text-emerald-600 dark:text-emerald-400"></i>
              The Noble Quran
            </h1>
            <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Read and listen to the Holy Quran with translations</p>
          </div>
          <div id="quran-last-read-card" class="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-3.5 px-4 flex items-center justify-between gap-4 shadow-md cursor-pointer hover:shadow-lg transition">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                <i data-lucide="bookmark-check" class="w-5 h-5"></i>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold text-emerald-300">Resume Reading</span>
                <p id="last-read-surah-title" class="text-sm font-bold text-white">Surah Al-Fatihah</p>
              </div>
            </div>
            <i data-lucide="chevron-right" class="w-4 h-4 text-emerald-300"></i>
          </div>
        </div>
        <!-- Search & Filter Controls -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
            <input id="quran-search-input" type="text" placeholder="Search Surah..." class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" value="${this.searchQuery}" />
          </div>
          <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button data-filter="all" class="filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold transition ${this.filterType === 'all' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}">All</button>
            <button data-filter="Meccan" class="filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold transition ${this.filterType === 'Meccan' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}">Meccan</button>
            <button data-filter="Medinan" class="filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold transition ${this.filterType === 'Medinan' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}">Medinan</button>
          </div>
        </div>
        <!-- Surahs Grid -->
        <div id="surahs-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"></div>
      </div>
      <!-- Surah Reader View -->
      <div id="quran-reader-view" class="hidden space-y-6">
        <div class="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <button id="reader-back-btn" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 transition">
            <i data-lucide="arrow-left" class="w-4 h-4"></i><span>All Surahs</span>
          </button>
          <div class="text-center truncate px-2">
            <h2 id="reader-surah-title" class="font-bold text-slate-800 dark:text-slate-100 text-base truncate">Surah</h2>
            <p id="reader-surah-subtitle" class="text-xs text-slate-500">Verses</p>
          </div>
          <button id="reader-play-surah-btn" class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm">
            <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i><span>Play Surah</span>
          </button>
        </div>
        <div id="reader-content-body" class="max-w-3xl mx-auto space-y-6 pb-24"></div>
      </div>
    `;
    this.renderSurahsList();
    this.updateLastReadCard();
    this.attachListEventListeners();
    if (window.lucide) window.lucide.createIcons();
  }

  updateLastReadCard() {
    const lastRead = Storage.getLastRead();
    const titleEl = document.getElementById("last-read-surah-title");
    if (titleEl && lastRead) {
      titleEl.textContent = lastRead.surahName;
    }
  }

  renderSurahsList() {
    const grid = document.getElementById("surahs-grid");
    if (!grid) return;
    let filtered = SURAHS_DATA;
    if (this.filterType !== "all") {
      filtered = filtered.filter(s => s.revelationType === this.filterType);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s => s.englishName.toLowerCase().includes(q) || s.number.toString() === q);
    }
    grid.innerHTML = filtered.map(s => `
      <div data-surah="${s.number}" class="surah-card p-4 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer hover:border-emerald-500 transition-all">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold text-sm flex items-center justify-center">${s.number}</div>
          <div>
            <h3 class="text-sm font-bold">${s.englishName}</h3>
            <p class="text-[11px] text-slate-400">${s.numberOfAyahs} Ayahs</p>
          </div>
        </div>
        <div class="font-arabic text-lg font-bold text-emerald-800 dark:text-emerald-400">${s.name}</div>
      </div>
    `).join("");
    grid.querySelectorAll("[data-surah]").forEach(card => {
      card.addEventListener("click", () => {
        this.openSurah(parseInt(card.getAttribute("data-surah"), 10));
      });
    });
  }

  async openSurah(surahNumber) {
    this.activeSurahNumber = surahNumber;
    const listView = document.getElementById("quran-list-view");
    const readerView = document.getElementById("quran-reader-view");
    const body = document.getElementById("reader-content-body");
    if (listView) listView.classList.add("hidden");
    if (readerView) readerView.classList.remove("hidden");
    if (body) body.innerHTML = `<div class="text-center py-12 text-sm text-slate-400">Loading Malayalam Translation...</div>`;

    try {
      // Fixed API endpoints using the official api.alquran.cloud/v1/surah base URL
      const urlArabic   = `${QURAN_API_BASE}/${surahNumber}`;
      const urlEnglish  = `${QURAN_API_BASE}/${surahNumber}/en.asad`;
      const urlMalayalam = `${QURAN_API_BASE}/${surahNumber}/ml.abdulhameed`;

      const [arRes, enRes, mlRes] = await Promise.all([
        fetch(urlArabic),
        fetch(urlEnglish),
        fetch(urlMalayalam),
      ]);

      if (!arRes.ok || !enRes.ok || !mlRes.ok) {
        throw new Error(`API error — Arabic: ${arRes.status}, English: ${enRes.status}, Malayalam: ${mlRes.status}`);
      }

      const arData = await arRes.json();
      const enData = await enRes.json();
      const mlData = await mlRes.json();

      const surah   = arData.data;
      const enAyahs = enData.data && Array.isArray(enData.data.ayahs) ? enData.data.ayahs : [];
      const mlAyahs = mlData.data && Array.isArray(mlData.data.ayahs) ? mlData.data.ayahs : [];

      const titleEl    = document.getElementById("reader-surah-title");
      const subtitleEl = document.getElementById("reader-surah-subtitle");
      if (titleEl)    titleEl.textContent    = surah.englishName;
      if (subtitleEl) subtitleEl.textContent = `${surah.numberOfAyahs} Verses`;

      if (body) {
        body.innerHTML = surah.ayahs.map((ayah, index) => {
          // Safe index-based lookup — guards against edition arrays being shorter
          const mlText = (mlAyahs[index] && mlAyahs[index].text) ? mlAyahs[index].text : "";
          const enText = (enAyahs[index] && enAyahs[index].text) ? enAyahs[index].text : "";
          return `
          <div class="p-5 bg-white dark:bg-slate-800/50 rounded-2xl border dark:border-slate-700/60 space-y-4">
            <div class="flex items-center justify-between text-xs text-slate-400">
              <span>${surah.number}:${ayah.numberInSurah}</span>
              <button class="bookmark-btn p-1.5 hover:text-emerald-600 transition" data-ayah="${ayah.number}">
                <i data-lucide="bookmark" class="w-4 h-4"></i>
              </button>
            </div>
            <p class="font-arabic text-right leading-loose text-slate-800 dark:text-slate-100" style="font-size: ${this.arabicFontSize}px">
              ${ayah.text}
            </p>
            <p class="text-xs md:text-sm text-emerald-700 dark:text-emerald-400 font-medium">
              ${mlText}
            </p>
            <p class="text-[11px] md:text-xs text-slate-400 dark:text-slate-500 italic">
              ${enText}
            </p>
          </div>`;
        }).join("");

        if (window.lucide) window.lucide.createIcons();
      }

      Storage.saveLastRead({ surahNumber, surahName: surah.englishName });
      this.updateLastReadCard();

    } catch (error) {
      console.error("openSurah error:", error);
      if (body) body.innerHTML = `<div class="text-center py-12 text-sm text-red-500 font-medium">Failed to load translation. Please check your connection.</div>`;
    }
  }

  attachListEventListeners() {
    // Search input
    const searchInput = document.getElementById("quran-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        this.renderSurahsList();
      });
    }

    // Filter pills
    document.querySelectorAll(".filter-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        this.filterType = btn.getAttribute("data-filter");
        this.render();
      });
    });

    // Resume Reading card
    const lastReadCard = document.getElementById("quran-last-read-card");
    if (lastReadCard) {
      lastReadCard.addEventListener("click", () => {
        const lastRead = Storage.getLastRead();
        if (lastRead && lastRead.surahNumber) {
          this.openSurah(lastRead.surahNumber);
        }
      });
    }

    // Back button in reader view
    const backBtn = document.getElementById("reader-back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        const listView  = document.getElementById("quran-list-view");
        const readerView = document.getElementById("quran-reader-view");
        if (readerView) readerView.classList.add("hidden");
        if (listView)   listView.classList.remove("hidden");
      });
    }
  }
}