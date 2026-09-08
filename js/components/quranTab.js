// Quran Tab Component: Surah List, Reader, and Audio Recitation Integration
import { SURAHS_DATA } from "../data/surahs.js";
import { getSurahDetails, quranAudio } from "../services/quranApi.js";
import { Storage } from "../services/storage.js";

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

          <!-- Last Read Quick Card -->
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
          <!-- Search input -->
          <div class="relative flex-1">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
            <input
              id="quran-search-input"
              type="text"
              placeholder="Search by Surah name or number (e.g. Yasin, 36, Al-Mulk)..."
              class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              value="${this.searchQuery}"
            />
          </div>

          <!-- Filter Pills -->
          <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button data-filter="all" class="filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold transition ${this.filterType === 'all' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}">All (114)</button>
            <button data-filter="Meccan" class="filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold transition ${this.filterType === 'Meccan' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}">Meccan</button>
            <button data-filter="Medinan" class="filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold transition ${this.filterType === 'Medinan' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}">Medinan</button>
          </div>
        </div>

        <!-- Surahs Grid -->
        <div id="surahs-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <!-- Populated by renderSurahsList() -->
        </div>
      </div>

      <!-- Surah Reader View (Hidden by default) -->
      <div id="quran-reader-view" class="hidden space-y-6">
        <!-- Reader Sticky Top Bar -->
        <div class="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-3 px-1 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
          <button id="reader-back-btn" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>All Surahs</span>
          </button>

          <div class="text-center truncate px-2">
            <h2 id="reader-surah-title" class="font-bold text-slate-800 dark:text-slate-100 text-base truncate">Surah</h2>
            <p id="reader-surah-subtitle" class="text-xs text-slate-500 dark:text-slate-400">7 Verses • Meccan</p>
          </div>

          <!-- Controls: Font size & Full audio play -->
          <div class="flex items-center gap-1.5">
            <button id="reader-play-surah-btn" class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm">
              <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i>
              <span class="hidden sm:inline">Play Surah</span>
            </button>
            <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
              <button id="font-decrease-btn" title="Decrease font" class="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                <i data-lucide="minus" class="w-3.5 h-3.5"></i>
              </button>
              <span class="text-[11px] font-bold px-1.5 text-slate-600 dark:text-slate-300">A</span>
              <button id="font-increase-btn" title="Increase font" class="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Surah Reader Body -->
        <div id="reader-content-body" class="max-w-3xl mx-auto space-y-6 pb-24">
          <!-- Populated by loadSurahView() -->
        </div>
      </div>
    `;

    this.renderSurahsList();
    this.updateLastReadCard();
    this.attachListEventListeners();
    this.setupAudioSubscription();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  updateLastReadCard() {
    const lastRead = Storage.getLastRead();
    const titleEl = document.getElementById("last-read-surah-title");
    if (titleEl && lastRead) {
      titleEl.textContent = `${lastRead.surahName} (Ayah ${lastRead.ayahNumber})`;
    }
    const card = document.getElementById("quran-last-read-card");
    if (card && lastRead) {
      card.onclick = () => this.openSurah(lastRead.surahNumber, lastRead.ayahNumber);
    }
  }

  renderSurahsList() {
    const grid = document.getElementById("surahs-grid");
    if (!grid) return;

    let filtered = SURAHS_DATA;

    // Filter by Mecca / Medina
    if (this.filterType !== "all") {
      filtered = filtered.filter(s => s.revelationType === this.filterType);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s =>
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        s.name.includes(q) ||
        s.number.toString() === q
      );
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <i data-lucide="search-x" class="w-10 h-10 text-slate-400 mx-auto mb-2"></i>
          <p class="text-slate-600 dark:text-slate-400 text-sm font-medium">No Surahs found matching "${this.searchQuery}"</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    grid.innerHTML = filtered.map(s => `
      <div data-surah="${s.number}" class="surah-card bg-white dark:bg-slate-800/90 hover:border-emerald-500/80 dark:hover:border-emerald-500/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer flex items-center justify-between group">
        <div class="flex items-center gap-3.5">
          <!-- Surah Number badge with geometric shape -->
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white transition">
            ${s.number}
          </div>
          <div>
            <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
              ${s.englishName}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              ${s.englishNameTranslation} • <span class="text-[11px]">${s.numberOfAyahs} ayahs</span>
            </p>
          </div>
        </div>

        <!-- Arabic Name in Calligraphy -->
        <div class="text-right">
          <span class="font-arabic text-xl font-bold text-emerald-800 dark:text-emerald-400 group-hover:text-amber-500 transition">
            ${s.name}
          </span>
          <span class="block text-[10px] font-semibold text-slate-400 uppercase">${s.revelationType}</span>
        </div>
      </div>
    `).join("");

    // Add click listeners to cards
    grid.querySelectorAll(".surah-card").forEach(card => {
      card.addEventListener("click", () => {
        const surahNum = parseInt(card.getAttribute("data-surah"));
        this.openSurah(surahNum);
      });
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  async openSurah(surahNumber, scrollToAyah = null) {
    this.activeSurahNumber = surahNumber;
    const meta = SURAHS_DATA.find(s => s.number === surahNumber);

    // Push a history entry so Back closes the reader instead of leaving Quran tab
    window.history.pushState({ tab: "quran", surah: surahNumber }, "", `#quran`);

    // Switch view
    document.getElementById("quran-list-view")?.classList.add("hidden");
    const readerView = document.getElementById("quran-reader-view");
    readerView?.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Update Header
    document.getElementById("reader-surah-title").textContent = `${meta.number}. Surah ${meta.englishName} (${meta.name})`;
    document.getElementById("reader-surah-subtitle").textContent = `${meta.numberOfAyahs} Verses • ${meta.revelationType} • "${meta.englishNameTranslation}"`;

    const body = document.getElementById("reader-content-body");
    body.innerHTML = `
      <div class="text-center py-16">
        <div class="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">Loading Surah ${meta.englishName}...</p>
      </div>
    `;

    try {
      const data = await getSurahDetails(surahNumber);
      this.currentSurahData = data;
      this.renderSurahReaderBody(data);

      // Save to last read
      Storage.setLastRead(surahNumber, meta.englishName, scrollToAyah || 1);
      this.updateLastReadCard();

      if (scrollToAyah && scrollToAyah > 1) {
        setTimeout(() => {
          const ayahEl = document.getElementById(`ayah-${scrollToAyah}`);
          if (ayahEl) {
            ayahEl.scrollIntoView({ behavior: "smooth", block: "center" });
            ayahEl.classList.add("ring-2", "ring-amber-400");
          }
        }, 300);
      }
    } catch (err) {
      body.innerHTML = `
        <div class="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center text-red-700 dark:text-red-300">
          <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-2 text-red-500"></i>
          <p class="font-bold text-sm">Failed to load Surah.</p>
          <p class="text-xs mt-1">${err.message}</p>
          <button id="retry-surah-btn" class="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold">Try Again</button>
        </div>
      `;
      document.getElementById("retry-surah-btn")?.addEventListener("click", () => this.openSurah(surahNumber));
      if (window.lucide) window.lucide.createIcons();
    }
  }

  renderSurahReaderBody(data) {
    const body = document.getElementById("reader-content-body");
    const meta = SURAHS_DATA.find(s => s.number === data.number);
    const bookmarks = Storage.getBookmarks();

    // Basmala condition (Surah 9 At-Tawbah does not have Basmala; Surah 1 has it as Ayah 1)
    const showBismillah = data.number !== 9 && data.number !== 1;

    body.innerHTML = `
      <!-- Decorative Surah Header Card -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white p-6 md:p-8 text-center shadow-lg border border-emerald-700/50">
        <div class="relative z-10 space-y-2">
          <span class="inline-block px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-semibold">
            ${meta.revelationType} • ${meta.numberOfAyahs} Ayahs
          </span>
          <h1 class="text-3xl md:text-4xl font-arabic font-bold text-amber-300 py-1">
            ${data.name}
          </h1>
          <p class="text-base font-bold text-emerald-100">${data.englishName} - "${data.englishNameTranslation}"</p>
        </div>
      </div>

      ${showBismillah ? `
        <!-- Bismillah Header -->
        <div class="text-center py-6">
          <p class="font-arabic text-2xl md:text-3xl text-emerald-950 dark:text-emerald-200 font-bold select-text" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p class="text-xs text-slate-400 mt-1 italic">In the name of Allah, the Entirely Merciful, the Especially Merciful</p>
        </div>
      ` : ''}

      <!-- Ayahs List -->
      <div class="space-y-4">
        ${data.ayahs.map(ayah => {
          const isBookmarked = bookmarks.some(b => b.surah === data.number && b.ayah === ayah.numberInSurah);
          return `
            <div id="ayah-${ayah.numberInSurah}" data-ayah="${ayah.numberInSurah}" class="ayah-card bg-white dark:bg-slate-800/95 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow transition-all space-y-4">
              <!-- Ayah Action Bar -->
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
                <div class="flex items-center gap-2">
                  <span class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs font-bold">
                    ${ayah.numberInSurah}
                  </span>
                  <span class="text-xs font-semibold text-slate-400">Verse ${ayah.numberInSurah}</span>
                </div>

                <div class="flex items-center gap-1">
                  <!-- Play Ayah Audio -->
                  <button data-action="play-ayah" data-ayah="${ayah.numberInSurah}" title="Listen to verse" class="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
                    <i data-lucide="play" class="w-4 h-4"></i>
                  </button>

                  <!-- Bookmark Ayah -->
                  <button data-action="bookmark-ayah" data-ayah="${ayah.numberInSurah}" title="Bookmark" class="p-2 ${isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'} hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
                    <i data-lucide="bookmark" class="w-4 h-4 ${isBookmarked ? 'fill-current' : ''}"></i>
                  </button>

                  <!-- Copy Ayah -->
                  <button data-action="copy-ayah" data-ayah="${ayah.numberInSurah}" title="Copy" class="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
                    <i data-lucide="copy" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>

              <!-- Arabic Text -->
              <div class="text-right py-2">
                <p class="font-arabic text-slate-900 dark:text-slate-100 leading-loose select-text" dir="rtl" style="font-size: ${this.arabicFontSize}px;">
                  ${ayah.text}
                  <span class="inline-block mx-1.5 text-amber-500 font-bold font-arabic select-none text-xl">۝${ayah.numberInSurah}</span>
                </p>
              </div>

              <!-- English Translation -->
              <div class="border-t border-slate-100 dark:border-slate-700/60 pt-3">
                <p class="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal select-text">
                  ${ayah.translation}
                </p>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    this.attachReaderEventListeners();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  attachListEventListeners() {
    // Search input
    const searchInput = document.getElementById("quran-search-input");
    searchInput?.addEventListener("input", (e) => {
      this.searchQuery = e.target.value;
      this.renderSurahsList();
    });

    // Filter pills
    document.querySelectorAll(".filter-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        this.filterType = pill.getAttribute("data-filter");
        document.querySelectorAll(".filter-pill").forEach(p => {
          p.className = "filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold transition text-slate-600 dark:text-slate-300";
        });
        pill.className = "filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold transition bg-emerald-700 text-white shadow-sm";
        this.renderSurahsList();
      });
    });
  }

  attachReaderEventListeners() {
    // Back button — uses history.back() to pop the surah state; popstate handler in app.js does the actual view swap
    document.getElementById("reader-back-btn")?.addEventListener("click", () => {
      window.history.back();
    });

    // Font size controls
    document.getElementById("font-increase-btn")?.addEventListener("click", () => {
      if (this.arabicFontSize < 42) {
        this.arabicFontSize += 2;
        this.applyFontSize();
      }
    });

    document.getElementById("font-decrease-btn")?.addEventListener("click", () => {
      if (this.arabicFontSize > 18) {
        this.arabicFontSize -= 2;
        this.applyFontSize();
      }
    });

    // Play whole surah
    document.getElementById("reader-play-surah-btn")?.addEventListener("click", () => {
      if (!this.currentSurahData) return;
      quranAudio.playSurah(
        this.currentSurahData.number,
        this.currentSurahData.englishName,
        this.currentSurahData.numberOfAyahs,
        1
      );
      this.app.showAudioPlayerBar(this.currentSurahData.englishName, 1);
    });

    // Per-Ayah action clicks (Play, Bookmark, Copy)
    document.querySelectorAll("[data-action='play-ayah']").forEach(btn => {
      btn.addEventListener("click", () => {
        const ayahNum = parseInt(btn.getAttribute("data-ayah"));
        quranAudio.playAyah(this.currentSurahData.number, ayahNum, this.currentSurahData.englishName);
        this.app.showAudioPlayerBar(this.currentSurahData.englishName, ayahNum);
      });
    });

    document.querySelectorAll("[data-action='bookmark-ayah']").forEach(btn => {
      btn.addEventListener("click", () => {
        const ayahNum = parseInt(btn.getAttribute("data-ayah"));
        Storage.toggleBookmark({
          surah: this.currentSurahData.number,
          surahName: this.currentSurahData.englishName,
          ayah: ayahNum,
          timestamp: Date.now()
        });
        this.renderSurahReaderBody(this.currentSurahData);
        this.app.showToast(`Bookmark updated!`);
      });
    });

    document.querySelectorAll("[data-action='copy-ayah']").forEach(btn => {
      btn.addEventListener("click", () => {
        const ayahNum = parseInt(btn.getAttribute("data-ayah"));
        const ayah = this.currentSurahData.ayahs.find(a => a.numberInSurah === ayahNum);
        if (ayah) {
          const text = `${ayah.text}\n"${ayah.translation}"\n(Surah ${this.currentSurahData.englishName} ${this.currentSurahData.number}:${ayah.numberInSurah})`;
          navigator.clipboard.writeText(text).then(() => {
            this.app.showToast("Ayah copied to clipboard!");
          });
        }
      });
    });
  }

  applyFontSize() {
    document.querySelectorAll(".ayah-card .font-arabic").forEach(el => {
      el.style.fontSize = `${this.arabicFontSize}px`;
    });
  }

  setupAudioSubscription() {
    if (this.unsubscribeAudio) this.unsubscribeAudio();

    this.unsubscribeAudio = quranAudio.subscribe((state) => {
      if (state.currentSurah && state.currentSurah.number === this.activeSurahNumber) {
        // Highlight active playing ayah
        document.querySelectorAll(".ayah-card").forEach(c => {
          c.classList.remove("ring-2", "ring-emerald-500", "bg-emerald-50/40", "dark:bg-emerald-950/30");
        });

        if (state.currentAyah) {
          const activeCard = document.getElementById(`ayah-${state.currentAyah}`);
          if (activeCard) {
            activeCard.classList.add("ring-2", "ring-emerald-500", "bg-emerald-50/40", "dark:bg-emerald-950/30");
            activeCard.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }
    });
  }

  destroy() {
    if (this.unsubscribeAudio) {
      this.unsubscribeAudio();
      this.unsubscribeAudio = null;
    }
  }
}
