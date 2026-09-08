# 🌙 Ibadah Daily - Islamic Companion Application

A clean, modern, and aesthetically pleasing Islamic companion application built with an emerald green and soft gold theme, light/dark mode support, and an intuitive mobile-first bottom navigation bar.

---

## 🌟 Key Features

### 1. 🏠 Home / Prayer Times (Icon: Clock / Home)
- **Daily Prayer Times**: Accurate calculation for **Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha** based on current location or chosen city.
- **Live Countdown**: Dynamic countdown timer (Hours, Minutes, Seconds) to the next prayer, with active prayer highlighting.
- **Verse/Hadith of the Day**: Daily Quran Ayah and Authentic Hadith cards with Arabic script, transliteration, English translation, and copy/share buttons.
- **Custom Daily Notifications & Reminders**:
  - Reminders for each individual prayer time (Fajr, Dhuhr, Asr, Maghrib, Isha).
  - Daily Dhikr reminders with customizable morning & evening alert times.
  - Browser push notification support with a built-in test alert.

### 2. 📖 Quran (Icon: Book / Quran)
- **All 114 Surahs**: Directory with Arabic calligraphy, transliteration, English meanings, revelation type (Meccan / Medinan), and ayah counts.
- **Search & Filter**: Instant search by Surah name, number, or translation, plus Meccan/Medinan filter pills.
- **Clean Reader View**: Clear Uthmani Arabic script alongside English translation, ornamental verse markers (`۝`), and font size controls.
- **Audio Recitations**: High-quality audio recitations (Mishary Rashid Alafasy) with floating bottom player bar, play/pause, seek, and auto-scroll highlighting of the current active verse.

### 3. 📊 Activities & Tasbeeh Tracker (Icon: Activity / Bar Chart) [MAIN FEATURE]
- **Live Dynamic Tracker**:
  - Circular SVG progress ring with tactile tap zone and acoustic bead click.
  - Stats display: **Total Target**, **Completed Count**, **Remaining Count**, and **Percentage Progress Bar**.
- **Manual Count Input**:
  - Direct numeric input field to enter large counts completed manually (e.g. typing 2,500 at once).
  - Actions: **"Add to Current Count (+N)"** or **"Set Total Exactly to (N)"**.
  - Quick addition chips (`+33`, `+100`, `+500`, `+1000`, `+2500`).
- **Flexible Custom Targets**: Quick presets (33, 99, 100, 1000) or any custom target up to 1,000,000.
- **Custom Dhikr Addition**: Add any personalized Dhikr/Dua title, Arabic script, transliteration, and target count.
- **Daily Habit Checklist**:
  - Checkboxes for the **5 Obligatory Prayers** (Fajr, Dhuhr, Asr, Maghrib, Isha).
  - Checkboxes for **Sunnah & Daily Spiritual Deeds** (Tahajjud/Qiyam, Duha, Morning Adhkar, Evening Adhkar, Daily Quran Reading, Sadaqah/Charity).
  - Date switcher (Today or any past date) with live completion ratio (e.g. `8/11 Completed • 72%`).
- **Activity History & Status Log**:
  - **Status Badges**: `Completed` (Emerald green badge) and `In Progress` (Amber badge showing remaining counts).
  - **1-Click Resume**: Tap "Resume Session" on any In Progress entry to immediately continue counting from where you left off.
  - **Weekly Overview Bar Chart**: Visual 7-day bar chart showing recitations and habit completions per day.
  - **Monthly Analytics Cards**: Month's total recitations, completed sessions, active day streak 🔥, and daily average.

### 4. 🧭 Qibla (Icon: Compass / Kaaba)
- **Accurate Mathematical Bearing**: Computes Great Circle azimuth to the Holy Kaaba ($21.4225^\circ\text{ N}, 39.8262^\circ\text{ E}$) from your exact coordinates.
- **Real-Time Compass**: Responds to device orientation sensors (`DeviceOrientationEvent` / `webkitCompassHeading`) on mobile devices.
- **Visual Feedback & Golden Cue**: Compass dial turns glowing gold with haptic feedback when aligned within $\pm 3^\circ$ of Mecca.
- **Mecca Distance**: Shows exact distance in kilometers and cardinal bearing (e.g. $295^\circ\text{ WNW}$).
- **Desktop Simulation Mode**: Includes interactive rotation slider for devices without magnetic sensors.

### 5. 🕌 Masjid Locator (Icon: Mosque / Map Pin)
- **Interactive Map**: Built using Leaflet.js with custom emerald pins and user location marker.
- **Nearby Mosques**: Scans for nearby Masjids within customizable radii (3 km, 5 km, 10 km).
- **Navigation**: Direct one-click **"Directions in Google Maps"** button for easy turn-by-turn navigation.
- **Focus Mode**: Tap any mosque card to pan and zoom directly to it on the interactive map.

---

## 🎨 Design & Aesthetic
- **Color Palette**:
  - Emerald Green (`#064e3b`, `#059669`)
  - Soft Gold Accents (`#d97706`, `#f59e0b`, `#fbbf24`)
  - Warm Parchment Light Mode (`#fbfbf9`)
  - Midnight Emerald Slate Dark Mode (`#091312`)
- **Typography**: Google Fonts *Amiri* & *Scheherazade New* for authentic Arabic calligraphy; *Plus Jakarta Sans* for modern Latin text.
- **Persistence**: Saves all user progress, target counts, custom Dhikrs, and theme settings to `localStorage`.

---

## 🚀 How to Run

### Option 1: Double-Click Launcher (Windows)
Double-click `start_app.bat` to automatically start the local server and open `http://localhost:8080/index.html` in your default browser.

### Option 2: Python Command
Run in terminal:
```bash
python serve.py
```
or
```bash
python -m http.server 8080
```
Then open [http://localhost:8080](http://localhost:8080) in your browser.
