const fs = require('fs');
const path = require('path');
const https = require('https');

const CACHE_FILE = path.join(__dirname, '../data/weather-cache.json');
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

// The 6 official Kashmir destinations with precise coordinates and altitudes
const DESTINATIONS = [
  {
    id: 'srinagar',
    name: 'Srinagar',
    title: 'Srinagar Valley',
    lat: 34.0837,
    lon: 74.7973,
    altitude: '1,585 m',
    altitudeMeters: 1585,
    defaultTemp: 9,
    zone: 'Dal Lake & Valley Basin',
    description: 'Summer capital situated around Dal Lake and Mughal Gardens.'
  },
  {
    id: 'gulmarg',
    name: 'Gulmarg',
    title: 'Gulmarg Meadow',
    lat: 34.0484,
    lon: 74.3805,
    altitude: '2,650 m',
    altitudeMeters: 2650,
    defaultTemp: -3,
    zone: 'Apharwat & Pir Panjal Zone',
    description: 'Premier alpine ski resort and world-renowned Gondola destination.'
  },
  {
    id: 'pahalgam',
    name: 'Pahalgam',
    title: 'Pahalgam Valley',
    lat: 34.0163,
    lon: 75.3150,
    altitude: '2,130 m',
    altitudeMeters: 2130,
    defaultTemp: 3,
    zone: 'Lidder River & Betaab Valley',
    description: 'Confluence of Lidder river streams, pine forests, and trekking routes.'
  },
  {
    id: 'sonamarg',
    name: 'Sonamarg',
    title: 'Sonamarg Gateway',
    lat: 34.3100,
    lon: 75.2950,
    altitude: '2,730 m',
    altitudeMeters: 2730,
    defaultTemp: -4,
    zone: 'Thajiwas Glacier & Sindh Valley',
    description: 'The Golden Meadow, high-altitude alpine gateway, and glacier viewpoint.'
  },
  {
    id: 'doodhpathri',
    name: 'Doodhpathri',
    title: 'Doodhpathri Meadow',
    lat: 33.8787,
    lon: 74.5684,
    altitude: '2,730 m',
    altitudeMeters: 2730,
    defaultTemp: 0,
    zone: 'Valley of Milk & Shaliganga',
    description: 'Pristine rolling green meadows and gushing crystalline streams.'
  },
  {
    id: 'yusmarg',
    name: 'Yusmarg',
    title: 'Yusmarg Meadow',
    lat: 33.8290,
    lon: 74.6644,
    altitude: '2,400 m',
    altitudeMeters: 2400,
    defaultTemp: 2,
    zone: 'Pir Panjal Meadow & Doodh Ganga',
    description: 'Secluded pine-rimmed plateau overlooking the Pir Panjal mountain range.'
  }
];

// Open-Meteo WMO weather codes mapping
const WMO_CODES = {
  0: { desc: 'Clear Skies', icon: 'sun', condition: 'sunny', severity: 'normal' },
  1: { desc: 'Mainly Clear', icon: 'sun', condition: 'mostly_sunny', severity: 'normal' },
  2: { desc: 'Partly Cloudy', icon: 'cloud-sun', condition: 'partly_cloudy', severity: 'normal' },
  3: { desc: 'Overcast Skies', icon: 'cloud', condition: 'cloudy', severity: 'normal' },
  45: { desc: 'Mountain Fog', icon: 'cloud-fog', condition: 'fog', severity: 'advisory' },
  48: { desc: 'Depositing Rime Fog', icon: 'cloud-fog', condition: 'fog', severity: 'advisory' },
  51: { desc: 'Light Drizzle', icon: 'cloud-drizzle', condition: 'drizzle', severity: 'advisory' },
  53: { desc: 'Moderate Drizzle', icon: 'cloud-drizzle', condition: 'drizzle', severity: 'advisory' },
  55: { desc: 'Dense Drizzle', icon: 'cloud-drizzle', condition: 'drizzle', severity: 'advisory' },
  56: { desc: 'Light Freezing Drizzle', icon: 'cloud-snow', condition: 'freezing_rain', severity: 'warning' },
  57: { desc: 'Dense Freezing Drizzle', icon: 'cloud-snow', condition: 'freezing_rain', severity: 'warning' },
  61: { desc: 'Slight Rain', icon: 'cloud-rain', condition: 'rain', severity: 'advisory' },
  63: { desc: 'Moderate Rain', icon: 'cloud-rain', condition: 'rain', severity: 'advisory' },
  65: { desc: 'Heavy Rain', icon: 'cloud-rain', condition: 'heavy_rain', severity: 'warning' },
  66: { desc: 'Light Freezing Rain', icon: 'cloud-snow', condition: 'freezing_rain', severity: 'warning' },
  67: { desc: 'Heavy Freezing Rain', icon: 'cloud-snow', condition: 'freezing_rain', severity: 'warning' },
  71: { desc: 'Light Snowfall', icon: 'snowflake', condition: 'snow', severity: 'warning' },
  73: { desc: 'Moderate Snowfall', icon: 'snowflake', condition: 'snow', severity: 'warning' },
  75: { desc: 'Heavy Snowfall', icon: 'snowflake', condition: 'heavy_snow', severity: 'severe' },
  77: { desc: 'Snow Grains', icon: 'snowflake', condition: 'snow', severity: 'advisory' },
  80: { desc: 'Slight Rain Showers', icon: 'cloud-rain', condition: 'rain', severity: 'advisory' },
  81: { desc: 'Moderate Rain Showers', icon: 'cloud-rain', condition: 'rain', severity: 'advisory' },
  82: { desc: 'Violent Rain Showers', icon: 'cloud-lightning', condition: 'heavy_rain', severity: 'warning' },
  85: { desc: 'Slight Snow Showers', icon: 'snowflake', condition: 'snow', severity: 'warning' },
  86: { desc: 'Heavy Snow Showers', icon: 'snowflake', condition: 'heavy_snow', severity: 'severe' },
  95: { desc: 'Thunderstorm', icon: 'cloud-lightning', condition: 'thunderstorm', severity: 'warning' },
  96: { desc: 'Thunderstorm with Slight Hail', icon: 'cloud-lightning', condition: 'thunderstorm', severity: 'severe' },
  99: { desc: 'Thunderstorm with Heavy Hail', icon: 'cloud-lightning', condition: 'thunderstorm', severity: 'severe' }
};

// Compass cardinal direction converter (degrees to 16-point cardinal)
function getCardinalDirection(degrees) {
  if (degrees === undefined || degrees === null || isNaN(degrees)) return 'N';
  const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return cardinals[index];
}

// Format Date / ISO string into Indian Standard Time (IST)
function formatIST(isoOrDate, formatType = 'full') {
  if (!isoOrDate) return 'N/A';
  const date = (isoOrDate instanceof Date) ? isoOrDate : new Date(isoOrDate);
  if (isNaN(date.getTime())) return String(isoOrDate);

  const options = {
    timeZone: 'Asia/Kolkata',
    hour12: true
  };

  if (formatType === 'time') {
    options.hour = '2-digit';
    options.minute = '2-digit';
    return date.toLocaleTimeString('en-IN', options);
  }

  if (formatType === 'date') {
    options.day = 'numeric';
    options.month = 'short';
    options.year = 'numeric';
    return date.toLocaleDateString('en-IN', options);
  }

  // full: '05:30 PM IST, 14 Nov 2026'
  const timeStr = date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });
  return `${timeStr} IST, ${dateStr}`;
}

// Generate transparent, meteorologically founded Mountain Travel Advisory
function generateTravelAdvisory(dest, current, daily) {
  const code = (current && current.weather_code !== undefined && current.weather_code !== null) ? current.weather_code : 0;
  const wind = (current && current.wind_speed_10m !== undefined && current.wind_speed_10m !== null) ? current.wind_speed_10m : 0;
  const temp = (current && current.temperature_2m !== undefined && current.temperature_2m !== null) 
    ? current.temperature_2m 
    : ((current && current.temperature !== undefined && current.temperature !== null) ? current.temperature : 5);
  const rain = (current && (current.rain || current.precipitation)) ? (current.rain || current.precipitation) : 0;
  const snow = (current && current.snowfall) ? current.snowfall : 0;
  const precipProb = (daily && daily.precipitation_probability_max && daily.precipitation_probability_max[0] !== undefined) 
    ? daily.precipitation_probability_max[0] 
    : 0;

  // 1. Severe conditions (Thunderstorm, Heavy Hail, Extreme Wind, Blizzard)
  if ([95, 96, 99].includes(code) || wind >= 45 || code === 75 || code === 86) {
    return {
      status: 'severe',
      badge: 'Severe Advisory',
      badgeColor: 'red',
      level: 4,
      headline: 'Severe Mountain Weather Advisory',
      message: 'Severe mountain conditions forecast. Check official Jammu & Kashmir traffic police and local administration advisories before departing.',
      activityNotice: 'High-altitude ropeways (Gondola), passes, and exposed trekking operations are likely restricted.',
      precipSummary: `${precipProb}% precipitation risk · Wind ${Math.round(wind)} km/h`
    };
  }

  // 2. Freezing Rain & Black Ice Warning
  if ([56, 57, 66, 67].includes(code)) {
    return {
      status: 'freezing_rain',
      badge: 'Icy Roads Alert',
      badgeColor: 'red',
      level: 4,
      headline: 'Freezing Rain & Icy Roads Alert',
      message: 'Sub-freezing precipitation detected. Risk of black ice on high passes and shaded mountain curves.',
      activityNotice: 'Vehicles must exercise extreme caution. Anti-skid chains may be required by local traffic authorities.',
      precipSummary: `Freezing precipitation risk · Ambient: ${Math.round(temp)}°C`
    };
  }

  // 3. Active Snowfall conditions (Currently snowing or snow on ground with sub-zero precipitation)
  if ([71, 73, 77, 85].includes(code) || snow > 0.05) {
    return {
      status: 'snow',
      badge: 'Snowfall Alert',
      badgeColor: 'sky',
      level: 3,
      headline: 'Active Snowfall in Mountain Sector',
      message: 'Active snowfall detected in alpine elevations. Verify road accessibility and ensure 4x4 or chained transport for high passes.',
      activityNotice: 'Carry heavy thermal layers, waterproof jackets, and snow boots. Expect winter driving protocols.',
      precipSummary: `Snowfall active · Precipitation probability: ${precipProb}% · Ambient: ${Math.round(temp)}°C`
    };
  }

  // 4. Mountain Fog & Reduced Visibility
  if ([45, 48].includes(code)) {
    return {
      status: 'fog',
      badge: 'Fog Advisory',
      badgeColor: 'amber',
      level: 2,
      headline: 'Mountain Fog & Reduced Visibility',
      message: 'Dense valley or mountain fog reported. Exercise caution while driving along ghat roads and mountain passes. Allow extra travel time.',
      activityNotice: 'Morning boat rides on Dal Lake and highway departures should verify visibility before departure.',
      precipSummary: `Reduced visibility · Wind: ${Math.round(wind)} km/h`
    };
  }

  // 5. Active Rain conditions
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code) || rain > 0.2) {
    return {
      status: 'rain',
      badge: 'Rain Advisory',
      badgeColor: 'blue',
      level: 2,
      headline: 'Precipitation / Rain Showers',
      message: 'Active rain showers reported. Carry waterproof rainwear, umbrellas, and sturdy footwear for garden and valley walks.',
      activityNotice: 'Mountain roads may have slick patches. Drive cautiously along river valleys.',
      precipSummary: `Precipitation probability: ${precipProb}% · Estimated rain: ${rain.toFixed(1)} mm`
    };
  }

  // 6. High Winds Advisory
  if (wind >= 28) {
    return {
      status: 'wind',
      badge: 'Wind Advisory',
      badgeColor: 'amber',
      level: 2,
      headline: 'High-Altitude Wind Advisory',
      message: 'Strong gusts detected. Exercise caution during ridge walks, open viewpoint visits, and cable car transits.',
      activityNotice: 'Gondola Phase II operations at Apharwat Peak may experience wind-induced holds.',
      precipSummary: `Wind speeds: ${Math.round(wind)} km/h · Direction: ${getCardinalDirection(current.wind_direction_10m)}`
    };
  }

  // 7. Approaching Weather Alert (Currently clear, but high precipitation probability forecasted today)
  if (precipProb >= 65) {
    if (temp <= 1) {
      return {
        status: 'approaching_snow',
        badge: 'Snow Probability',
        badgeColor: 'sky',
        level: 2,
        headline: 'Potential Snow Flurries Forecasted',
        message: 'Skies currently fair, but numerical models indicate a high likelihood of snowfall or flurries later today.',
        activityNotice: 'Dress warmly and verify evening pass accessibility before traveling between valleys.',
        precipSummary: `${precipProb}% snow probability later today · Ambient: ${Math.round(temp)}°C`
      };
    } else {
      return {
        status: 'approaching_rain',
        badge: 'Showers Forecast',
        badgeColor: 'blue',
        level: 2,
        headline: 'Showers Forecasted Later Today',
        message: 'Currently fair skies, but afternoon or evening rain showers are predicted by meteorological models.',
        activityNotice: 'Keep an umbrella handy for outdoor valley excursions.',
        precipSummary: `${precipProb}% precipitation risk later today`
      };
    }
  }

  // 8. Favourable Conditions (Clear / Partly Cloudy, Low Rain Risk, Low Wind)
  return {
    status: 'favourable',
    badge: 'Favourable Conditions',
    badgeColor: 'emerald',
    level: 1,
    headline: 'Generally Favourable for Sightseeing',
    message: 'Clear to partly cloudy conditions. Favourable for outdoor sightseeing, Shikara rides, meadow treks, and photography.',
    activityNotice: 'Carry light to medium woollens as evening temperatures drop rapidly in mountain elevations.',
    precipSummary: `Precipitation risk low (${precipProb}%) · Wind ${Math.round(wind)} km/h`
  };
}

// In-memory cache store
let memoryCache = {
  timestamp: 0,
  dataTimestamp: null,
  isCached: false,
  destinations: {}
};

// Load disk cache on boot if valid
try {
  if (fs.existsSync(CACHE_FILE)) {
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && parsed.destinations && Object.keys(parsed.destinations).length > 0) {
      memoryCache = {
        ...parsed,
        isCached: true
      };
    }
  }
} catch (e) {
  // Silent failover
}

// Fetch single destination weather from Open-Meteo
function fetchOpenMeteoDestination(dest) {
  return new Promise((resolve, reject) => {
    // Open-Meteo URL construction:
    // Support commercial subscription endpoint if OPEN_METEO_API_KEY is configured
    const apiKey = process.env.OPEN_METEO_API_KEY;
    const baseUrl = process.env.OPEN_METEO_URL || (apiKey ? 'https://customer-api.open-meteo.com/v1/forecast' : 'https://api.open-meteo.com/v1/forecast');
    
    const params = new URLSearchParams({
      latitude: dest.lat.toString(),
      longitude: dest.lon.toString(),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,snowfall,weather_code,wind_speed_10m,wind_direction_10m',
      hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
      timezone: 'Asia/Kolkata',
      forecast_days: '6'
    });

    if (apiKey) {
      params.append('apikey', apiKey);
    }

    const fullUrl = `${baseUrl}?${params.toString()}`;

    const req = https.get(fullUrl, {
      timeout: 7000,
      headers: {
        'User-Agent': 'CityLineTours-WeatherEngine/2.0 (Kashmir Tourism Portal)'
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Open-Meteo API HTTP ${res.statusCode}: ${raw.slice(0, 100)}`));
        }
        try {
          const json = JSON.parse(raw);
          resolve(json);
        } catch (e) {
          reject(new Error(`Failed to parse Open-Meteo JSON: ${e.message}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Open-Meteo API connection timed out (7s)'));
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

// Transform raw Open-Meteo payload into structured destination weather object
function transformDestinationData(dest, raw) {
  const current = raw.current || {};
  const daily = raw.daily || {};
  const hourly = raw.hourly || {};

  const code = current.weather_code !== undefined ? current.weather_code : 0;
  const wmoInfo = WMO_CODES[code] || { desc: 'Fair Mountain Weather', icon: 'cloud-sun', condition: 'cloudy', severity: 'normal' };

  const windDegrees = current.wind_direction_10m;
  const windCardinal = getCardinalDirection(windDegrees);
  const advisory = generateTravelAdvisory(dest, current, daily);

  // Parse sunrise & sunset
  let sunriseStr = 'N/A';
  let sunsetStr = 'N/A';
  if (daily.sunrise && daily.sunrise[0]) {
    sunriseStr = formatIST(daily.sunrise[0], 'time');
  }
  if (daily.sunset && daily.sunset[0]) {
    sunsetStr = formatIST(daily.sunset[0], 'time');
  }

  // 24-Hour Forecast (Next 24 hourly steps from current hour)
  const next24Hours = [];
  if (hourly.time && hourly.time.length > 0) {
    const nowTimeStr = current.time || new Date().toISOString();
    let startIndex = hourly.time.findIndex(t => t >= nowTimeStr);
    if (startIndex === -1) startIndex = 0;

    for (let i = startIndex; i < Math.min(startIndex + 24, hourly.time.length); i++) {
      const hTime = hourly.time[i];
      const hCode = hourly.weather_code ? hourly.weather_code[i] : 0;
      const hInfo = WMO_CODES[hCode] || { desc: 'Fair', icon: 'cloud-sun' };
      const hTemp = hourly.temperature_2m ? hourly.temperature_2m[i] : null;
      const hPrecip = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;
      const hWind = hourly.wind_speed_10m ? hourly.wind_speed_10m[i] : 0;

      next24Hours.push({
        timeISO: hTime,
        timeFormatted: formatIST(hTime, 'time'),
        temp: hTemp !== null ? Math.round(hTemp) : null,
        weatherCode: hCode,
        condition: hInfo.desc,
        icon: hInfo.icon,
        precipProb: Math.round(hPrecip),
        windSpeed: Math.round(hWind)
      });
    }
  }

  // 5-Day Outlook (Days 1 to 5 from daily)
  const fiveDayOutlook = [];
  if (daily.time && daily.time.length > 0) {
    for (let d = 0; d < Math.min(6, daily.time.length); d++) {
      const dDateStr = daily.time[d];
      const dCode = daily.weather_code ? daily.weather_code[d] : 0;
      const dInfo = WMO_CODES[dCode] || { desc: 'Fair', icon: 'cloud-sun' };
      const dMax = daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[d]) : null;
      const dMin = daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[d]) : null;
      const dPrecipProb = daily.precipitation_probability_max ? Math.round(daily.precipitation_probability_max[d]) : 0;
      const dPrecipSum = daily.precipitation_sum ? Number(daily.precipitation_sum[d].toFixed(1)) : 0;

      const dateObj = new Date(dDateStr);
      const dayName = d === 0 ? 'Today' : dateObj.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short' });
      const dateFormatted = dateObj.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' });

      fiveDayOutlook.push({
        dayName,
        dateFormatted,
        dateISO: dDateStr,
        weatherCode: dCode,
        condition: dInfo.desc,
        icon: dInfo.icon,
        tempMax: dMax,
        tempMin: dMin,
        precipProb: dPrecipProb,
        precipSum: dPrecipSum
      });
    }
  }

  return {
    id: dest.id,
    name: dest.name,
    title: dest.title,
    zone: dest.zone,
    altitude: dest.altitude,
    altitudeMeters: dest.altitudeMeters,
    latitude: dest.lat,
    longitude: dest.lon,
    description: dest.description,
    
    // Live observations & numerical model fields
    current: {
      temperature: (current.temperature_2m !== undefined && current.temperature_2m !== null) ? Math.round(current.temperature_2m) : (dest.defaultTemp !== undefined ? dest.defaultTemp : 8),
      temperatureExact: (current.temperature_2m !== undefined && current.temperature_2m !== null) ? current.temperature_2m : (dest.defaultTemp !== undefined ? dest.defaultTemp : 8),
      apparentTemperature: (current.apparent_temperature !== undefined && current.apparent_temperature !== null) ? Math.round(current.apparent_temperature) : Math.round(((current.temperature_2m !== undefined ? current.temperature_2m : dest.defaultTemp) || 8) - 2),
      apparentTemperatureExact: current.apparent_temperature,
      relativeHumidity: (current.relative_humidity_2m !== undefined && current.relative_humidity_2m !== null) ? Math.round(current.relative_humidity_2m) : 72,
      windSpeed: (current.wind_speed_10m !== undefined && current.wind_speed_10m !== null) ? Math.round(current.wind_speed_10m) : 5,
      windSpeedExact: current.wind_speed_10m !== undefined ? current.wind_speed_10m : 5,
      windDirection: windDegrees || 0,
      windCardinal: windCardinal || 'N',
      weatherCode: code,
      condition: wmoInfo.desc,
      icon: wmoInfo.icon,
      precipitation: current.precipitation || 0,
      rain: current.rain || 0,
      snowfall: current.snowfall || 0,
      dataTimeISO: current.time || new Date().toISOString(),
      dataTimeIST: formatIST(current.time || new Date(), 'full')
    },

    todaySummary: {
      tempMax: (daily.temperature_2m_max && daily.temperature_2m_max[0] !== undefined) ? Math.round(daily.temperature_2m_max[0]) : Math.round((current.temperature_2m || dest.defaultTemp || 8) + 4),
      tempMin: (daily.temperature_2m_min && daily.temperature_2m_min[0] !== undefined) ? Math.round(daily.temperature_2m_min[0]) : Math.round((current.temperature_2m || dest.defaultTemp || 8) - 4),
      precipProbability: (daily.precipitation_probability_max && daily.precipitation_probability_max[0] !== undefined) ? Math.round(daily.precipitation_probability_max[0]) : 15,
      sunrise: sunriseStr !== 'N/A' ? sunriseStr : '06:45 AM',
      sunset: sunsetStr !== 'N/A' ? sunsetStr : '05:30 PM'
    },

    next24Hours: next24Hours.slice(0, 24),
    fiveDayForecast: fiveDayOutlook.slice(0, 5),
    travelAdvisory: advisory,

    // Data Transparency & Model Identity
    dataSource: {
      provider: 'Open-Meteo Weather API',
      model: 'High-Resolution Numerical Weather Models (ECMWF & GFS)',
      nature: 'High-Resolution Numerical Model Estimates (Not a direct physical station reading)',
      commercialTerms: 'Commercial & Academic Meteorological Data Services',
      attributionUrl: 'https://open-meteo.com/',
      isLive: true
    }
  };
}

let isFetching = false;
let fetchPromise = null;

// Primary Weather Fetch Orchestrator with Stampede Protection
async function refreshAllDestinations(force = false) {
  const now = Date.now();
  const cacheAge = now - memoryCache.timestamp;

  // If cache is fresh and not forced, return memory cache
  if (!force && memoryCache.timestamp > 0 && cacheAge < CACHE_TTL_MS && Object.keys(memoryCache.destinations).length === DESTINATIONS.length) {
    return memoryCache;
  }

  // Prevent multiple parallel requests
  if (isFetching && fetchPromise) {
    return fetchPromise;
  }

  isFetching = true;
  fetchPromise = (async () => {
    try {
      const results = await Promise.allSettled(
        DESTINATIONS.map(async (dest) => {
          const raw = await fetchOpenMeteoDestination(dest);
          return transformDestinationData(dest, raw);
        })
      );

      const updatedDestinations = { ...memoryCache.destinations };
      let anySucceeded = false;
      let latestModelTime = null;

      results.forEach((res, index) => {
        const dest = DESTINATIONS[index];
        if (res.status === 'fulfilled' && res.value) {
          updatedDestinations[dest.id] = res.value;
          anySucceeded = true;
          if (!latestModelTime && res.value.current && res.value.current.dataTimeISO) {
            latestModelTime = res.value.current.dataTimeISO;
          }
        } else {
          console.warn(`[WeatherService] Destination ${dest.id} fetch warning:`, res.reason ? res.reason.message : 'Unknown error');
          // If we had old cache, preserve it but mark as cached fallback
          if (updatedDestinations[dest.id]) {
            updatedDestinations[dest.id].dataSource.isLive = false;
          }
        }
      });

      if (anySucceeded) {
        memoryCache = {
          timestamp: Date.now(),
          lastUpdatedIST: formatIST(new Date(), 'full'),
          modelTimeIST: latestModelTime ? formatIST(latestModelTime, 'full') : formatIST(new Date(), 'full'),
          isCached: false,
          isAvailable: true,
          destinations: updatedDestinations
        };

        // Persist to disk cache
        try {
          fs.writeFileSync(CACHE_FILE, JSON.stringify(memoryCache, null, 2), 'utf8');
        } catch (e) {
          console.error('[WeatherService] Disk cache write error:', e.message);
        }
      } else {
        // All failed: flag existing cache as cached/fallback
        if (Object.keys(memoryCache.destinations).length > 0) {
          memoryCache.isCached = true;
          memoryCache.isAvailable = true;
        } else {
          memoryCache.isAvailable = false;
        }
      }

      return memoryCache;
    } catch (globalErr) {
      console.error('[WeatherService] Global refresh error:', globalErr.message);
      if (Object.keys(memoryCache.destinations).length > 0) {
        memoryCache.isCached = true;
        memoryCache.isAvailable = true;
        return memoryCache;
      }
      return {
        timestamp: 0,
        isAvailable: false,
        isCached: false,
        error: 'Live weather temporarily unavailable',
        destinations: {}
      };
    } finally {
      isFetching = false;
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

// Public API
module.exports = {
  DESTINATIONS,
  WMO_CODES,
  getCardinalDirection,
  formatIST,
  generateTravelAdvisory,

  // Get full weather dataset for all 6 destinations
  async getAllWeather(force = false) {
    return refreshAllDestinations(force);
  },

  // Get weather for a specific destination by ID
  async getDestinationWeather(destId, force = false) {
    const full = await refreshAllDestinations(force);
    if (full.destinations && full.destinations[destId]) {
      return full.destinations[destId];
    }
    return null;
  },

  // Synchronous cache reader for instant SSR without await when available
  getCachedWeatherSync() {
    return memoryCache;
  }
};
