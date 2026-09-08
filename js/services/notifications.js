// Notification Service for Prayer Times & Daily Dhikr Reminders
import { Storage } from "./storage.js";

class NotificationService {
  constructor() {
    this.checkInterval = null;
  }

  isSupported() {
    return "Notification" in window;
  }

  getPermission() {
    if (!this.isSupported()) return "denied";
    return Notification.permission;
  }

  async requestPermission() {
    if (!this.isSupported()) {
      return "unsupported";
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.warn("Notification request failed:", err);
      return "denied";
    }
  }

  sendNotification(title, options = {}) {
    if (this.getPermission() !== "granted") return;

    const defaultOptions = {
      icon: "https://cdn-icons-png.flaticon.com/512/3233/3233514.png",
      badge: "https://cdn-icons-png.flaticon.com/512/3233/3233514.png",
      vibrate: [200, 100, 200],
      ...options
    };

    try {
      new Notification(title, defaultOptions);
    } catch (e) {
      console.warn("Error triggering notification:", e);
    }
  }

  startScheduler(prayerTimingsGetter) {
    if (this.checkInterval) clearInterval(this.checkInterval);

    // Check once every minute
    this.checkInterval = setInterval(() => {
      this.checkScheduledReminders(prayerTimingsGetter);
    }, 60000);
  }

  checkScheduledReminders(prayerTimingsGetter) {
    const settings = Storage.getNotificationSettings();
    if (!settings.enabled || this.getPermission() !== "granted") return;

    const now = new Date();
    const currentH = now.getHours().toString().padStart(2, "0");
    const currentM = now.getMinutes().toString().padStart(2, "0");
    const currentTimeStr = `${currentH}:${currentM}`;

    // 1. Check Prayer Times
    if (prayerTimingsGetter) {
      const timings = prayerTimingsGetter();
      if (timings && timings.rawTimes) {
        const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
        prayers.forEach(prayer => {
          const settingKey = prayer.toLowerCase();
          if (settings[settingKey] && timings.rawTimes[prayer] === currentTimeStr) {
            this.sendNotification(`🕌 Prayer Time: ${prayer}`, {
              body: `It is now time for ${prayer} prayer. Hayya 'alas-Salah!`,
              tag: `prayer_${prayer}_${currentTimeStr}`
            });
          }
        });
      }
    }

    // 2. Check Morning Dhikr
    if (settings.morningDhikr && settings.morningTime === currentTimeStr) {
      this.sendNotification("🌅 Morning Adhkar Reminder", {
        body: "Begin your day with the remembrance of Allah. Read your morning Adhkar in Ibadah Daily.",
        tag: `dhikr_morning_${currentTimeStr}`
      });
    }

    // 3. Check Evening Dhikr
    if (settings.eveningDhikr && settings.eveningTime === currentTimeStr) {
      this.sendNotification("🌇 Evening Adhkar Reminder", {
        body: "Protect your evening and night with the evening Adhkar in Ibadah Daily.",
        tag: `dhikr_evening_${currentTimeStr}`
      });
    }
  }
}

export const notificationService = new NotificationService();
