// Quran API & Audio Recitations Service
// Provides live API fetching with reliable CDN audio streaming and offline caching

const BASE_API = "https://api.alquran.cloud/v1";
const AUDIO_CDN_BASE = "https://everyayah.com/data/Alafasy_128kbps";

// Embedded fallback data for short & frequently read Surahs to guarantee instant offline reading
const OFFLINE_SURAHS = {
  1: {
    number: 1,
    name: "سورة الفاتحة",
    englishName: "Al-Fatihah",
    englishNameTranslation: "The Opening",
    revelationType: "Meccan",
    ayahs: [
      { number: 1, numberInSurah: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
      { number: 2, numberInSurah: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "[All] praise is [due] to Allah, Lord of the worlds -" },
      { number: 3, numberInSurah: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ", translation: "The Entirely Merciful, the Especially Merciful," },
      { number: 4, numberInSurah: 4, text: "مَالِكِ يَوْمِ الدِّينِ", translation: "Sovereign of the Day of Recompense." },
      { number: 5, numberInSurah: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "It is You we worship and You we ask for help." },
      { number: 6, numberInSurah: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Guide us to the straight path -" },
      { number: 7, numberInSurah: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray." }
    ]
  },
  112: {
    number: 112,
    name: "سورة الإخلاص",
    englishName: "Al-Ikhlas",
    englishNameTranslation: "The Sincerity",
    revelationType: "Meccan",
    ayahs: [
      { number: 1, numberInSurah: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation: "Say, 'He is Allah, [who is] One," },
      { number: 2, numberInSurah: 2, text: "اللَّهُ الصَّمَدُ", translation: "Allah, the Eternal Refuge." },
      { number: 3, numberInSurah: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation: "He neither begets nor is born," },
      { number: 4, numberInSurah: 4, text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", translation: "Nor is there to Him any equivalent.'" }
    ]
  },
  113: {
    number: 113,
    name: "سورة الفلق",
    englishName: "Al-Falaq",
    englishNameTranslation: "The Daybreak",
    revelationType: "Meccan",
    ayahs: [
      { number: 1, numberInSurah: 1, text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", translation: "Say, 'I seek refuge in the Lord of daybreak" },
      { number: 2, numberInSurah: 2, text: "مِن شَرِّ مَا خَلَقَ", translation: "From the evil of that which He created" },
      { number: 3, numberInSurah: 3, text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", translation: "And from the evil of darkness when it settles" },
      { number: 4, numberInSurah: 4, text: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", translation: "And from the evil of the blowers in knots" },
      { number: 5, numberInSurah: 5, text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", translation: "And from the evil of an envier when he envies.'" }
    ]
  },
  114: {
    number: 114,
    name: "سورة الناس",
    englishName: "An-Nas",
    englishNameTranslation: "Mankind",
    revelationType: "Meccan",
    ayahs: [
      { number: 1, numberInSurah: 1, text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", translation: "Say, 'I seek refuge in the Lord of mankind," },
      { number: 2, numberInSurah: 2, text: "مَلِكِ النَّاسِ", translation: "The Sovereign of mankind," },
      { number: 3, numberInSurah: 3, text: "إِلَٰهِ النَّاسِ", translation: "The God of mankind," },
      { number: 4, numberInSurah: 4, text: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", translation: "From the evil of the retreating whisperer -" },
      { number: 5, numberInSurah: 5, text: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", translation: "Who whispers into the breasts of mankind -" },
      { number: 6, numberInSurah: 6, text: "مِنَ الْجِنَّةِ وَالنَّاسِ", translation: "From among the jinn and mankind.'" }
    ]
  }
};

// Local storage caching mechanism for fetched Surahs
const cacheSurah = (surahNum, data) => {
  try {
    sessionStorage.setItem(`surah_${surahNum}`, JSON.stringify(data));
  } catch (e) {
    // Session storage full or disabled
  }
};

const getCachedSurah = (surahNum) => {
  try {
    const raw = sessionStorage.getItem(`surah_${surahNum}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

// Fetch full Surah content (Arabic text + Sahih International English translation)
export async function getSurahDetails(surahNumber) {
  // Check cache first
  const cached = getCachedSurah(surahNumber);
  if (cached) return cached;

  // Try API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${BASE_API}/surah/${surahNumber}/editions/quran-uthmani,en.sahih`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      const arabicEd = json.data[0];
      const englishEd = json.data[1];

      const combined = {
        number: arabicEd.number,
        name: arabicEd.name,
        englishName: arabicEd.englishName,
        englishNameTranslation: arabicEd.englishNameTranslation,
        revelationType: arabicEd.revelationType,
        numberOfAyahs: arabicEd.numberOfAyahs,
        ayahs: arabicEd.ayahs.map((ayah, i) => ({
          number: ayah.number,
          numberInSurah: ayah.numberInSurah,
          text: ayah.text,
          translation: englishEd.ayahs[i] ? englishEd.ayahs[i].text : ""
        }))
      };

      cacheSurah(surahNumber, combined);
      return combined;
    }
  } catch (err) {
    console.warn("Could not fetch Surah from API, checking fallback:", err);
  }

  // Fallback to offline data if available
  if (OFFLINE_SURAHS[surahNumber]) {
    return OFFLINE_SURAHS[surahNumber];
  }

  throw new Error(`Surah ${surahNumber} is not currently available offline. Please check your internet connection.`);
}

// Generate EveryAyah standard audio URL for Alafasy
// Format: {surahPad3}{ayahPad3}.mp3, e.g. 001001.mp3
export function getAyahAudioUrl(surahNumber, ayahNumberInSurah) {
  const sStr = surahNumber.toString().padStart(3, "0");
  const aStr = ayahNumberInSurah.toString().padStart(3, "0");
  return `${AUDIO_CDN_BASE}/${sStr}${aStr}.mp3`;
}

// Audio Player Controller singleton
class QuranAudioPlayer {
  constructor() {
    this.audio = new Audio();
    this.currentSurah = null;
    this.currentAyah = null;
    this.isPlaying = false;
    this.playlist = [];
    this.playlistIndex = 0;
    this.onStateChangeCallbacks = [];

    this.audio.addEventListener("timeupdate", () => {
      this.notifyState({
        type: "timeupdate",
        currentTime: this.audio.currentTime,
        duration: this.audio.duration || 0
      });
    });

    this.audio.addEventListener("ended", () => {
      this.playNext();
    });

    this.audio.addEventListener("error", (e) => {
      console.warn("Audio playback error:", e);
      this.isPlaying = false;
      this.notifyState({ type: "error", message: "Audio could not be loaded." });
    });

    this.audio.addEventListener("pause", () => {
      this.isPlaying = false;
      this.notifyState({ type: "pause" });
    });

    this.audio.addEventListener("play", () => {
      this.isPlaying = true;
      this.notifyState({ type: "play" });
    });
  }

  subscribe(callback) {
    this.onStateChangeCallbacks.push(callback);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(c => c !== callback);
    };
  }

  notifyState(event = {}) {
    const state = {
      isPlaying: this.isPlaying,
      currentSurah: this.currentSurah,
      currentAyah: this.currentAyah,
      currentTime: this.audio.currentTime,
      duration: this.audio.duration || 0,
      ...event
    };
    this.onStateChangeCallbacks.forEach(cb => cb(state));
  }

  playAyah(surahNumber, ayahNumberInSurah, surahName = "") {
    this.currentSurah = { number: surahNumber, name: surahName };
    this.currentAyah = ayahNumberInSurah;
    const url = getAyahAudioUrl(surahNumber, ayahNumberInSurah);
    this.audio.src = url;
    this.audio.play().catch(e => {
      console.warn("Audio autoplay prevented or error:", e);
    });
    this.notifyState({ type: "start" });
  }

  playSurah(surahNumber, surahName, totalAyahs, startAyah = 1) {
    this.playlist = [];
    for (let i = startAyah; i <= totalAyahs; i++) {
      this.playlist.push({
        surahNumber,
        surahName,
        ayahNumber: i
      });
    }
    this.playlistIndex = 0;
    this.playCurrentInPlaylist();
  }

  playCurrentInPlaylist() {
    if (this.playlistIndex >= this.playlist.length) {
      this.stop();
      return;
    }
    const item = this.playlist[this.playlistIndex];
    this.playAyah(item.surahNumber, item.ayahNumber, item.surahName);
  }

  playNext() {
    if (this.playlist.length > 0 && this.playlistIndex < this.playlist.length - 1) {
      this.playlistIndex++;
      this.playCurrentInPlaylist();
    } else {
      this.stop();
    }
  }

  playPrevious() {
    if (this.playlist.length > 0 && this.playlistIndex > 0) {
      this.playlistIndex--;
      this.playCurrentInPlaylist();
    }
  }

  togglePlayPause() {
    if (this.audio.src) {
      if (this.isPlaying) {
        this.audio.pause();
      } else {
        this.audio.play();
      }
    }
  }

  seek(percentage) {
    if (this.audio.duration) {
      this.audio.currentTime = (percentage / 100) * this.audio.duration;
    }
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
    this.playlist = [];
    this.notifyState({ type: "stop" });
  }
}

export const quranAudio = new QuranAudioPlayer();
