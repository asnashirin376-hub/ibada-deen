// Preloaded Daily Adhkar data grouped by categories
export const ADHKAR_CATEGORIES = [
  { id: "all", name: "All Adhkar", icon: "sparkles" },
  { id: "morning", name: "Morning (الصباح)", icon: "sunrise" },
  { id: "evening", name: "Evening (المساء)", icon: "sunset" },
  { id: "salah", name: "After Prayer (بعد الصلاة)", icon: "activity" },
  { id: "sleep", name: "Before Sleep (النوم)", icon: "moon" },
  { id: "praise", name: "Praise & Istighfar", icon: "heart" }
];

export const DEFAULT_ADHKAR = [
  // Morning Adhkar
  {
    id: "m_1",
    category: "morning",
    title: "Morning Affirmation of Faith",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Asbahna wa-asbahal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa-lahul-hamdu wa-huwa 'ala kulli shay'in qadeer.",
    translation: "We have entered the morning and kingdom belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah alone, without partner. To Him belongs kingdom and praise, and He is over all things capable.",
    target: 1,
    source: "Sahih Muslim"
  },
  {
    id: "m_2",
    category: "morning",
    title: "Sayyidul Istighfar (Chief of Forgiveness)",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ",
    transliteration: "Allahumma Anta Rabbi, la ilaha illa Anta, khalaqtani wa-ana 'abduka, wa-ana 'ala 'ahdika wa-wa'dika mastata'tu, a'oodhu bika min sharri ma sana'tu, aboo'u laka bini'matika 'alayya, wa-aboo'u bidhanbi faghfir li, fa-innahu la yaghfirudh-dhunooba illa Anta.",
    translation: "O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favors upon me and I confess my sins, so forgive me, for none can forgive sins except You.",
    target: 1,
    source: "Sahih Al-Bukhari"
  },
  {
    id: "m_3",
    category: "morning",
    title: "Protection Against All Harm",
    arabic: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa-la fis-sama'i wa-huwas-Samee'ul-'Aleem.",
    translation: "In the Name of Allah with Whose Name nothing can harm on earth nor in the heavens, and He is the All-Hearing, the All-Knowing.",
    target: 3,
    source: "At-Tirmidhi & Abu Dawood"
  },
  {
    id: "m_4",
    category: "morning",
    title: "Seeking Well-being & Steadfastness",
    arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    transliteration: "Ya Hayyu Ya Qayyoom, bi-rahmatika astagheeth, aslih li sha'nee kullahu, wa-la takilnee ila nafsee tarfata 'ayn.",
    translation: "O Ever-Living, O Sustainer of all existence, by Your mercy I seek assistance. Rectify for me all of my affairs and do not leave me to myself even for the blink of an eye.",
    target: 1,
    source: "Al-Hakim"
  },

  // Evening Adhkar
  {
    id: "e_1",
    category: "evening",
    title: "Evening Affirmation of Faith",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Amsayna wa-amsal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa-lahul-hamdu wa-huwa 'ala kulli shay'in qadeer.",
    translation: "We have reached the evening and the kingdom belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah alone, without partner. To Him belongs kingdom and praise, and He is over all things capable.",
    target: 1,
    source: "Sahih Muslim"
  },
  {
    id: "e_2",
    category: "evening",
    title: "Refuge in the Perfect Words of Allah",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'oodhu bi-kalimatil-lahit-tammati min sharri ma khalaq.",
    translation: "I seek refuge in the perfect words of Allah from the evil of that which He created.",
    target: 3,
    source: "Sahih Muslim"
  },
  {
    id: "e_3",
    category: "evening",
    title: "Plea for Guidance and Protection",
    arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ",
    transliteration: "Allahumma 'afini fee badanee, Allahumma 'afini fee sam'ee, Allahumma 'afini fee basaree, la ilaha illa Anta.",
    translation: "O Allah, grant my body health; O Allah, grant my hearing health; O Allah, grant my sight health. There is no deity except You.",
    target: 3,
    source: "Abu Dawood"
  },

  // After Salah (Post-Prayer)
  {
    id: "s_1",
    category: "salah",
    title: "SubhanAllah (Glory be to Allah)",
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "Subhan Allah",
    translation: "Glory be to Allah",
    target: 33,
    source: "Sahih Muslim"
  },
  {
    id: "s_2",
    category: "salah",
    title: "Alhamdulillah (All praise to Allah)",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Al-hamdulillah",
    translation: "All praise belongs to Allah",
    target: 33,
    source: "Sahih Muslim"
  },
  {
    id: "s_3",
    category: "salah",
    title: "Allahu Akbar (Allah is the Greatest)",
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest",
    target: 33,
    source: "Sahih Muslim"
  },
  {
    id: "s_4",
    category: "salah",
    title: "Completion of 100th Dhikr",
    arabic: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa-lahul-hamdu, wa-huwa 'ala kulli shay'in qadeer.",
    translation: "None has the right to be worshipped except Allah alone, without partner. To Him belongs sovereignty, and all praise is for Him, and He is capable of all things.",
    target: 1,
    source: "Sahih Muslim"
  },
  {
    id: "s_5",
    category: "salah",
    title: "Ayat al-Kursi (The Throne Verse)",
    arabic: "اللَّهُ لاَ إِلَٰهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ ۚ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلاَّ بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلاَ يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration: "Allahu la ilaha illa Huwa, Al-Hayyul-Qayyoom...",
    translation: "Whoever recites this after every prescribed prayer, nothing stands between him and entering Paradise except death.",
    target: 1,
    source: "An-Nasa'i"
  },

  // Sleeping Adhkar
  {
    id: "sl_1",
    category: "sleep",
    title: "In Your Name I Die and Live",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amootu wa-ahya.",
    translation: "In Your Name, O Allah, I die and I live.",
    target: 1,
    source: "Sahih Al-Bukhari"
  },
  {
    id: "sl_2",
    category: "sleep",
    title: "Fatima's Dhikr (Before Sleep)",
    arabic: "سُبْحَانَ اللَّهِ (٣٣) ، الْحَمْدُ لِلَّهِ (٣٣) ، اللَّهُ أَكْبَرُ (٣٤)",
    transliteration: "Subhanallah (33x), Alhamdulillah (33x), Allahu Akbar (34x)",
    translation: "Better than having a servant: 33 times Subhanallah, 33 times Alhamdulillah, 34 times Allahu Akbar.",
    target: 100,
    source: "Sahih Al-Bukhari & Muslim"
  },

  // General Praise & Istighfar
  {
    id: "p_1",
    category: "praise",
    title: "Subhanallahi wa bihamdihi",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    transliteration: "Subhanallahi wa bihamdihi, Subhanallahil-'Azeem.",
    translation: "Glory be to Allah and His is the praise, Glory be to Allah the Supreme. Two words light on the tongue, heavy on the Scales, beloved to the Most Merciful.",
    target: 100,
    source: "Sahih Al-Bukhari"
  },
  {
    id: "p_2",
    category: "praise",
    title: "Astaghfirullah (Daily Repentance)",
    arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfirullaha wa-atoobu ilayh.",
    translation: "I seek the forgiveness of Allah and turn to Him in repentance (recited 100 times daily by the Prophet ﷺ).",
    target: 100,
    source: "Sahih Al-Bukhari"
  },
  {
    id: "p_3",
    category: "praise",
    title: "Hawqala (Treasure of Paradise)",
    arabic: "لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ",
    transliteration: "La hawla wa la quwwata illa billah.",
    translation: "There is no might nor power except with Allah. (A treasure from the treasures of Paradise).",
    target: 100,
    source: "Sahih Al-Bukhari"
  },
  {
    id: "p_4",
    category: "praise",
    title: "Salawat (Blessings upon the Prophet ﷺ)",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
    transliteration: "Allahumma salli 'ala Muhammadin wa-'ala aali Muhammad.",
    translation: "O Allah, send peace and blessings upon Muhammad and upon the family of Muhammad.",
    target: 100,
    source: "Authentic"
  }
];
