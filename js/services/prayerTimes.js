// Prayer Times & Astronomical Engine for Ibadah Daily
// Includes Qibla bearing calculation, Next Prayer countdown, and offline calculations

export const KAABA_COORDINATES = {
  lat: 21.422487,
  lng: 39.826206
};

// Calculate Qibla bearing from any coordinate on Earth
export function calculateQiblaDirection(userLat, userLng) {
  const phi1 = (userLat * Math.PI) / 180;
  const phi2 = (KAABA_COORDINATES.lat * Math.PI) / 180;
  const deltaLambda = ((KAABA_COORDINATES.lng - userLng) * Math.PI) / 180;

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);
  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (qiblaRad * 180) / Math.PI;
  return (qiblaDeg + 360) % 360;
}

// Distance to Kaaba in kilometers using Haversine formula
export function calculateDistanceToMecca(userLat, userLng) {
  const R = 6371; // Earth's radius in km
  const dLat = ((KAABA_COORDINATES.lat - userLat) * Math.PI) / 180;
  const dLon = ((KAABA_COORDINATES.lng - userLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((KAABA_COORDINATES.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Standard astronomical offline prayer time calculations
export function getOfflinePrayerTimes(date, lat, lng, timeZoneOffset = null) {
  if (timeZoneOffset === null) {
    timeZoneOffset = -date.getTimezoneOffset() / 60;
  }

  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();

  // Julian date
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  const julianDate =
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045;

  const D = julianDate - 2451545.0; // days since J2000.0

  // Sun's mean anomaly & longitude
  const g = (357.529 + 0.98560028 * D) % 360;
  const q = (280.459 + 0.98564736 * D) % 360;
  const L = (q + 1.915 * Math.sin((g * Math.PI) / 180) + 0.02 * Math.sin((2 * g * Math.PI) / 180)) % 360;

  // Earth obliquity
  const e = 23.439 - 0.00000036 * D;
  const declination = Math.asin(Math.sin((e * Math.PI) / 180) * Math.sin((L * Math.PI) / 180));
  const RA = (Math.atan2(Math.cos((e * Math.PI) / 180) * Math.sin((L * Math.PI) / 180), Math.cos((L * Math.PI) / 180)) * 180) / Math.PI / 15;

  // Equation of Time
  const EqT = q / 15 - RA;

  // Solar Noon
  const noon = 12 + timeZoneOffset - lng / 15 - EqT;

  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  function hourAngle(alpha) {
    const cosHA = (Math.sin(alpha * rad) - Math.sin(lat * rad) * Math.sin(declination)) /
                  (Math.cos(lat * rad) * Math.cos(declination));
    if (cosHA > 1) return 0;
    if (cosHA < -1) return 180;
    return Math.acos(cosHA) * deg;
  }

  // Fajr: 18 degrees below horizon
  const fajrHA = hourAngle(-18) / 15;
  // Sunrise: 0.833 degrees below horizon
  const sunriseHA = hourAngle(-0.833) / 15;
  // Asr (Shafi'i: shadow length = 1)
  const asrAlt = Math.atan(1 + Math.tan(Math.abs(lat * rad - declination))) * deg;
  const asrHA = hourAngle(asrAlt) / 15;
  // Maghrib: sunset (0.833 degrees)
  const sunsetHA = sunriseHA;
  // Isha: 17 degrees below horizon
  const ishaHA = hourAngle(-17) / 15;

  function toTimeStr(hours) {
    hours = (hours + 24) % 24;
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 || 12;
    return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  }

  function to24TimeStr(hours) {
    hours = (hours + 24) % 24;
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  const fajrH = noon - fajrHA;
  const sunriseH = noon - sunriseHA;
  const dhuhrH = noon + 0.05; // slight delay for zenith passing
  const asrH = noon + asrHA;
  const maghribH = noon + sunsetHA;
  const ishaH = noon + ishaHA;

  return {
    Fajr: toTimeStr(fajrH),
    Sunrise: toTimeStr(sunriseH),
    Dhuhr: toTimeStr(dhuhrH),
    Asr: toTimeStr(asrH),
    Maghrib: toTimeStr(maghribH),
    Isha: toTimeStr(ishaH),
    rawTimes: {
      Fajr: to24TimeStr(fajrH),
      Sunrise: to24TimeStr(sunriseH),
      Dhuhr: to24TimeStr(dhuhrH),
      Asr: to24TimeStr(asrH),
      Maghrib: to24TimeStr(maghribH),
      Isha: to24TimeStr(ishaH)
    }
  };
}

// Fetch live prayer times via Aladhan API with offline calculation fallback
export async function fetchPrayerTimes(lat, lng, date = new Date(), method = 2) {
  const timestamp = Math.floor(date.getTime() / 1000);
  const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=${method}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const timings = data.data.timings;
      const hijri = data.data.date.hijri;

      // Helper to format 24h to 12h
      const format12h = (t24) => {
        const clean = t24.split(" ")[0];
        const [h, m] = clean.split(":").map(Number);
        const period = h >= 12 ? "PM" : "AM";
        const dh = h % 12 || 12;
        return `${dh.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
      };

      return {
        success: true,
        source: "api",
        timings: {
          Fajr: format12h(timings.Fajr),
          Sunrise: format12h(timings.Sunrise),
          Dhuhr: format12h(timings.Dhuhr),
          Asr: format12h(timings.Asr),
          Maghrib: format12h(timings.Maghrib),
          Isha: format12h(timings.Isha),
          rawTimes: {
            Fajr: timings.Fajr.split(" ")[0],
            Sunrise: timings.Sunrise.split(" ")[0],
            Dhuhr: timings.Dhuhr.split(" ")[0],
            Asr: timings.Asr.split(" ")[0],
            Maghrib: timings.Maghrib.split(" ")[0],
            Isha: timings.Isha.split(" ")[0]
          }
        },
        hijriDate: {
          day: hijri.day,
          monthEn: hijri.month.en,
          monthAr: hijri.month.ar,
          year: hijri.year,
          designation: hijri.designation.abbreviated
        }
      };
    }
  } catch (err) {
    console.warn("Aladhan API unreachable or timed out, using astronomical calculation engine:", err.message);
  }

  // Fallback to accurate offline astronomical computation
  const offline = getOfflinePrayerTimes(date, lat, lng);
  return {
    success: true,
    source: "offline_astronomy",
    timings: offline,
    hijriDate: getApproximateHijri(date)
  };
}

// Fallback Hijri Date calculation
export function getApproximateHijri(date) {
  // Approximate Hijri calendar calculation
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth();
  const gregorianDay = date.getDate();

  const jd = Math.floor(367 * gregorianYear - Math.floor((7 * (gregorianYear + Math.floor((gregorianMonth + 9) / 12))) / 4) +
    Math.floor((275 * gregorianMonth) / 9) + gregorianDay - 730530);

  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) +
            (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
  const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) -
             (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const hijriMonth = Math.floor((24 * l3) / 709);
  const hijriDay = l3 - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  const HIJRI_MONTHS = [
    "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
    "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
  ];
  const HIJRI_MONTHS_AR = [
    "المحرّم", "صفر", "ربيع الأول", "ربيع الآخر",
    "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
    "رمضان", "شوّال", "ذو القعدة", "ذو الحجة"
  ];

  const mIndex = Math.max(0, Math.min(11, hijriMonth - 1));

  return {
    day: hijriDay,
    monthEn: HIJRI_MONTHS[mIndex] || "Rabi' al-Awwal",
    monthAr: HIJRI_MONTHS_AR[mIndex] || "ربيع الأول",
    year: hijriYear || 1448,
    designation: "AH"
  };
}

// Calculate the active prayer and next prayer with countdown
export function getPrayerTimeline(rawTimes) {
  if (!rawTimes) return null;

  const now = new Date();
  const prayerNames = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

  const todayPrayers = prayerNames.map(name => {
    const [h, m] = (rawTimes[name] || "00:00").split(":").map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return { name, date, timeStr: rawTimes[name] };
  });

  // Find next prayer
  let nextPrayer = null;
  let currentPrayer = todayPrayers[todayPrayers.length - 1]; // default Isha if past

  for (let i = 0; i < todayPrayers.length; i++) {
    if (now < todayPrayers[i].date) {
      nextPrayer = todayPrayers[i];
      currentPrayer = i > 0 ? todayPrayers[i - 1] : { name: "Isha", date: new Date(todayPrayers[todayPrayers.length - 1].date.getTime() - 86400000) };
      break;
    }
  }

  // If now is after Isha, next prayer is tomorrow's Fajr
  if (!nextPrayer) {
    const tomorrowFajr = new Date(todayPrayers[0].date.getTime() + 86400000);
    nextPrayer = { name: "Fajr", date: tomorrowFajr, timeStr: rawTimes["Fajr"] };
    currentPrayer = todayPrayers[todayPrayers.length - 1];
  }

  const diffMs = nextPrayer.date - now;
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    current: currentPrayer.name,
    next: nextPrayer.name,
    nextTime: nextPrayer.timeStr,
    countdown: {
      hours,
      minutes,
      seconds,
      formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
  };
}
