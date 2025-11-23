(() => {
  const COUNTRY_CENTROIDS = [
  { names: ['united states', 'usa', 'us', 'america'], iso2: 'US', continent: 'North America', lat: 38.0, lon: -97.0 },
  { names: ['canada', 'ca'], iso2: 'CA', continent: 'North America', lat: 56.0, lon: -96.0 },
  { names: ['mexico', 'mx'], iso2: 'MX', continent: 'North America', lat: 23.6, lon: -102.5 },
  { names: ['brazil', 'br'], iso2: 'BR', continent: 'South America', lat: -13.7, lon: -51.9 },
  { names: ['argentina', 'ar'], iso2: 'AR', continent: 'South America', lat: -34.8, lon: -64.4 },
  { names: ['chile', 'cl'], iso2: 'CL', continent: 'South America', lat: -35.6, lon: -71.5 },
  { names: ['colombia', 'co'], iso2: 'CO', continent: 'South America', lat: 4.6, lon: -74.1 },
  { names: ['peru', 'pe'], iso2: 'PE', continent: 'South America', lat: -9.1, lon: -75.0 },
  { names: ['united kingdom', 'uk', 'england', 'scotland', 'wales', 'great britain'], iso2: 'GB', continent: 'Europe', lat: 54.8, lon: -4.6 },
  { names: ['ireland', 'ie'], iso2: 'IE', continent: 'Europe', lat: 53.1, lon: -8.0 },
  { names: ['france', 'fr'], iso2: 'FR', continent: 'Europe', lat: 46.2, lon: 2.2 },
  { names: ['germany', 'de'], iso2: 'DE', continent: 'Europe', lat: 51.1, lon: 10.4 },
  { names: ['austria', 'at'], iso2: 'AT', continent: 'Europe', lat: 47.5, lon: 14.6 },
  { names: ['spain', 'es'], iso2: 'ES', continent: 'Europe', lat: 40.4, lon: -3.7 },
  { names: ['portugal', 'pt'], iso2: 'PT', continent: 'Europe', lat: 39.5, lon: -8.0 },
  { names: ['italy', 'it'], iso2: 'IT', continent: 'Europe', lat: 41.9, lon: 12.5 },
  { names: ['netherlands', 'holland', 'nl'], iso2: 'NL', continent: 'Europe', lat: 52.2, lon: 5.3 },
  { names: ['belgium', 'be'], iso2: 'BE', continent: 'Europe', lat: 50.8, lon: 4.4 },
  { names: ['switzerland', 'ch'], iso2: 'CH', continent: 'Europe', lat: 46.8, lon: 8.3 },
  { names: ['sweden', 'se'], iso2: 'SE', continent: 'Europe', lat: 60.1, lon: 18.6 },
  { names: ['norway', 'no'], iso2: 'NO', continent: 'Europe', lat: 60.5, lon: 8.8 },
  { names: ['denmark', 'dk'], iso2: 'DK', continent: 'Europe', lat: 55.7, lon: 9.5 },
  { names: ['finland', 'fi'], iso2: 'FI', continent: 'Europe', lat: 64.0, lon: 26.0 },
  { names: ['poland', 'pl'], iso2: 'PL', continent: 'Europe', lat: 52.3, lon: 19.2 },
  { names: ['slovenia', 'si'], iso2: 'SI', continent: 'Europe', lat: 46.1, lon: 14.8 },
  { names: ['montenegro', 'me'], iso2: 'ME', continent: 'Europe', lat: 42.7, lon: 19.3 },
  { names: ['ukraine', 'ua'], iso2: 'UA', continent: 'Europe', lat: 49.0, lon: 31.2 },
  { names: ['russia', 'ru'], iso2: 'RU', continent: 'Europe', lat: 61.5, lon: 105.3 },
  { names: ['turkey', 'tr'], iso2: 'TR', continent: 'Europe', lat: 39.0, lon: 35.2 },
  { names: ['israel', 'il'], iso2: 'IL', continent: 'Asia', lat: 31.0, lon: 34.8 },
  { names: ['uae', 'united arab emirates'], iso2: 'AE', continent: 'Asia', lat: 24.3, lon: 54.4 },
  { names: ['saudi arabia', 'saudi', 'sa'], iso2: 'SA', continent: 'Asia', lat: 23.7, lon: 45.0 },
  { names: ['india', 'in'], iso2: 'IN', continent: 'Asia', lat: 20.6, lon: 78.9 },
  { names: ['pakistan', 'pk'], iso2: 'PK', continent: 'Asia', lat: 30.0, lon: 69.3 },
  { names: ['china', 'cn'], iso2: 'CN', continent: 'Asia', lat: 35.8, lon: 104.2 },
  { names: ['hong kong', 'hk'], iso2: 'HK', continent: 'Asia', lat: 22.3, lon: 114.2 },
  { names: ['taiwan', 'tw'], iso2: 'TW', continent: 'Asia', lat: 23.7, lon: 120.9 },
  { names: ['japan', 'jp'], iso2: 'JP', continent: 'Asia', lat: 36.2, lon: 138.3 },
  { names: ['south korea', 'korea', 'republic of korea', 'kr'], iso2: 'KR', continent: 'Asia', lat: 36.5, lon: 127.9 },
  { names: ['philippines', 'ph'], iso2: 'PH', continent: 'Asia', lat: 14.6, lon: 121.0 },
  { names: ['thailand', 'th'], iso2: 'TH', continent: 'Asia', lat: 15.8, lon: 101.0 },
  { names: ['vietnam', 'vn'], iso2: 'VN', continent: 'Asia', lat: 16.4, lon: 107.8 },
  { names: ['malaysia', 'my'], iso2: 'MY', continent: 'Asia', lat: 4.2, lon: 102.0 },
  { names: ['singapore', 'sg'], iso2: 'SG', continent: 'Asia', lat: 1.3, lon: 103.8 },
  { names: ['indonesia', 'id'], iso2: 'ID', continent: 'Asia', lat: -0.8, lon: 113.9 },
  { names: ['australia', 'au'], iso2: 'AU', continent: 'Oceania', lat: -25.2, lon: 133.8 },
  { names: ['new zealand', 'nz'], iso2: 'NZ', continent: 'Oceania', lat: -41.3, lon: 174.8 },
  { names: ['south africa', 'za'], iso2: 'ZA', continent: 'Africa', lat: -30.6, lon: 22.9 },
  { names: ['nigeria', 'ng'], iso2: 'NG', continent: 'Africa', lat: 9.1, lon: 8.7 },
  { names: ['kenya', 'ke'], iso2: 'KE', continent: 'Africa', lat: -0.0, lon: 37.9 },
  { names: ['egypt', 'eg'], iso2: 'EG', continent: 'Africa', lat: 26.8, lon: 30.8 },
  { names: ['morocco', 'ma'], iso2: 'MA', continent: 'Africa', lat: 31.8, lon: -7.1 },
  { names: ['ghana', 'gh'], iso2: 'GH', continent: 'Africa', lat: 7.9, lon: -1.0 },
  { names: ['ethiopia', 'et'], iso2: 'ET', continent: 'Africa', lat: 9.1, lon: 40.5 },
  { names: ['tanzania', 'tz'], iso2: 'TZ', continent: 'Africa', lat: -6.3, lon: 34.9 }
  ];

  const REGION_ALIASES = new Map([
    ['north america', 'North America'],
    ['central america', 'North America'],
    ['latin america', 'South America'],
    ['south america', 'South America'],
    ['caribbean', 'North America'],
    ['latin america & caribbean', 'South America'],
    ['europe', 'Europe'],
    ['asia', 'Asia'],
    ['east asia & pacific', 'Asia'],
    ['middle east', 'Asia'],
    ['oceania', 'Oceania'],
    ['australasia', 'Oceania'],
    ['africa', 'Africa'],
    ['worldwide', 'World'],
    ['global', 'World'],
  ]);

  const ALIAS_INDEX = new Map();
  for (const country of COUNTRY_CENTROIDS) {
    for (const alias of country.names) {
      ALIAS_INDEX.set(alias, country);
    }
  }

  function normalize(value = '') {
    return value.trim().toLowerCase();
  }

  function splitWords(text) {
    return text.split(/[^a-z]+/).filter(Boolean);
  }

  function matchCountry(locationText) {
    const resolved = resolveLocation(locationText);
    return resolved?.type === 'country' ? resolved : null;
  }

  function matchRegion(normalized) {
    if (REGION_ALIASES.has(normalized)) {
      return REGION_ALIASES.get(normalized);
    }
    for (const [alias, continent] of REGION_ALIASES.entries()) {
      if (normalized.includes(alias)) {
        return continent;
      }
    }
    return null;
  }

  function resolveLocation(locationText) {
    if (!locationText) return null;
    const normalized = normalize(locationText);
    if (!normalized) return null;

    const words = splitWords(normalized);

    // First, handle canonical region names exactly ("north america", "europe",
    // "east asia & pacific", etc.). These should never be mistaken for a
    // specific country like "america".
    if (REGION_ALIASES.has(normalized)) {
      const continent = REGION_ALIASES.get(normalized);
      return { type: 'region', continent, iso2: null, lat: null, lon: null };
    }

    const exact = ALIAS_INDEX.get(normalized);
    if (exact) {
      return { type: 'country', ...exact };
    }

    for (const [alias, country] of ALIAS_INDEX.entries()) {
      const a = alias.toLowerCase();
      if (a.includes(' ')) {
        // Multi-word aliases ("united states", etc.) can safely use substring match
        if (normalized.includes(a)) {
          return { type: 'country', ...country };
        }
      } else {
        // Single-word/short aliases must match as standalone words to avoid
        // cases like "europe" matching "pe" (Peru) or "asia" matching "sa".
        if (words.includes(a)) {
          return { type: 'country', ...country };
        }
      }
    }

    const region = matchRegion(normalized);
    if (region) {
      return { type: 'region', continent: region, iso2: null, lat: null, lon: null };
    }

    return null;
  }

  window.XGlobeCountryDB = {
    matchCountry,
    normalizeLocation: (value) => normalize(value),
    resolveLocation,
  };
})();
