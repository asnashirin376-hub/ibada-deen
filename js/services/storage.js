// LocalStorage Management Service for Ibadah Daily
const STORAGE_KEYS = {
  THEME: "ibadah_theme",
  TASBEEH_STATE: "ibadah_tasbeeh_state",
  CUSTOM_DHIKRS: "ibadah_custom_dhikrs",
  DHIKR_COUNTS: "ibadah_dhikr_counts",
  BOOKMARKS: "ibadah_bookmarks",
  LAST_READ: "ibadah_last_read",
  SETTINGS: "ibadah_settings",
  LOCATION: "ibadah_location",
  AUDIO_SETTINGS: "ibadah_audio_settings",
  HISTORY: "ibadah_tasbeeh_history",
  NOTIFICATIONS: "ibadah_notifications",
  HABITS: "ibadah_daily_habits"
};

export const Storage = {
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || "light";
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getSettings() {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : {
      sound: true,
      vibrate: true,
      calcMethod: 2, // ISNA
      madhab: "Shafi",
      arabicFontSize: 26,
      translationFontSize: 15
    };
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getLocation() {
    const saved = localStorage.getItem(STORAGE_KEYS.LOCATION);
    return saved ? JSON.parse(saved) : {
      lat: 21.4225, // Fallback to Mecca
      lng: 39.8262,
      cityName: "Makkah Al-Mukarramah",
      country: "Saudi Arabia",
      isAuto: false
    };
  },

  saveLocation(location) {
    localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(location));
  },

  getCustomDhikrs() {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_DHIKRS);
    return saved ? JSON.parse(saved) : [];
  },

  saveCustomDhikr(dhikr) {
    const dhikrs = this.getCustomDhikrs();
    dhikrs.unshift(dhikr);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_DHIKRS, JSON.stringify(dhikrs));
    return dhikrs;
  },

  deleteCustomDhikr(id) {
    let dhikrs = this.getCustomDhikrs();
    dhikrs = dhikrs.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_DHIKRS, JSON.stringify(dhikrs));
    return dhikrs;
  },

  getDhikrCounts() {
    const saved = localStorage.getItem(STORAGE_KEYS.DHIKR_COUNTS);
    return saved ? JSON.parse(saved) : {};
  },

  saveDhikrCount(dhikrId, count) {
    const counts = this.getDhikrCounts();
    counts[dhikrId] = count;
    localStorage.setItem(STORAGE_KEYS.DHIKR_COUNTS, JSON.stringify(counts));
  },

  getTasbeehActive() {
    const saved = localStorage.getItem(STORAGE_KEYS.TASBEEH_STATE);
    return saved ? JSON.parse(saved) : {
      activeId: "s_1",
      customTarget: 33,
      totalLifetimeCount: 0
    };
  },

  saveTasbeehActive(state) {
    localStorage.setItem(STORAGE_KEYS.TASBEEH_STATE, JSON.stringify(state));
  },

  getBookmarks() {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return saved ? JSON.parse(saved) : [];
  },

  toggleBookmark(bookmark) {
    let bookmarks = this.getBookmarks();
    const index = bookmarks.findIndex(b => b.surah === bookmark.surah && b.ayah === bookmark.ayah);
    if (index >= 0) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.unshift(bookmark);
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    return bookmarks;
  },

  getLastRead() {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_READ);
    return saved ? JSON.parse(saved) : { surahNumber: 1, surahName: "Al-Fatihah", ayahNumber: 1 };
  },

  setLastRead(surahNumber, surahName, ayahNumber) {
    localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify({ surahNumber, surahName, ayahNumber }));
  },

  getTasbeehHistory() {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : [];
  },

  saveTasbeehSession(session) {
    const history = this.getTasbeehHistory();
    // Check if session with the same id exists to update it, else prepend
    const existingIndex = history.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
      history[existingIndex] = { ...history[existingIndex], ...session };
    } else {
      history.unshift(session);
    }
    // Limit to 150 items to keep storage performant
    if (history.length > 150) {
      history.pop();
    }
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    return history;
  },

  deleteTasbeehSession(sessionId) {
    let history = this.getTasbeehHistory();
    history = history.filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    return history;
  },

  clearTasbeehHistory() {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    return [];
  },

  getNotificationSettings() {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : {
      enabled: false,
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
      morningDhikr: true,
      eveningDhikr: true,
      morningTime: "06:30",
      eveningTime: "17:30"
    };
  },

  saveNotificationSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(settings));
  },

  getAllDailyHabits() {
    const saved = localStorage.getItem(STORAGE_KEYS.HABITS);
    return saved ? JSON.parse(saved) : {};
  },

  getDailyHabits(dateKey) {
    const all = this.getAllDailyHabits();
    return all[dateKey] || {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
      morningAdhkar: false,
      eveningAdhkar: false,
      tahajjud: false,
      duha: false,
      quran: false,
      sadaqah: false
    };
  },

  saveDailyHabits(dateKey, habits) {
    const all = this.getAllDailyHabits();
    all[dateKey] = habits;
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(all));
  },

  getWeeklyAnalytics() {
    const history = this.getTasbeehHistory();
    const habitsAll = this.getAllDailyHabits();
    const result = [];

    // Calculate last 7 days from today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

      // Sum counts for sessions on this day
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 86400000;
      const daySessions = history.filter(s => s.timestamp >= dayStart && s.timestamp < dayEnd);
      const totalCount = daySessions.reduce((sum, s) => sum + (s.completedCount || 0), 0);

      // Habits done
      const dayHabits = habitsAll[dateKey] || {};
      const habitsCompleted = Object.values(dayHabits).filter(Boolean).length;

      result.push({
        dateKey,
        dayLabel,
        totalCount,
        habitsCompleted,
        sessionsCount: daySessions.length
      });
    }

    return result;
  },

  getMonthlyAnalytics() {
    const history = this.getTasbeehHistory();
    const habitsAll = this.getAllDailyHabits();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const monthStart = new Date(currentYear, currentMonth, 1).getTime();
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).getTime();

    const monthSessions = history.filter(s => s.timestamp >= monthStart && s.timestamp <= monthEnd);
    const totalRecitations = monthSessions.reduce((sum, s) => sum + (s.completedCount || 0), 0);
    const completedSessions = monthSessions.filter(s => s.status === "completed").length;

    // Calculate streak
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 86400000;

      const hasSession = history.some(s => s.timestamp >= dayStart && s.timestamp < dayEnd);
      const habits = habitsAll[dateKey];
      const hasHabits = habits && Object.values(habits).some(Boolean);

      if (hasSession || hasHabits) {
        streak++;
      } else if (i > 0) {
        break; // Streak broken
      }
    }

    return {
      monthName: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      totalRecitations,
      totalSessions: monthSessions.length,
      completedSessions,
      activeStreak: streak,
      dailyAverage: Math.round(totalRecitations / Math.max(1, now.getDate()))
    };
  }
};
