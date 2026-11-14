const assert = require('assert');
const http = require('http');

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body, json: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('--- TESTING GENUINE REAL-TIME WEATHER SYSTEM ---');

  // 1. Verify GET /api/weather
  console.log('\n[1] Testing /api/weather API Endpoint:');
  const weatherRes = await fetch('http://localhost:3000/api/weather');
  assert.strictEqual(weatherRes.status, 200, '/api/weather must return 200 OK');
  const data = weatherRes.json;
  assert(data && data.destinations, 'Weather response must contain destinations object');
  assert(data.isAvailable === true, 'Weather isAvailable must be true');
  assert(data.modelTimeIST, 'Weather must contain modelTimeIST in Indian Standard Time');
  console.log('✓ /api/weather returns 200 OK with modelTimeIST:', data.modelTimeIST);

  // 2. Check each of the 6 destinations independently
  console.log('\n[2] Verifying All 6 Kashmir Tourist Destinations:');
  const expectedDests = [
    { id: 'srinagar', name: 'Srinagar', minAlt: 1500, maxAlt: 1700 },
    { id: 'gulmarg', name: 'Gulmarg', minAlt: 2500, maxAlt: 2800 },
    { id: 'pahalgam', name: 'Pahalgam', minAlt: 2000, maxAlt: 2300 },
    { id: 'sonamarg', name: 'Sonamarg', minAlt: 2600, maxAlt: 2900 },
    { id: 'doodhpathri', name: 'Doodhpathri', minAlt: 2600, maxAlt: 2900 },
    { id: 'yusmarg', name: 'Yusmarg', minAlt: 2300, maxAlt: 2500 }
  ];

  for (const d of expectedDests) {
    const dest = data.destinations[d.id];
    assert(dest, `Destination ${d.id} must exist in weather response`);
    assert.strictEqual(dest.name, d.name, `Destination name must be ${d.name}`);
    assert(dest.altitudeMeters >= d.minAlt && dest.altitudeMeters <= d.maxAlt, `Altitude for ${d.name} must be within mountain range`);
    
    // Check genuine meteorological readings
    const curr = dest.current;
    assert(curr, `Current weather data must exist for ${d.name}`);
    assert(typeof curr.temperature === 'number', `Temperature for ${d.name} must be a number`);
    assert(typeof curr.apparentTemperature === 'number', `Feels-like temperature for ${d.name} must be a number`);
    assert(typeof curr.relativeHumidity === 'number' && curr.relativeHumidity >= 0 && curr.relativeHumidity <= 100, `Humidity for ${d.name} must be valid percentage`);
    assert(typeof curr.windSpeed === 'number' && curr.windSpeed >= 0, `Wind speed for ${d.name} must be non-negative number`);
    assert(typeof curr.windCardinal === 'string' && curr.windCardinal.length > 0, `Wind cardinal direction must exist for ${d.name}`);
    assert(typeof curr.condition === 'string' && curr.condition.length > 0, `Condition description must exist for ${d.name}`);
    assert(typeof curr.weatherCode === 'number', `Weather code must exist for ${d.name}`);
    assert(typeof curr.dataTimeIST === 'string' && curr.dataTimeIST.includes('IST'), `Data timestamp must be formatted in IST`);

    // Check today summary
    const sum = dest.todaySummary;
    assert(sum, `Today summary must exist for ${d.name}`);
    assert(typeof sum.tempMax === 'number', `tempMax must exist for ${d.name}`);
    assert(typeof sum.tempMin === 'number', `tempMin must exist for ${d.name}`);
    assert(typeof sum.precipProbability === 'number', `precipProbability must exist for ${d.name}`);
    assert(sum.sunrise && sum.sunrise.includes('am'), `Sunrise in IST must exist for ${d.name}`);
    assert(sum.sunset && sum.sunset.includes('pm'), `Sunset in IST must exist for ${d.name}`);

    // Check 24-hour hourly forecast
    assert(Array.isArray(dest.next24Hours) && dest.next24Hours.length >= 20, `Next 24h hourly forecast must have at least 20 intervals for ${d.name}`);
    assert(typeof dest.next24Hours[0].temp === 'number', `Hourly temp must be number`);
    assert(dest.next24Hours[0].timeFormatted, `Hourly formatted time must exist`);

    // Check 5-day daily forecast
    assert(Array.isArray(dest.fiveDayForecast) && dest.fiveDayForecast.length === 5, `5-day forecast must have 5 days for ${d.name}`);
    assert(dest.fiveDayForecast[0].dayName, `5-day dayName must exist`);
    assert(typeof dest.fiveDayForecast[0].tempMax === 'number', `5-day tempMax must exist`);

    // Check Travel Advisory
    const adv = dest.travelAdvisory;
    assert(adv, `Travel advisory must exist for ${d.name}`);
    assert(adv.badge && adv.headline && adv.message, `Advisory badge, headline & message must exist for ${d.name}`);
    assert(adv.activityNotice, `Activity notice (Gondola/road/passes) must exist for ${d.name}`);

    // Check Provider Attribution & Transparency
    const src = dest.dataSource;
    assert(src && src.provider.includes('Open-Meteo'), `Data provider must be Open-Meteo`);
    assert(src.nature.includes('Numerical Model Estimates'), `Must distinguish model estimates from physical stations`);

    console.log(`✓ ${d.name.padEnd(12)}: ${curr.temperature}°C (Feels ${curr.apparentTemperature}°C) · ${curr.condition} · Wind ${curr.windSpeed} km/h ${curr.windCardinal} · ${sum.precipProbability}% rain risk · [${adv.badge}]`);
  }

  // 3. Test individual destination route GET /api/weather/:dest
  console.log('\n[3] Testing Individual Destination Endpoints:');
  const srinagarRes = await fetch('http://localhost:3000/api/weather/srinagar');
  assert.strictEqual(srinagarRes.status, 200, '/api/weather/srinagar must return 200');
  assert.strictEqual(srinagarRes.json.id, 'srinagar');
  console.log('✓ GET /api/weather/srinagar returned 200 with Srinagar payload');

  const gulmargRes = await fetch('http://localhost:3000/api/weather/gulmarg');
  assert.strictEqual(gulmargRes.status, 200, '/api/weather/gulmarg must return 200');
  assert.strictEqual(gulmargRes.json.id, 'gulmarg');
  console.log('✓ GET /api/weather/gulmarg returned 200 with Gulmarg payload');

  const invalidRes = await fetch('http://localhost:3000/api/weather/nonexistent');
  assert.strictEqual(invalidRes.status, 404, '/api/weather/nonexistent must return 404');
  console.log('✓ Non-existent destination properly returns 404');

  // 4. Verify Homepage Integration
  console.log('\n[4] Verifying Homepage Weather Section & Modal:');
  const home = await fetch('http://localhost:3000/');
  assert.strictEqual(home.status, 200, 'Homepage must return 200');

  // Section 03 presence
  assert(home.body.includes('id="liveWeatherSection"'), 'Homepage must contain liveWeatherSection');
  assert(home.body.includes('weather-mobile-container'), 'Homepage must contain weather-mobile-container');
  assert(home.body.includes('weather-mobile-scroll-container'), 'Homepage must contain weather-mobile-scroll-container');
  assert(home.body.includes('weatherCardsGrid'), 'Homepage must contain weatherCardsGrid');

  // 6 Destinations in Homepage Cards
  assert(home.body.includes('data-dest="srinagar"'), 'Srinagar card must be present');
  assert(home.body.includes('data-dest="gulmarg"'), 'Gulmarg card must be present');
  assert(home.body.includes('data-dest="pahalgam"'), 'Pahalgam card must be present');
  assert(home.body.includes('data-dest="sonamarg"'), 'Sonamarg card must be present');
  assert(home.body.includes('data-dest="doodhpathri"'), 'Doodhpathri card must be present');
  assert(home.body.includes('data-dest="yusmarg"'), 'Yusmarg card must be present');
  console.log('✓ All 6 destination cards present on Homepage');

  // Modal presence
  assert(home.body.includes('id="weatherDetailModal"'), 'Homepage must contain weatherDetailModal');
  assert(home.body.includes('id="modalHourlyTrack"'), 'Modal must contain 24h hourly forecast track');
  assert(home.body.includes('id="modalDailyGrid"'), 'Modal must contain 5-day outlook grid');
  assert(home.body.includes('id="modalAdvisoryCard"'), 'Modal must contain mountain advisory card');
  assert(home.body.includes('id="modalDestTabs"'), 'Modal must contain destination switcher tabs');
  assert(home.body.includes('Open-Meteo High-Resolution Numerical Atmospheric Models'), 'Modal must contain Open-Meteo transparency notice');
  console.log('✓ Destination Weather Detail Modal & 24h/5-Day forecast elements present');

  console.log('\n🌟 ALL WEATHER SYSTEM REQUIREMENTS VERIFIED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('WEATHER TEST FAILED:', err);
  process.exit(1);
});
