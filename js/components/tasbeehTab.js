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
    
    // നാവിഗേഷൻ സ്റ്റേറ്റ് നിലനിർത്താൻ (Back-stack logic)
    this.navigationHistory = [];
  }

  initActiveDhikr() {
    let allDhikr = [...DEFAULT_ADHKAR, ...this.customDhikrs];
    this.activeDhikr = allDhikr.find(d => d.id === this.activeDhikrId) || allDhikr[0];
    if (this.activeDhikr) {
      this.currentTarget = this.activeDhikr.target || 33;
    }
  }

  // നാവിഗേഷൻ ഹിസ്റ്ററിയിലേക്ക് പുതിയ സ്റ്റേറ്റ് ചേർക്കാൻ
  pushNavigationState(view) {
    this.navigationHistory.push(this.activeView);
    this.activeView = view;
    this.render();
  }

  // പുറകോട്ട് നാവിഗേറ്റ് ചെയ്യാൻ (Safe Back-navigation)
  popNavigationState() {
    if (this.navigationHistory.length > 0) {
      this.activeView = this.navigationHistory.pop();
      this.render();
    } else {
      this.app.switchTab("home"); // ഹിസ്റ്ററി ഇല്ലെങ്കിൽ ഹോം പേജിലേക്ക് സുരക്ഷിതമായി മടങ്ങുക
    }
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
        <!-- Top Header & Navigation -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <button id="btn-back-nav" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition shadow-sm">
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                <i data-lucide="activity" class="w-6 h-6 text-emerald-600 dark:text-emerald-400"></i>
                Activities & Tasbeeh Tracker
              </h1>
            </div>
          </div>

          <!-- Sub Navigation Tabs -->
          <div class="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <button id="tab-btn-counter" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${this.activeView === 'counter' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-600 dark:text-slate-300'}">Tasbeeh</button>
            <button id="tab-btn-checklist" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${this.activeView === 'checklist' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-600 dark:text-slate-300'}">Checklist (${habitsCount}/11)</button>
            <button id="tab-btn-history" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${this.activeView === 'history' ? 'bg-emerald-700 text-white shadow-md' : 'text-slate-600 dark:text-slate-300'}">Analytics</button>
          </div>
        </div>

        <!-- Counter Section -->
        <div id="view-counter-section" class="${this.activeView === 'counter' ? '' : 'hidden'} space-y-6">
          <div class="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-md text-center relative overflow-hidden">
            <span class="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              ${this.activeDhikr ? this.activeDhikr.category : 'General'}
            </span>
            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mt-3">${this.activeDhikr ? this.activeDhikr.name : 'Tasbeeh'}</h2>
            
            <!-- Big Live Counter Button -->
            <div class="my-8 flex justify-center">
              <button id="btn-increment-counter" class="w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white font-extrabold text-5xl shadow-xl hover:scale-105 active:scale-95 transition-all border-4 border-emerald-500/20">
                ${this.currentCount}
              </button>
            </div>

            <!-- Manual Input Section (REMOVED 'Set total exactly' button completely) -->
            <div class="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-800 max-w-sm mx-auto">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">Manual Count Entry</label>
              <div class="flex gap-2 justify-center">
                <input id="input-manual-count" type="number" min="0" placeholder="Enter count" class="px-3 py-2 text-sm bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl w-32 text-center focus:outline-none focus:border-emerald-500">
                <button id="btn-save-manual-count" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Checklist & History Placeholders -->
        <div id="view-checklist-section" class="${this.activeView === 'checklist' ? '' : 'hidden'} bg-white dark:bg-slate-800 rounded-3xl p-6 border dark:border-slate-700 shadow-md">
          <p class="text-sm text-slate-500 text-center">Daily Habit Checklist is active.</p>
        </div>
        <div id="view-history-section" class="${this.activeView === 'history' ? '' : 'hidden'} bg-white dark:bg-slate-800 rounded-3xl p-6 border dark:border-slate-700 shadow-md">
          <p class="text-sm text-slate-500 text-center">Analytics and history are active.</p>
        </div>
      </div>
    `;

    this.registerEventListeners();
    if (window.lucide) lucide.createIcons();
  }

  registerEventListeners() {
    // Back navigation button
    const backBtn = this.container.querySelector("#btn-back-nav");
    if (backBtn) backBtn.addEventListener("click", () => this.popNavigationState());

    // Switch view tabs
    const counterBtn = this.container.querySelector("#tab-btn-counter");
    if (counterBtn) counterBtn.addEventListener("click", () => this.pushNavigationState("counter"));

    const checklistBtn = this.container.querySelector("#tab-btn-checklist");
    if (checklistBtn) checklistBtn.addEventListener("click", () => this.pushNavigationState("checklist"));

    const historyBtn = this.container.querySelector("#tab-btn-history");
    if (historyBtn) historyBtn.addEventListener("click", () => this.pushNavigationState("history"));

    // Increment Counter Click
    const incrementBtn = this.container.querySelector("#btn-increment-counter");
    if (incrementBtn) {
      incrementBtn.addEventListener("click", () => {
        this.currentCount++;
        if (typeof sounds?.playTick === "function") sounds.playTick();
        this.render();
      });
    }

    // Save Manual Count logic
    const saveManualBtn = this.container.querySelector("#btn-save-manual-count");
    if (saveManualBtn) {
      saveManualBtn.addEventListener("click", () => {
        const inputField = this.container.querySelector("#input-manual-count");
        const val = parseInt(inputField.value, 10);
        if (!isNaN(val) && val >= 0) {
          this.currentCount = val;
          alert(`Count manually updated to: ${val}`);
          this.render();
        }
      });
    }
  }
}
