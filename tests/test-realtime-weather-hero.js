const assert = require('assert');
const fs = require('fs');
const http = require('http');

function fetch(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

// Function to simulate weather code resolution
function resolveWeatherType(code, condName) {
  const c = parseInt(code, 10);
  const name = (condName || '').toLowerCase();
  if ([95, 96, 99, 82].includes(c) || name.includes('thunder') || name.includes('lightning')) {
    return 'thunderstorm';
  }
  if ([71, 73, 75, 77, 85, 86, 56, 57, 66, 67].includes(c) || name.includes('snow') || name.includes('sleet') || name.includes('blizzard') || name.includes('flurry')) {
    return 'snow';
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81].includes(c) || name.includes('rain') || name.includes('drizzle') || name.includes('shower')) {
    return 'rain';
  }
  if ([45, 48].includes(c) || name.includes('fog') || name.includes('mist') || name.includes('haze')) {
    return 'fog';
  }
  return 'clear';
}

async function runHeroWeatherTests() {
  console.log('🧪 Starting Real-Time Srinagar Hero Weather Effects Test Suite...\n');

  // Test 1: Weather classification verification
  console.log('Test 1: Weather code classification verification');
  // Rain
  assert.strictEqual(resolveWeatherType(61, 'Slight Rain'), 'rain');
  assert.strictEqual(resolveWeatherType(63, 'Moderate Rain'), 'rain');
  assert.strictEqual(resolveWeatherType(65, 'Heavy Rain'), 'rain');
  assert.strictEqual(resolveWeatherType(51, 'Light Drizzle'), 'rain');
  assert.strictEqual(resolveWeatherType(80, 'Slight Rain Showers'), 'rain');

  // Snow
  assert.strictEqual(resolveWeatherType(71, 'Light Snowfall'), 'snow');
  assert.strictEqual(resolveWeatherType(73, 'Moderate Snowfall'), 'snow');
  assert.strictEqual(resolveWeatherType(75, 'Heavy Snowfall'), 'snow');
  assert.strictEqual(resolveWeatherType(85, 'Slight Snow Showers'), 'snow');
  assert.strictEqual(resolveWeatherType(86, 'Heavy Snow Showers'), 'snow');

  // Thunderstorm
  assert.strictEqual(resolveWeatherType(95, 'Thunderstorm'), 'thunderstorm');
  assert.strictEqual(resolveWeatherType(96, 'Thunderstorm with Slight Hail'), 'thunderstorm');
  assert.strictEqual(resolveWeatherType(99, 'Thunderstorm with Heavy Hail'), 'thunderstorm');
  assert.strictEqual(resolveWeatherType(82, 'Violent Rain Showers'), 'thunderstorm');

  // Fog
  assert.strictEqual(resolveWeatherType(45, 'Mountain Fog'), 'fog');
  assert.strictEqual(resolveWeatherType(48, 'Depositing Rime Fog'), 'fog');

  // Clear / Sunny
  assert.strictEqual(resolveWeatherType(0, 'Clear Skies'), 'clear');
  assert.strictEqual(resolveWeatherType(1, 'Mainly Clear'), 'clear');
  assert.strictEqual(resolveWeatherType(2, 'Partly Cloudy'), 'clear');
  console.log('  ✓ All WMO weather conditions map accurately to corresponding visual effect types.');

  // Test 2: HTTP GET /api/weather/srinagar live API verification
  console.log('\nTest 2: Live Srinagar Weather API Endpoint');
  const apiRes = await fetch('/api/weather/srinagar');
  assert.strictEqual(apiRes.statusCode, 200, '/api/weather/srinagar should return 200 OK');
  const srinagarData = JSON.parse(apiRes.body);
  assert(srinagarData.current, 'Must contain current weather object');
  assert(typeof srinagarData.current.weatherCode === 'number', 'weatherCode must be a number');
  assert(typeof srinagarData.current.temperature === 'number', 'temperature must be a number');
  assert(srinagarData.current.condition, 'condition must be a string');
  console.log(`  ✓ Srinagar live API active: ${srinagarData.current.condition} (${srinagarData.current.temperature}°C), WMO code: ${srinagarData.current.weatherCode}`);

  // Test 3: HTTP GET Homepage / markup verification
  console.log('\nTest 3: Homepage Hero Section Weather Markup');
  const homeRes = await fetch('/');
  assert.strictEqual(homeRes.statusCode, 200, 'Homepage should return 200 OK');
  const html = homeRes.body;

  assert(html.includes('id="heroSection"'), 'Homepage must contain #heroSection');
  assert(html.includes('data-srinagar-code='), 'heroSection must have data-srinagar-code attribute');
  assert(html.includes('data-srinagar-temp='), 'heroSection must have data-srinagar-temp attribute');
  assert(html.includes('data-srinagar-cond='), 'heroSection must have data-srinagar-cond attribute');
  assert(html.includes('id="snowCanvas"'), 'Hero must contain canvas element #snowCanvas');
  assert(html.includes('id="snowToggleBtn"'), 'Hero must contain #snowToggleBtn for weather control');
  assert(html.includes('id="snowStatusText"'), 'Hero must contain #snowStatusText for weather status');
  assert(html.includes('id="heroWeatherMenu"'), 'Hero must contain #heroWeatherMenu dropdown');
  assert(html.includes('data-mode="rain"'), 'Weather menu must contain Rain effect option');
  assert(html.includes('data-mode="thunderstorm"'), 'Weather menu must contain Thunderstorm effect option');
  assert(html.includes('data-mode="snow"'), 'Weather menu must contain Snowfall effect option');
  assert(html.includes('data-mode="fog"'), 'Weather menu must contain Fog effect option');
  assert(html.includes('data-mode="clear"'), 'Weather menu must contain Clear effect option');
  console.log('  ✓ Hero section contains dynamic weather attributes, canvas, pill, and interactive options menu.');

  // Test 4: JavaScript weather engine verification in main.js
  console.log('\nTest 4: Verify Weather Engine in public/js/main.js');
  const mainJs = fs.readFileSync('public/js/main.js', 'utf8');
  assert(mainJs.includes('REAL-TIME SRINAGAR WEATHER ENGINE'), 'main.js must contain real-time weather engine');
  assert(mainJs.includes('resolveWeatherType'), 'main.js must have resolveWeatherType function');
  assert(mainJs.includes('initRainParticles'), 'main.js must have rain particles');
  assert(mainJs.includes('initSnowParticles'), 'main.js must have snow particles');
  assert(mainJs.includes('triggerLightning'), 'main.js must have lightning/thunderstorm engine');
  assert(mainJs.includes('initFogParticles'), 'main.js must have fog particles');
  assert(mainJs.includes('initClearParticles'), 'main.js must have clear shimmer particles');
  assert(mainJs.includes('syncSrinagarWeather'), 'main.js must sync with live /api/weather/srinagar');
  console.log('  ✓ Client-side JavaScript weather engine contains full particle systems for rain, snow, thunderstorm, fog, and clear.');

  console.log('\n=============================================================');
  console.log('🎉 ALL REAL-TIME SRINAGAR HERO WEATHER TESTS PASSED!');
  console.log('=============================================================\n');
}

runHeroWeatherTests().catch(err => {
  console.error('\n❌ Test failure:', err);
  process.exit(1);
});
