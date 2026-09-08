// Activities & Tasbeeh Tracker [MAIN FEATURE]
// Includes: Live Dynamic Counter, Flexible Targets, Manual Count Input,
// Daily Habit Checklist (5 Prayers + Sunnah), and Activity History with Weekly/Monthly Analytics
import { ADHKAR_CATEGORIES, DEFAULT_ADHKAR } from "../data/adhkar.js";
import { Storage } from "../services/storage.js";
import { sounds } from "../services/soundEffects.js";

export class TasbeehTab {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById("tab-tasbeeh");
    this.activeView = "counter"; // "counter" | "checklist" | "history"
    this.historyFilter = "all"; // "all" | "completed" | "in_progress"
    this.activeCategory = "salah";
    this.activeDhikrId = "s_1";
    this.currentCount = 0;
    this.currentTarget = 33;
    this.activeDhikr = null;
    this.currentSessionId = null;
    this.customDhikrs = Storage.getCustomDhikrs();
    this.isCompletedAlertShown = false;
    this.selectedHabitDate = new Date().toISOString().split("T")[0];
  }

  render() {
    this.customDhikrs = Storage.getCustomDhikrs();
    this.initActiveDhikr();

    const history = Storage.getTasbeehHistory();
    const inProgressCount = history.filter(s => s.status === "in_progress").length;
    const todayHabits = Storage.getDailyHabits(this.selectedHabitDate);
    const habitsCount = Object.values(todayHabits).filter(Boolean).length;

    this.container.innerHTML = `
      <div class="space-y-6 max-w-4xl mx-auto pb-12">
        <!-- Top Header & Main 3-Way Sub-Navigation Switcher -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
              <i data-lucide="activity" class="w-6 h-6 text-emerald-600 dark:text-emerald-400"></i>
              Activities & Tasbeeh Tracker
            </h1>
            <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Dynamic dhikr tracking, manual count entry, daily prayer checklist, and analytics
            </p>
          </div>

          <!-- Main Sub-Navigation: 3 Tabs -->
          <div class="flex items-center gap-2">
            <div class="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-x-auto scrollbar-none">
              <!-- 1. Counter -->
              <button
                id="tab-btn-counter"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${this.activeView === 'counter' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'}"
              >
                <i data-lucide="circle-dot" class="w-3.5 h-3.5"></i>
                <span>Tasbeeh</span>
              </button>

              <!-- 2. Daily Habit Checklist -->
              <button
                id="tab-btn-checklist"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${this.activeView === 'checklist' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'}"
              >
                <i data-lucide="check-square" class="w-3.5 h-3.5"></i>
                <span>Checklist</span>
                <span class="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] ${this.activeView === 'checklist' ? 'bg-emerald-900 text-amber-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}">
                  ${habitsCount}/11
                </span>
              </button>

              <!-- 3. History & Analytics -->
              <button
                id="tab-btn-history"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${this.activeView === 'history' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'}"
              >
                <i data-lucide="bar-chart-2" class="w-3.5 h-3.5"></i>
                <span>Analytics</span>
                <span class="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] ${this.activeView === 'history' ? 'bg-emerald-900 text-amber-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}">
                  ${history.length}
                </span>
                ${inProgressCount > 0 ? `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="${inProgressCount} in progress"></span>` : ''}
              </button>
            </div>

            <!-- Add Custom Dhikr Modal Trigger -->
            <button id="btn-open-custom-dhikr-modal" title="Add Custom Dhikr" class="flex items-center gap-1.5 px-3 py-2 bg-emerald-700/10 hover:bg-emerald-700/20 text-emerald-700 dark:text-emerald-300 border border-emerald-600/30 rounded-xl text-xs font-bold transition shrink-0">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span class="hidden md:inline">New Dhikr</span>
            </button>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- SUB-TAB 1: LIVE TASBEEH COUNTER & MANUAL INPUT -->
        <!-- ============================================== -->
        <div id="view-counter-section" class="${this.activeView === 'counter' ? '' : 'hidden'} space-y-6">
          <!-- Category Scroll / Filter Tabs -->
          <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            ${ADHKAR_CATEGORIES.map(c => `
              <button data-cat="${c.id}" class="cat-pill flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${this.activeCategory === c.id ? 'bg-emerald-700 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700'}">
                <i data-lucide="${c.icon}" class="w-3.5 h-3.5"></i>
                <span>${c.name}</span>
              </button>
            `).join("")}
            <button data-cat="custom" class="cat-pill flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${this.activeCategory === 'custom' ? 'bg-emerald-700 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700'}">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
              <span>My Custom (${this.customDhikrs.length})</span>
            </button>
          </div>

          <!-- Main Live Dynamic Tracker Card -->
          <div class="bg-white dark:bg-slate-800/90 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-md relative overflow-hidden">
            <div class="absolute -right-24 -top-24 w-64 h-64 rounded-full bg-emerald-500/5 dark:bg-emerald-400/5 blur-3xl pointer-events-none"></div>

            <!-- Active Dhikr Header -->
            <div class="text-center max-w-xl mx-auto space-y-3">
              <div class="flex items-center justify-center gap-2">
                <span id="active-dhikr-category" class="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  ${this.activeDhikr.category}
                </span>
                ${this.currentSessionId ? `
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                    <i data-lucide="clock" class="w-3 h-3"></i> Resumed Session
                  </span>
                ` : ''}
              </div>

              <h2 id="active-dhikr-title" class="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">
                ${this.activeDhikr.title}
              </h2>
              <p id="active-dhikr-arabic" class="font-arabic text-2xl md:text-3xl text-emerald-900 dark:text-emerald-200 font-bold leading-relaxed py-1 select-text" dir="rtl">
                ${this.activeDhikr.arabic || ""}
              </p>
              <p id="active-dhikr-translit" class="text-xs md:text-sm text-slate-500 dark:text-slate-400 italic">
                "${this.activeDhikr.transliteration || ""}"
              </p>
              <p id="active-dhikr-meaning" class="text-xs text-slate-600 dark:text-slate-300">
                ${this.activeDhikr.translation || ""}
              </p>
            </div>

            <!-- Live Dynamic Stats Banner (Total Target, Completed, Remaining, Progress %) -->
            <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto">
              <div class="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span class="text-[10px] font-bold uppercase text-slate-400">Total Target</span>
                <p id="stat-target-display" class="text-lg font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-0.5">
                  ${this.currentTarget.toLocaleString()}
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span class="text-[10px] font-bold uppercase text-slate-400">Completed</span>
                <p id="stat-completed-display" class="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  ${this.currentCount.toLocaleString()}
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span class="text-[10px] font-bold uppercase text-slate-400">Remaining</span>
                <p id="stat-remaining-display" class="text-lg font-extrabold text-amber-500 dark:text-amber-400 font-mono mt-0.5">
                  ${Math.max(0, this.currentTarget - this.currentCount).toLocaleString()}
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span class="text-[10px] font-bold uppercase text-slate-400">Progress</span>
                <p id="stat-percent-display" class="text-lg font-extrabold text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                  ${Math.min(100, Math.round((this.currentCount / (this.currentTarget || 1)) * 100))}%
                </p>
              </div>
            </div>

            <!-- Circular Dynamic Counter Ring -->
            <div class="my-8 flex flex-col items-center justify-center">
              <div class="relative w-64 h-64 md:w-72 md:h-72 select-none">
                <!-- SVG Progress Circle -->
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
                  <circle
                    cx="120"
                    cy="120"
                    r="100"
                    class="stroke-slate-100 dark:stroke-slate-700/60"
                    stroke-width="14"
                    fill="transparent"
                  />
                  <circle
                    id="tasbeeh-svg-progress"
                    cx="120"
                    cy="120"
                    r="100"
                    class="stroke-amber-400 dark:stroke-amber-400 transition-all duration-300 ease-out"
                    stroke-width="14"
                    stroke-linecap="round"
                    fill="transparent"
                    stroke-dasharray="628.3"
                    stroke-dashoffset="628.3"
                  />
                </svg>

                <!-- Central Tap Zone -->
                <button
                  id="tasbeeh-tap-zone"
                  class="absolute inset-4 rounded-full bg-gradient-to-b from-emerald-700 to-emerald-900 hover:from-emerald-600 hover:to-emerald-800 active:scale-95 transition-all duration-150 flex flex-col items-center justify-center text-white shadow-2xl border-4 border-emerald-600/60 cursor-pointer group"
                >
                  <span class="text-[11px] uppercase tracking-widest font-semibold text-emerald-200/80 group-hover:text-amber-300 transition">Tap to Count</span>
                  <span id="tasbeeh-current-count" class="text-5xl md:text-6xl font-black text-white font-mono tracking-tight my-1">
                    ${this.currentCount}
                  </span>
                  <div class="flex items-center gap-1.5 text-xs text-emerald-200">
                    <span>Remaining:</span>
                    <span id="tasbeeh-remaining-count" class="font-bold text-amber-300">${Math.max(0, this.currentTarget - this.currentCount)}</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Bottom Counter Controls: Manual Count Input, Target Presets, Save, Reset -->
            <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-700/60">
              <!-- Target System Selector -->
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Target:</span>
                <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl">
                  ${[33, 99, 100, 1000].map(tgt => `
                    <button data-target="${tgt}" class="target-preset-btn px-2.5 py-1 rounded-lg text-xs font-bold transition ${this.currentTarget === tgt ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'}">
                      ${tgt}
                    </button>
                  `).join("")}
                  <button id="btn-custom-target" class="px-2.5 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:text-emerald-600">
                    Custom
                  </button>
                </div>
              </div>

              <!-- Action buttons: Manual Count Input, Save Progress, Reset, Sound -->
              <div class="flex items-center gap-2">
                <!-- Manual Count Input Trigger (Direct Numeric Typing) -->
                <button
                  id="btn-open-manual-input"
                  title="Direct Manual Count Input"
                  class="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 border border-amber-300 dark:border-amber-700/50 rounded-xl transition shadow-sm active-bounce"
                >
                  <i data-lucide="edit-3" class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400"></i>
                  <span>Manual Input</span>
                </button>

                <!-- Save Progress Session -->
                <button id="btn-save-progress-session" title="Save session to history" class="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 rounded-xl transition shadow-sm">
                  <i data-lucide="bookmark" class="w-3.5 h-3.5"></i>
                  <span>Save</span>
                </button>

                <!-- Reset -->
                <button id="btn-reset-counter" title="Reset Counter" class="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-700/60 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition">
                  <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                  <span>Reset</span>
                </button>

                <!-- Sound Toggle -->
                <button id="btn-sound-toggle" title="Toggle Bead Sound" class="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 bg-slate-100 dark:bg-slate-700/60 rounded-xl transition">
                  <i data-lucide="volume-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Adhkar Selection Cards Grid -->
          <div class="space-y-3">
            <div class="flex items-center justify-between px-1">
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">Select Dhikr from Collection</h3>
              <span id="adhkar-list-count" class="text-xs text-slate-400 font-medium">10 Available</span>
            </div>

            <div id="adhkar-cards-container" class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <!-- Populated dynamically -->
            </div>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- SUB-TAB 2: DAILY HABIT CHECKLIST -->
        <!-- ============================================== -->
        <div id="view-checklist-section" class="${this.activeView === 'checklist' ? '' : 'hidden'} space-y-6">
          <!-- Date Switcher & Completion Header -->
          <div class="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-md">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Islamic Spiritual Habits</span>
                <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">Daily Ibadah Checklist</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400">Check off your 5 daily prayers and recommended sunnah practices</p>
              </div>

              <!-- Date Picker / Navigation -->
              <div class="flex items-center gap-2">
                <input
                  id="habit-date-input"
                  type="date"
                  value="${this.selectedHabitDate}"
                  class="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button id="btn-habit-today" class="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition">
                  Today
                </button>
              </div>
            </div>

            <!-- Progress Progress Ring & Streak Banner -->
            <div class="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center font-bold text-base">
                  <span id="checklist-ratio-display">${habitsCount}/11</span>
                </div>
                <div>
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-200">Daily Completion</span>
                  <div class="w-36 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      id="checklist-progress-bar"
                      class="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style="width: ${Math.round((habitsCount / 11) * 100)}%;"
                    ></div>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                  🔥 <span id="checklist-streak-text">Active Streak</span>
                </span>
                <span class="text-xs text-slate-400" id="checklist-percent-text">${Math.round((habitsCount / 11) * 100)}% complete</span>
              </div>
            </div>
          </div>

          <!-- Section 1: 5 Daily Obligatory Prayers -->
          <div class="space-y-3">
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 px-1">
              <i data-lucide="sun-medium" class="w-4 h-4 text-emerald-600"></i>
              The 5 Obligatory Prayers (الصلوات المفروضة)
            </h3>
            <div id="habits-prayers-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- Section 2: Sunnah & Daily Spiritual Habits -->
          <div class="space-y-3">
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 px-1">
              <i data-lucide="sparkles" class="w-4 h-4 text-amber-500"></i>
              Sunnah & Daily Spiritual Deeds
            </h3>
            <div id="habits-sunnah-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- SUB-TAB 3: ACTIVITY HISTORY & ANALYTICS -->
        <!-- ============================================== -->
        <div id="view-history-section" class="${this.activeView === 'history' ? '' : 'hidden'} space-y-6">
          <!-- Monthly Overview Metrics -->
          <div id="history-monthly-metrics" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <!-- Populated dynamically -->
          </div>

          <!-- Weekly Analytics Bar Chart -->
          <div class="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-md space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base flex items-center gap-2">
                  <i data-lucide="trending-up" class="w-4 h-4 text-emerald-600"></i>
                  Weekly Activity Overview (Last 7 Days)
                </h3>
                <p class="text-xs text-slate-400 mt-0.5">Dhikr counts & habit completions per day</p>
              </div>
              <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                Recitation Trends
              </span>
            </div>

            <!-- Visual Bar Chart -->
            <div id="weekly-barchart-container" class="pt-4 flex items-end justify-between gap-2 h-44 border-b border-slate-100 dark:border-slate-700/80 pb-3">
              <!-- Populated dynamically -->
            </div>
          </div>

          <!-- History Filter Controls & Clear All -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800/90 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <!-- Filter Pills -->
            <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl">
              <button data-history-filter="all" class="history-filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold transition ${this.historyFilter === 'all' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}">
                All (${history.length})
              </button>
              <button data-history-filter="completed" class="history-filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold transition ${this.historyFilter === 'completed' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}">
                Completed (${history.filter(s => s.status === 'completed').length})
              </button>
              <button data-history-filter="in_progress" class="history-filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold transition ${this.historyFilter === 'in_progress' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}">
                In Progress (${inProgressCount})
              </button>
            </div>

            <!-- Clear History Action -->
            <button id="btn-clear-all-history" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              <span>Clear History</span>
            </button>
          </div>

          <!-- History Entries List Container -->
          <div id="history-entries-list" class="space-y-3">
            <!-- Rendered by renderHistoryList() -->
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- MODAL: MANUAL COUNT INPUT (DIRECT NUMBER ENTRY) -->
      <!-- ============================================== -->
      <div id="modal-manual-input" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
              <i data-lucide="edit-3" class="w-5 h-5 text-amber-500"></i>
              Manual Count Input
            </h3>
            <button id="btn-close-manual-modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <p class="text-xs text-slate-500 dark:text-slate-400">
            Completed your recitations manually or on physical beads? Type any count (e.g., 500, 2,500) to update your progress instantly.
          </p>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Enter Count *</label>
            <input
              id="input-manual-count-val"
              type="number"
              min="1"
              max="1000000"
              placeholder="e.g. 2500"
              class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-2xl font-black font-mono text-center text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <!-- Quick Increment Buttons (+33, +100, +500, +1000) -->
          <div class="flex items-center gap-1.5 justify-center py-1">
            ${[33, 100, 500, 1000, 2500].map(n => `
              <button data-quick-manual="${n}" class="quick-manual-chip px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition">
                +${n}
              </button>
            `).join("")}
          </div>

          <div class="pt-2">
            <button id="btn-manual-add-to-count" class="w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition flex items-center justify-center gap-1">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Add to Current Count</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- MODAL: CUSTOM DHIKR CREATOR -->
      <!-- ============================================== -->
      <div id="modal-custom-dhikr" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
              <i data-lucide="plus-circle" class="w-5 h-5 text-emerald-600"></i>
              Add Custom Dhikr / Dua
            </h3>
            <button id="btn-close-custom-modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="form-custom-dhikr" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Dhikr / Dua Title *</label>
              <input id="input-dhikr-title" type="text" required placeholder="e.g. Hasbunallahu wa ni'mal wakeel" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Arabic Script (Optional)</label>
              <input id="input-dhikr-arabic" type="text" placeholder="حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ" dir="rtl" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-arabic text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Transliteration or Meaning</label>
              <input id="input-dhikr-translit" type="text" placeholder="Allah is sufficient for us, and He is the best Disposer of affairs" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Count (e.g. 33, 1000, 100000) *</label>
              <input id="input-dhikr-target" type="number" required min="1" max="1000000" value="100" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div class="pt-2 flex items-center justify-end gap-2">
              <button type="button" id="btn-cancel-custom-dhikr" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button type="submit" class="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition">
                Save Dhikr
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- MODAL: CUSTOM TARGET NUMBER INPUT -->
      <!-- ============================================== -->
      <div id="modal-custom-target" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-xs w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm">Set Custom Target</h3>
          <input id="input-custom-target-val" type="number" min="1" max="1000000" value="${this.currentTarget}" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-lg font-bold text-center text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <div class="flex items-center justify-end gap-2">
            <button id="btn-cancel-target-modal" class="px-3 py-1.5 text-xs font-semibold text-slate-500">Cancel</button>
            <button id="btn-save-custom-target" class="px-4 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold">Apply</button>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- MODAL: TARGET COMPLETED CELEBRATION -->
      <!-- ============================================== -->
      <div id="modal-celebration" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-amber-400/40 space-y-4 animate-bounce-short">
          <div class="w-16 h-16 rounded-full bg-amber-400/20 text-amber-500 flex items-center justify-center mx-auto border-2 border-amber-400/50 shadow-lg">
            <i data-lucide="trophy" class="w-8 h-8"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 font-display">Masha'Allah!</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You reached your target of <span class="font-bold text-amber-500">${this.currentTarget.toLocaleString()}</span> counts for <span class="font-bold" id="celeb-dhikr-name">Dhikr</span>.
            </p>
          </div>
          <div class="pt-2 flex items-center justify-center gap-2">
            <button id="btn-celeb-continue" class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition">
              Continue Counting
            </button>
            <button id="btn-celeb-reset" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition">
              Reset & New Session
            </button>
          </div>
        </div>
      </div>
    `;

    this.renderAdhkarList();
    this.renderChecklist();
    this.renderHistoryList();
    this.renderAnalytics();
    this.updateProgressRing();
    this.attachEventListeners();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  initActiveDhikr() {
    const all = [...DEFAULT_ADHKAR, ...this.customDhikrs];
    this.activeDhikr = all.find(d => d.id === this.activeDhikrId) || DEFAULT_ADHKAR[0];
    this.activeDhikrId = this.activeDhikr.id;

    if (!this.currentSessionId) {
      const savedCounts = Storage.getDhikrCounts();
      this.currentCount = savedCounts[this.activeDhikrId] || 0;
      this.currentTarget = this.activeDhikr.target || 33;
    }
    this.isCompletedAlertShown = this.currentCount >= this.currentTarget;
  }

  // Render Daily Habit Checklist (5 Prayers + Sunnah deeds)
  renderChecklist() {
    const prayersBox = document.getElementById("habits-prayers-container");
    const sunnahBox = document.getElementById("habits-sunnah-container");
    if (!prayersBox || !sunnahBox) return;

    const habits = Storage.getDailyHabits(this.selectedHabitDate);

    const prayerList = [
      { key: "fajr", name: "Fajr Prayer", arabic: "صلاة الفجر", icon: "sunrise" },
      { key: "dhuhr", name: "Dhuhr Prayer", arabic: "صلاة الظهر", icon: "sun-medium" },
      { key: "asr", name: "Asr Prayer", arabic: "صلاة العصر", icon: "cloud-sun" },
      { key: "maghrib", name: "Maghrib Prayer", arabic: "صلاة المغرب", icon: "sunset" },
      { key: "isha", name: "Isha Prayer", arabic: "صلاة العشاء", icon: "moon" }
    ];

    const sunnahList = [
      { key: "morningAdhkar", name: "Morning Adhkar", desc: "Recite morning protection", icon: "sunrise" },
      { key: "eveningAdhkar", name: "Evening Adhkar", desc: "Recite evening remembrance", icon: "sunset" },
      { key: "tahajjud", name: "Tahajjud / Qiyam", desc: "Night voluntary prayer", icon: "moon-star" },
      { key: "duha", name: "Duha Prayer", desc: "Forenoon prayer (2+ rak'ah)", icon: "sun" },
      { key: "quran", name: "Daily Quran Reading", desc: "Read at least 1 rub' or hizb", icon: "book-open" },
      { key: "sadaqah", name: "Daily Charity / Sadaqah", desc: "Give or perform an act of kindness", icon: "heart" }
    ];

    prayersBox.innerHTML = prayerList.map(item => {
      const isChecked = Boolean(habits[item.key]);
      return `
        <div data-habit-key="${item.key}" class="habit-item-card bg-white dark:bg-slate-800/90 rounded-2xl p-4 border ${isChecked ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20' : 'border-slate-200/80 dark:border-slate-700/80'} shadow-sm hover:shadow transition cursor-pointer flex items-center justify-between group">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 rounded-lg border-2 ${isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'} flex items-center justify-center transition">
              <i data-lucide="check" class="w-3.5 h-3.5 ${isChecked ? 'opacity-100' : 'opacity-0'}"></i>
            </div>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm ${isChecked ? 'line-through text-slate-400 dark:text-slate-500' : ''}">
                ${item.name}
              </h4>
              <span class="font-arabic text-xs text-emerald-800 dark:text-emerald-300 font-semibold" dir="rtl">${item.arabic}</span>
            </div>
          </div>
          <i data-lucide="${item.icon}" class="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition"></i>
        </div>
      `;
    }).join("");

    sunnahBox.innerHTML = sunnahList.map(item => {
      const isChecked = Boolean(habits[item.key]);
      return `
        <div data-habit-key="${item.key}" class="habit-item-card bg-white dark:bg-slate-800/90 rounded-2xl p-4 border ${isChecked ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20' : 'border-slate-200/80 dark:border-slate-700/80'} shadow-sm hover:shadow transition cursor-pointer flex items-center justify-between group">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 rounded-lg border-2 ${isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'} flex items-center justify-center transition">
              <i data-lucide="check" class="w-3.5 h-3.5 ${isChecked ? 'opacity-100' : 'opacity-0'}"></i>
            </div>
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm ${isChecked ? 'line-through text-slate-400 dark:text-slate-500' : ''}">
                ${item.name}
              </h4>
              <span class="text-[11px] text-slate-400">${item.desc}</span>
            </div>
          </div>
          <i data-lucide="${item.icon}" class="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition"></i>
        </div>
      `;
    }).join("");

    // Click handler for habit cards
    document.querySelectorAll(".habit-item-card").forEach(card => {
      card.addEventListener("click", () => {
        const key = card.getAttribute("data-habit-key");
        this.toggleHabit(key);
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  toggleHabit(key) {
    const habits = Storage.getDailyHabits(this.selectedHabitDate);
    habits[key] = !habits[key];
    Storage.saveDailyHabits(this.selectedHabitDate, habits);

    sounds.playBeadClick();
    sounds.vibrate(20);

    this.renderChecklist();
    this.updateChecklistHeader();
  }

  updateChecklistHeader() {
    const habits = Storage.getDailyHabits(this.selectedHabitDate);
    const completedCount = Object.values(habits).filter(Boolean).length;
    const ratioEl = document.getElementById("checklist-ratio-display");
    const barEl = document.getElementById("checklist-progress-bar");
    const percentEl = document.getElementById("checklist-percent-text");

    const percent = Math.round((completedCount / 11) * 100);
    if (ratioEl) ratioEl.textContent = `${completedCount}/11`;
    if (barEl) barEl.style.width = `${percent}%`;
    if (percentEl) percentEl.textContent = `${percent}% complete`;
  }

  // Render Weekly Chart & Monthly Overview Metrics
  renderAnalytics() {
    const monthlyBox = document.getElementById("history-monthly-metrics");
    const weeklyBox = document.getElementById("weekly-barchart-container");
    if (!monthlyBox || !weeklyBox) return;

    const monthly = Storage.getMonthlyAnalytics();
    const weekly = Storage.getWeeklyAnalytics();

    monthlyBox.innerHTML = `
      <div class="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Month Recitations</span>
          <i data-lucide="sparkles" class="w-4 h-4 text-emerald-500"></i>
        </div>
        <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
          ${monthly.totalRecitations.toLocaleString()}
        </p>
        <span class="text-[11px] text-slate-400">${monthly.monthName}</span>
      </div>

      <div class="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed Sessions</span>
          <i data-lucide="check-circle-2" class="w-4 h-4 text-teal-500"></i>
        </div>
        <p class="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-2">
          ${monthly.completedSessions}
        </p>
        <span class="text-[11px] text-teal-600/80">Target reached</span>
      </div>

      <div class="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Streak</span>
          <i data-lucide="flame" class="w-4 h-4 text-amber-500"></i>
        </div>
        <p class="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
          ${monthly.activeStreak} Days
        </p>
        <span class="text-[11px] text-amber-600/80">Continuous habit</span>
      </div>

      <div class="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Daily Average</span>
          <i data-lucide="bar-chart" class="w-4 h-4 text-cyan-500"></i>
        </div>
        <p class="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">
          ${monthly.dailyAverage.toLocaleString()}
        </p>
        <span class="text-[11px] text-slate-400">Counts / day</span>
      </div>
    `;

    // Render Weekly Bar Chart
    const maxCount = Math.max(1, ...weekly.map(w => w.totalCount));

    weeklyBox.innerHTML = weekly.map(w => {
      const heightPercent = Math.max(8, Math.round((w.totalCount / maxCount) * 100));
      return `
        <div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
          <!-- Tooltip on hover -->
          <div class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            ${w.totalCount}
          </div>
          <!-- Bar -->
          <div class="w-full max-w-[32px] bg-slate-100 dark:bg-slate-700 rounded-t-xl overflow-hidden flex items-end h-full">
            <div
              class="w-full bg-gradient-to-t from-emerald-800 to-emerald-500 group-hover:from-amber-600 group-hover:to-amber-400 rounded-t-xl transition-all duration-300"
              style="height: ${heightPercent}%;"
            ></div>
          </div>
          <!-- Day label -->
          <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400">${w.dayLabel}</span>
        </div>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  renderAdhkarList() {
    const listContainer = document.getElementById("adhkar-cards-container");
    if (!listContainer) return;

    let items = [];
    if (this.activeCategory === "all") {
      items = [...DEFAULT_ADHKAR, ...this.customDhikrs];
    } else if (this.activeCategory === "custom") {
      items = this.customDhikrs;
    } else {
      items = DEFAULT_ADHKAR.filter(d => d.category === this.activeCategory);
    }

    const countLabel = document.getElementById("adhkar-list-count");
    if (countLabel) countLabel.textContent = `${items.length} Available`;

    if (items.length === 0) {
      listContainer.innerHTML = `
        <div class="col-span-full text-center py-8 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <p class="text-xs text-slate-500 dark:text-slate-400">No Dhikr in this category yet.</p>
          <button id="btn-empty-add-custom" class="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
            + Add your first custom Dhikr
          </button>
        </div>
      `;
      document.getElementById("btn-empty-add-custom")?.addEventListener("click", () => {
        document.getElementById("modal-custom-dhikr")?.classList.remove("hidden");
      });
      return;
    }

    const savedCounts = Storage.getDhikrCounts();

    listContainer.innerHTML = items.map(d => {
      const isSelected = d.id === this.activeDhikrId;
      const count = savedCounts[d.id] || 0;
      const isCustom = d.id.startsWith("custom_");

      return `
        <div data-dhikr-id="${d.id}" class="dhikr-card bg-white dark:bg-slate-800/90 rounded-2xl p-4 border ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-slate-200/80 dark:border-slate-700/80'} hover:border-emerald-400 transition cursor-pointer flex flex-col justify-between group">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                  Target: ${d.target.toLocaleString()}
                </span>
                ${isCustom ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">Custom</span>` : ''}
              </div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm mt-1.5 group-hover:text-emerald-600 transition">
                ${d.title}
              </h4>
            </div>

            ${isCustom ? `
              <button data-delete-dhikr="${d.id}" title="Delete Custom Dhikr" class="text-slate-400 hover:text-red-500 p-1 transition">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            ` : ''}
          </div>

          ${d.arabic ? `
            <div class="text-right my-2">
              <span class="font-arabic text-base text-emerald-800 dark:text-emerald-300 font-bold" dir="rtl">
                ${d.arabic}
              </span>
            </div>
          ` : ''}

          <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
            <span class="text-slate-500 dark:text-slate-400">Current: <strong class="text-slate-800 dark:text-slate-200">${count.toLocaleString()}</strong></span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Select
              <i data-lucide="chevron-right" class="w-3 h-3"></i>
            </span>
          </div>
        </div>
      `;
    }).join("");

    // Listeners for selecting dhikr
    listContainer.querySelectorAll(".dhikr-card").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("[data-delete-dhikr]")) return;
        const id = card.getAttribute("data-dhikr-id");
        this.selectDhikr(id);
      });
    });

    // Listeners for deleting custom dhikr
    listContainer.querySelectorAll("[data-delete-dhikr]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-delete-dhikr");
        if (confirm("Delete this custom dhikr?")) {
          Storage.deleteCustomDhikr(id);
          this.customDhikrs = Storage.getCustomDhikrs();
          if (this.activeDhikrId === id) {
            this.activeDhikrId = DEFAULT_ADHKAR[0].id;
          }
          this.render();
          this.app.showToast("Custom Dhikr deleted");
        }
      });
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderHistoryList() {
    const listContainer = document.getElementById("history-entries-list");
    if (!listContainer) return;

    let history = Storage.getTasbeehHistory();

    // Filter by status
    if (this.historyFilter === "completed") {
      history = history.filter(s => s.status === "completed");
    } else if (this.historyFilter === "in_progress") {
      history = history.filter(s => s.status === "in_progress");
    }

    if (history.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-16 bg-white dark:bg-slate-800/90 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-6">
          <div class="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <i data-lucide="history" class="w-7 h-7"></i>
          </div>
          <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">No History Sessions Found</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            ${this.historyFilter !== 'all' ? `No ${this.historyFilter.replace('_', ' ')} sessions recorded yet.` : 'Start reciting and tracking your Adhkar on the Counter tab. Sessions will automatically save here!'}
          </p>
          <button id="btn-history-go-counter" class="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm">
            Go to Counter
          </button>
        </div>
      `;

      document.getElementById("btn-history-go-counter")?.addEventListener("click", () => {
        this.switchView("counter");
      });

      if (window.lucide) window.lucide.createIcons();
      return;
    }

    listContainer.innerHTML = history.map(session => {
      const isCompleted = session.status === "completed";
      const progressPercent = Math.min(100, Math.round(((session.completedCount || 0) / (session.targetCount || 1)) * 100));

      return `
        <div data-session-id="${session.id}" class="history-card bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition space-y-4">
          <!-- Card Header: Title, Timestamp, Status Badge -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <div>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base">
                ${session.dhikrTitle}
              </h4>
              <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                <span>${session.formattedDate || "Recent"}</span>
              </div>
            </div>

            <!-- Status Badge -->
            <div>
              ${isCompleted ? `
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 shadow-sm">
                  <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"></i>
                  Completed
                </span>
              ` : `
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 shadow-sm">
                  <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse"></i>
                  In Progress (${session.remainingCount} left)
                </span>
              `}
            </div>
          </div>

          <!-- Card Body: Arabic & Translation -->
          ${session.arabic ? `
            <div class="text-right py-1">
              <p class="font-arabic text-xl md:text-2xl text-emerald-900 dark:text-emerald-200 font-bold leading-relaxed select-text" dir="rtl">
                ${session.arabic}
              </p>
            </div>
          ` : ''}

          ${session.transliteration ? `
            <p class="text-xs text-slate-500 dark:text-slate-400 italic">
              "${session.transliteration}"
            </p>
          ` : ''}

          <!-- Visual Progress Indicator Bar & Stats -->
          <div class="space-y-1.5 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                <span>Count:</span>
                <strong class="text-emerald-700 dark:text-emerald-400 font-mono text-sm">${(session.completedCount || 0).toLocaleString()}</strong>
                <span class="text-slate-400">/ ${(session.targetCount || 1).toLocaleString()}</span>
              </span>

              <span class="font-semibold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}">
                ${isCompleted ? 'Target Achieved' : `${session.remainingCount} Remaining`}
              </span>
            </div>

            <!-- Progress Track -->
            <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-600' : 'bg-amber-400'}"
                style="width: ${progressPercent}%;"
              ></div>
            </div>
          </div>

          <!-- Card Footer: Actions (Resume / Repeat & Delete) -->
          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-2">
              ${!isCompleted ? `
                <!-- Resume Option Button -->
                <button
                  data-resume-id="${session.id}"
                  class="btn-resume-session flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm active-bounce"
                >
                  <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i>
                  <span>Resume Session</span>
                </button>
              ` : `
                <!-- Repeat Completed Dhikr -->
                <button
                  data-repeat-id="${session.id}"
                  class="btn-repeat-session flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-50 dark:bg-slate-700/70 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-700 rounded-xl text-xs font-bold transition"
                >
                  <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                  <span>Count Again</span>
                </button>
              `}
            </div>

            <button
              data-delete-session="${session.id}"
              title="Delete session from history"
              class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition"
            >
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;
    }).join("");

    // Attach listeners for Resume buttons
    listContainer.querySelectorAll("[data-resume-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-resume-id");
        this.resumeSession(id);
      });
    });

    // Attach listeners for Repeat buttons
    listContainer.querySelectorAll("[data-repeat-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-repeat-id");
        this.repeatSession(id);
      });
    });

    // Attach listeners for deleting single history item
    listContainer.querySelectorAll("[data-delete-session]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-delete-session");
        if (confirm("Delete this session from history?")) {
          Storage.deleteTasbeehSession(id);
          this.render();
          this.app.showToast("Session removed from history");
        }
      });
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  switchView(viewName) {
    this.activeView = viewName;
    const counterSec = document.getElementById("view-counter-section");
    const checklistSec = document.getElementById("view-checklist-section");
    const historySec = document.getElementById("view-history-section");

    const btnCounter = document.getElementById("tab-btn-counter");
    const btnChecklist = document.getElementById("tab-btn-checklist");
    const btnHistory = document.getElementById("tab-btn-history");

    // Hide all
    counterSec?.classList.add("hidden");
    checklistSec?.classList.add("hidden");
    historySec?.classList.add("hidden");

    [btnCounter, btnChecklist, btnHistory].forEach(btn => {
      btn?.classList.remove("bg-emerald-700", "text-white", "shadow-md");
      btn?.classList.add("text-slate-600", "dark:text-slate-300");
    });

    if (viewName === "counter") {
      counterSec?.classList.remove("hidden");
      btnCounter?.classList.add("bg-emerald-700", "text-white", "shadow-md");
      btnCounter?.classList.remove("text-slate-600", "dark:text-slate-300");
    } else if (viewName === "checklist") {
      checklistSec?.classList.remove("hidden");
      btnChecklist?.classList.add("bg-emerald-700", "text-white", "shadow-md");
      btnChecklist?.classList.remove("text-slate-600", "dark:text-slate-300");
      this.renderChecklist();
    } else {
      if (this.currentCount > 0 && !this.isCompletedAlertShown) {
        this.saveCurrentSession(false);
      }
      historySec?.classList.remove("hidden");
      btnHistory?.classList.add("bg-emerald-700", "text-white", "shadow-md");
      btnHistory?.classList.remove("text-slate-600", "dark:text-slate-300");
      this.renderHistoryList();
      this.renderAnalytics();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // Save active session in LocalStorage
  saveCurrentSession(isCompleted = false) {
    if (this.currentCount === 0 && !isCompleted) return;

    if (!this.currentSessionId) {
      this.currentSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }) + " • " + now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    const status = (this.currentCount >= this.currentTarget || isCompleted) ? "completed" : "in_progress";

    const sessionData = {
      id: this.currentSessionId,
      dhikrId: this.activeDhikrId,
      dhikrTitle: this.activeDhikr.title,
      arabic: this.activeDhikr.arabic || "",
      transliteration: this.activeDhikr.transliteration || this.activeDhikr.translation || "",
      completedCount: this.currentCount,
      targetCount: this.currentTarget,
      remainingCount: Math.max(0, this.currentTarget - this.currentCount),
      status: status,
      timestamp: Date.now(),
      formattedDate: formattedDate
    };

    Storage.saveTasbeehSession(sessionData);
    return sessionData;
  }

  // Resume an in-progress session from History
  resumeSession(sessionId) {
    const history = Storage.getTasbeehHistory();
    const session = history.find(s => s.id === sessionId);
    if (!session) return;

    this.activeDhikrId = session.dhikrId;
    this.currentSessionId = session.id;
    this.currentCount = session.completedCount || 0;
    this.currentTarget = session.targetCount || 33;
    this.isCompletedAlertShown = this.currentCount >= this.currentTarget;

    this.activeView = "counter";
    this.render();
    this.app.showToast(`Resumed: ${session.dhikrTitle} (${session.completedCount}/${session.targetCount})`);
  }

  // Repeat a completed session afresh
  repeatSession(sessionId) {
    const history = Storage.getTasbeehHistory();
    const session = history.find(s => s.id === sessionId);
    if (!session) return;

    this.activeDhikrId = session.dhikrId;
    this.currentSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    this.currentCount = 0;
    this.currentTarget = session.targetCount || 33;
    this.isCompletedAlertShown = false;

    this.activeView = "counter";
    this.render();
    this.app.showToast(`Started new session for: ${session.dhikrTitle}`);
  }

  selectDhikr(id) {
    if (this.currentCount > 0 && !this.isCompletedAlertShown) {
      this.saveCurrentSession(false);
    }

    this.activeDhikrId = id;
    this.currentSessionId = null;
    this.initActiveDhikr();

    document.getElementById("active-dhikr-category").textContent = this.activeDhikr.category;
    document.getElementById("active-dhikr-title").textContent = this.activeDhikr.title;
    document.getElementById("active-dhikr-arabic").textContent = this.activeDhikr.arabic || "";
    document.getElementById("active-dhikr-translit").textContent = this.activeDhikr.transliteration ? `"${this.activeDhikr.transliteration}"` : "";
    document.getElementById("active-dhikr-meaning").textContent = this.activeDhikr.translation || "";

    this.updateStatsDisplay();
    this.updateProgressRing();
    this.renderAdhkarList();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  incrementCount(delta = 1) {
    this.currentCount += delta;
    Storage.saveDhikrCount(this.activeDhikrId, this.currentCount);

    sounds.playBeadClick();
    sounds.vibrate(15);

    this.updateStatsDisplay();
    this.updateProgressRing();

    // Check target reached
    if (this.currentCount >= this.currentTarget && !this.isCompletedAlertShown) {
      this.isCompletedAlertShown = true;
      sounds.playCelebrationChime();
      sounds.vibrate([40, 60, 80]);
      this.saveCurrentSession(true);
      this.showCelebrationModal();
    }
  }

  // Direct manual count input (e.g. typing 2,500 at once)
  setManualCount(countVal, isAdd = false) {
    const val = parseInt(countVal);
    if (isNaN(val) || val <= 0) return;

    if (isAdd) {
      this.incrementCount(val);
      this.app.showToast(`Added +${val.toLocaleString()} to count!`);
    } else {
      this.currentCount = val;
      Storage.saveDhikrCount(this.activeDhikrId, this.currentCount);
      this.isCompletedAlertShown = this.currentCount >= this.currentTarget;
      this.updateStatsDisplay();
      this.updateProgressRing();
      this.saveCurrentSession(this.isCompletedAlertShown);
      this.app.showToast(`Total count set to ${val.toLocaleString()}!`);
    }
  }

  updateStatsDisplay() {
    const countEl = document.getElementById("tasbeeh-current-count");
    const remEl = document.getElementById("tasbeeh-remaining-count");
    const statTarget = document.getElementById("stat-target-display");
    const statCompleted = document.getElementById("stat-completed-display");
    const statRemaining = document.getElementById("stat-remaining-display");
    const statPercent = document.getElementById("stat-percent-display");

    const remaining = Math.max(0, this.currentTarget - this.currentCount);
    const percent = Math.min(100, Math.round((this.currentCount / (this.currentTarget || 1)) * 100));

    if (countEl) countEl.textContent = this.currentCount.toLocaleString();
    if (remEl) remEl.textContent = remaining.toLocaleString();

    if (statTarget) statTarget.textContent = this.currentTarget.toLocaleString();
    if (statCompleted) statCompleted.textContent = this.currentCount.toLocaleString();
    if (statRemaining) statRemaining.textContent = remaining.toLocaleString();
    if (statPercent) statPercent.textContent = `${percent}%`;
  }

  resetCount() {
    if (this.currentCount > 0 && !this.isCompletedAlertShown) {
      this.saveCurrentSession(false);
    }

    this.currentCount = 0;
    this.isCompletedAlertShown = false;
    this.currentSessionId = null;
    Storage.saveDhikrCount(this.activeDhikrId, 0);
    this.updateStatsDisplay();
    this.updateProgressRing();
  }

  setTarget(target) {
    this.currentTarget = target;
    document.querySelectorAll(".target-preset-btn").forEach(btn => {
      const bTgt = parseInt(btn.getAttribute("data-target"));
      if (bTgt === target) {
        btn.className = "target-preset-btn px-2.5 py-1 rounded-lg text-xs font-bold transition bg-emerald-700 text-white shadow-sm";
      } else {
        btn.className = "target-preset-btn px-2.5 py-1 rounded-lg text-xs font-bold transition text-slate-600 dark:text-slate-300 hover:text-emerald-600";
      }
    });

    this.isCompletedAlertShown = this.currentCount >= this.currentTarget;
    this.updateStatsDisplay();
    this.updateProgressRing();
  }

  updateProgressRing() {
    const circle = document.getElementById("tasbeeh-svg-progress");
    if (!circle) return;

    const circumference = 2 * Math.PI * 100; // ~628.3
    const progress = Math.min(1, this.currentCount / (this.currentTarget || 1));
    const offset = circumference - progress * circumference;

    circle.style.strokeDashoffset = offset;

    if (progress >= 1) {
      circle.classList.add("stroke-emerald-500");
      circle.classList.remove("stroke-amber-400");
    } else {
      circle.classList.remove("stroke-emerald-500");
      circle.classList.add("stroke-amber-400");
    }
  }

  showCelebrationModal() {
    const modal = document.getElementById("modal-celebration");
    const nameEl = document.getElementById("celeb-dhikr-name");
    if (nameEl) nameEl.textContent = this.activeDhikr.title;
    modal?.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  attachEventListeners() {
    // 3-Way Sub-Navigation switcher
    document.getElementById("tab-btn-counter")?.addEventListener("click", () => this.switchView("counter"));
    document.getElementById("tab-btn-checklist")?.addEventListener("click", () => this.switchView("checklist"));
    document.getElementById("tab-btn-history")?.addEventListener("click", () => this.switchView("history"));

    // Date picker for Checklist
    const habitDateInput = document.getElementById("habit-date-input");
    habitDateInput?.addEventListener("change", (e) => {
      this.selectedHabitDate = e.target.value;
      this.renderChecklist();
      this.updateChecklistHeader();
    });

    document.getElementById("btn-habit-today")?.addEventListener("click", () => {
      this.selectedHabitDate = new Date().toISOString().split("T")[0];
      if (habitDateInput) habitDateInput.value = this.selectedHabitDate;
      this.renderChecklist();
      this.updateChecklistHeader();
    });

    // History Filter Pills
    document.querySelectorAll(".history-filter-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        this.historyFilter = pill.getAttribute("data-history-filter");
        document.querySelectorAll(".history-filter-pill").forEach(p => {
          p.className = "history-filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold transition text-slate-600 dark:text-slate-300";
        });
        pill.className = "history-filter-pill px-3 py-1.5 rounded-lg text-xs font-semibold transition bg-emerald-700 text-white shadow-sm";
        this.renderHistoryList();
      });
    });

    // Clear All History
    document.getElementById("btn-clear-all-history")?.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all history logs?")) {
        Storage.clearTasbeehHistory();
        this.render();
        this.app.showToast("All history logs cleared");
      }
    });

    // Save Progress button
    document.getElementById("btn-save-progress-session")?.addEventListener("click", () => {
      if (this.currentCount === 0) {
        this.app.showToast("Count is 0. Tap the counter or enter counts first!");
        return;
      }
      this.saveCurrentSession(this.currentCount >= this.currentTarget);
      this.app.showToast(`Progress saved (${this.currentCount.toLocaleString()}/${this.currentTarget.toLocaleString()}) to History!`);
    });

    // Tap Zone click
    const tapZone = document.getElementById("tasbeeh-tap-zone");
    tapZone?.addEventListener("click", () => {
      this.incrementCount(1);
    });

    // Manual Input Modal Triggers
    const manualModal = document.getElementById("modal-manual-input");
    document.getElementById("btn-open-manual-input")?.addEventListener("click", () => {
      manualModal?.classList.remove("hidden");
      document.getElementById("input-manual-count-val")?.focus();
    });
    document.getElementById("btn-close-manual-modal")?.addEventListener("click", () => {
      manualModal?.classList.add("hidden");
    });

    // Manual Quick Chips
    document.querySelectorAll(".quick-manual-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const val = parseInt(chip.getAttribute("data-quick-manual"));
        const input = document.getElementById("input-manual-count-val");
        if (input) input.value = val;
      });
    });

    // Manual Input: "Add to Current"
    document.getElementById("btn-manual-add-to-count")?.addEventListener("click", () => {
      const val = parseInt(document.getElementById("input-manual-count-val").value);
      if (val && val > 0) {
        this.setManualCount(val, true);
        manualModal?.classList.add("hidden");
        document.getElementById("input-manual-count-val").value = "";
      }
    });

    // Category pills filter
    document.querySelectorAll(".cat-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        this.activeCategory = pill.getAttribute("data-cat");
        this.render();
      });
    });

    // Preset Target buttons
    document.querySelectorAll(".target-preset-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = parseInt(btn.getAttribute("data-target"));
        this.setTarget(target);
      });
    });

    // Custom Target Modal
    document.getElementById("btn-custom-target")?.addEventListener("click", () => {
      document.getElementById("modal-custom-target")?.classList.remove("hidden");
    });
    document.getElementById("btn-cancel-target-modal")?.addEventListener("click", () => {
      document.getElementById("modal-custom-target")?.classList.add("hidden");
    });
    document.getElementById("btn-save-custom-target")?.addEventListener("click", () => {
      const val = parseInt(document.getElementById("input-custom-target-val").value);
      if (val && val > 0) {
        this.setTarget(val);
        document.getElementById("modal-custom-target")?.classList.add("hidden");
        this.app.showToast(`Target set to ${val.toLocaleString()}`);
      }
    });

    // Reset button
    document.getElementById("btn-reset-counter")?.addEventListener("click", () => {
      if (confirm("Reset current count to zero?")) {
        this.resetCount();
        this.app.showToast("Counter reset");
      }
    });

    // Celebration modal actions
    document.getElementById("btn-celeb-continue")?.addEventListener("click", () => {
      document.getElementById("modal-celebration")?.classList.add("hidden");
    });
    document.getElementById("btn-celeb-reset")?.addEventListener("click", () => {
      document.getElementById("modal-celebration")?.classList.add("hidden");
      this.resetCount();
    });

    // Custom Dhikr Modal triggers
    document.getElementById("btn-open-custom-dhikr-modal")?.addEventListener("click", () => {
      document.getElementById("modal-custom-dhikr")?.classList.remove("hidden");
    });
    document.getElementById("btn-close-custom-modal")?.addEventListener("click", () => {
      document.getElementById("modal-custom-dhikr")?.classList.add("hidden");
    });
    document.getElementById("btn-cancel-custom-dhikr")?.addEventListener("click", () => {
      document.getElementById("modal-custom-dhikr")?.classList.add("hidden");
    });

    // Submit Custom Dhikr Form
    document.getElementById("form-custom-dhikr")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("input-dhikr-title").value.trim();
      const arabic = document.getElementById("input-dhikr-arabic").value.trim();
      const translit = document.getElementById("input-dhikr-translit").value.trim();
      const target = parseInt(document.getElementById("input-dhikr-target").value) || 33;

      if (!title) return;

      const newDhikr = {
        id: `custom_${Date.now()}`,
        category: "custom",
        title,
        arabic,
        transliteration: translit,
        translation: translit,
        target,
        source: "Personal Dhikr"
      };

      Storage.saveCustomDhikr(newDhikr);
      this.customDhikrs = Storage.getCustomDhikrs();
      document.getElementById("modal-custom-dhikr")?.classList.add("hidden");
      document.getElementById("form-custom-dhikr").reset();

      this.activeDhikrId = newDhikr.id;
      this.activeCategory = "custom";
      this.currentSessionId = null;
      this.render();
      this.app.showToast("Custom Dhikr / Dua created!");
    });
  }
}
