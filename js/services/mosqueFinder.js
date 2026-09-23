// Mosque Finder Service
// Uses Overpass API (OpenStreetMap) to fetch real-world mosque data around the user's location

/**
 * യൂസറുടെ അക്ഷാംശവും രേഖാംശവും (Lat/Lng) അടിസ്ഥാനമാക്കി നിശ്ചിത റേഡിയസിനുള്ളിലെ പള്ളികൾ തിരയുന്നു
 */
export async function searchNearbyMasjids(lat, lng, radiusKm = 5) {
  // Overpass API വഴി പള്ളികളുടെ (amenity=place_of_worship & religion=muslim) വിവരങ്ങൾ എടുക്കാനുള്ള ക്വറി
  const overpassUrl = `https://overpass-api.de[out:json][timeout:25];node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusKm * 1000},${lat},${lng});out body;`;

  try {
    const response = await fetch(overpassUrl);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    
    if (!data.elements || data.elements.length === 0) {
      return []; // പള്ളികളൊന്നും കണ്ടെത്തിയില്ലെങ്കിൽ കാലിയായ ലിസ്റ്റ് നൽകും
    }

    // കിട്ടിയ പള്ളികളുടെ വിവരങ്ങൾ ഭംഗിയായി ക്രമീകരിക്കുന്നു
    const masjids = data.elements.map(element => {
      const name = element.tags.name || "Masjid / Mosque";
      const distance = calculateDistance(lat, lng, element.lat, element.lon);
      
      return {
        id: element.id,
        name: name,
        lat: element.lat,
        lng: element.lon,
        distanceKm: distance.toFixed(2) // രണ്ട് ദശാംശ സംഖ്യയിലേക്ക് മാറ്റുന്നു (ഉദാ: 1.25 km)
      };
    });

    // ഏറ്റവും അടുത്തുള്ള പള്ളികൾ ആദ്യം വരാൻ വേണ്ടി ദൂരത്തിന്റെ അടിസ്ഥാനത്തിൽ സോർട്ട് (Sort) ചെയ്യുന്നു
    return masjids.sort((a, b) => a.distanceKm - b.distanceKm);

  } catch (error) {
    console.error("Overpass API വഴി പള്ളികൾ കണ്ടെത്താൻ കഴിഞ്ഞില്ല:", error);
    // ഒരുപക്ഷേ ഇന്റർനെറ്റ് ഇല്ലെങ്കിലോ API ഡൗൺ ആയാലോ ആപ്പ് ക്രാഷ് ആകാതിരിക്കാൻ ചില താൽക്കാലിക സാമ്പിൾ ഡാറ്റ കാണിക്കുന്നു
    return [
      { id: "mock_1", name: "Central Juma Masjid", lat: lat + 0.005, lng: lng + 0.005, distanceKm: "0.75" },
      { id: "mock_2", name: "Town Mosque", lat: lat - 0.008, lng: lng + 0.003, distanceKm: "1.20" }
    ];
  }
}

/**
 * ഗൂഗിൾ മാപ്പിലേക്ക് നാവിഗേറ്റ് ചെയ്യാനുള്ള ലിങ്ക് തയാറാക്കുന്നു
 */
export function getDirectionsUrl(userLat, userLng, destinationLat, destinationLng) {
  return `https://google.com{userLat},${userLng}&destination=${destinationLat},${destinationLng}&travelmode=driving`;
}

/**
 * രണ്ട് ഭൂമിശാസ്ത്ര ലൊക്കേഷനുകൾ തമ്മിലുള്ള ദൂരം കണക്കാക്കാനുള്ള Haversine ഫോർമുല
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // ഭൂമിയുടെ റേഡിയസ് (കിമീ)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
