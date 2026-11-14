const assert = require('assert');
const http = require('http');

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('--- TESTING AMARNATH YATRA PACKAGE IMPLEMENTATION ---');

  // [1] Math & Formula Verification
  console.log('\n[1] Math & Formula Verification:');
  const BASE_PRICE = 35000;
  const BASE_PAX = 2;
  const ADDL_RATE = 17500;

  function calcTotal(yatris) {
    if (yatris < BASE_PAX) throw new Error('Minimum 2 Yatris required');
    const addl = yatris - BASE_PAX;
    return BASE_PRICE + (addl * ADDL_RATE);
  }

  const testTiers = [
    { pax: 2, expected: 35000 },
    { pax: 3, expected: 52500 },
    { pax: 4, expected: 70000 },
    { pax: 5, expected: 87500 },
    { pax: 6, expected: 105000 },
    { pax: 7, expected: 122500 },
    { pax: 8, expected: 140000 }
  ];

  testTiers.forEach(t => {
    const total = calcTotal(t.pax);
    assert.strictEqual(total, t.expected, `Formula for ${t.pax} Yatris must be ₹${t.expected.toLocaleString('en-IN')}`);
    const perYatri = Math.round(total / t.pax);
    assert.strictEqual(perYatri, 17500, `Per Yatri price must remain ₹17,500`);
    console.log(`✓ Formula for ${t.pax} Yatris = ₹${total.toLocaleString('en-IN')} (Expected: ₹${t.expected.toLocaleString('en-IN')}) • ₹${perYatri.toLocaleString('en-IN')} / Yatri`);
  });

  // [2] Package Detail Page Tests
  console.log('\n[2] Package Detail Page Tests:');
  const res = await fetch('http://localhost:3000/packages/amarnath-yatra-holy-cave-baba-barfani-5d4n');
  assert.strictEqual(res.status, 200, 'GET /packages/amarnath-yatra-holy-cave-baba-barfani-5d4n must return 200 OK');

  // Header and core info
  assert(res.body.includes('Amarnath Yatra'), 'Must contain package title');
  assert(res.body.includes('A Sacred Journey to the Holy Cave of Baba Barfani'), 'Must contain main heading');
  assert(res.body.includes('Respect Every Faith, Embrace Every Journey.'), 'Must contain brand tagline');
  assert(res.body.includes('04 Nights / 05 Days') || res.body.includes('4 Nights / 5 Days'), 'Must contain duration');
  assert(res.body.includes('Srinagar – Sonamarg – Baltal – Holy Amarnath Cave – Srinagar'), 'Must contain route');
  assert(res.body.includes('₹35,000'), 'Must contain starting price ₹35,000');
  console.log('✓ Core Package Information & Typography verified');

  // Calculator controls & IDs
  assert(res.body.includes('id="amarnathMinusBtn"'), 'Must contain #amarnathMinusBtn');
  assert(res.body.includes('id="amarnathPlusBtn"'), 'Must contain #amarnathPlusBtn');
  assert(res.body.includes('id="amarnathYatrisCount"'), 'Must contain #amarnathYatrisCount');
  assert(res.body.includes('id="amarnathTotalPriceDisplay"'), 'Must contain #amarnathTotalPriceDisplay');
  assert(res.body.includes('id="amarnathPerPersonDisplay"'), 'Must contain #amarnathPerPersonDisplay');
  assert(res.body.includes('amarnath-tier-card'), 'Must contain quick reference tier cards');
  console.log('✓ Real-Time Calculator markup verified');

  // Day-wise itinerary
  assert(res.body.includes('ARRIVAL IN SRINAGAR'), 'Day 1 title must be present');
  assert(res.body.includes('Shankaracharya Temple'), 'Day 1 Shankaracharya Temple must be present');
  assert(res.body.includes('BALTAL BASE CAMP'), 'Day 2 Baltal base camp must be present');
  assert(res.body.includes('HOLY AMARNATH CAVE'), 'Day 3 Holy Cave must be present');
  assert(res.body.includes('Baba Barfani'), 'Day 3 Baba Barfani must be present');
  assert(res.body.includes('14 km'), 'Day 3 Baltal 14 km trek info must be present');
  assert(res.body.includes('BALTAL – SONAMARG – SRINAGAR'), 'Day 4 return to Srinagar must be present');
  assert(res.body.includes('AIRPORT DEPARTURE'), 'Day 5 departure must be present');
  console.log('✓ All 5 Days of Detailed Itinerary verified');

  // Inclusions & Exclusions
  assert(res.body.includes('03 Nights accommodation in Srinagar'), 'Inclusion: 03 Nights Srinagar present');
  assert(res.body.includes('01 Night accommodation in Baltal / Sonamarg'), 'Inclusion: 01 Night Baltal/Sonamarg present');
  assert(res.body.includes('Amarnath Yatra registration and permit charges'), 'Exclusion: registration & permit present');
  assert(res.body.includes('Helicopter tickets'), 'Exclusion: helicopter tickets present');
  assert(res.body.includes('Pony, palki and porter charges'), 'Exclusion: pony & palki present');
  console.log('✓ Package Inclusions and Exclusions verified');

  // Route Comparison & Yatra Guidelines
  assert(res.body.includes('Baltal Route vs Pahalgam Route'), 'Route comparison header present');
  assert(res.body.includes('MANDATORY PILGRIMAGE PROTOCOL'), 'Yatra guidelines present');
  assert(res.body.includes('Compulsory Health Certificate (CHC)'), 'CHC certificate requirement present');
  assert(res.body.includes('RFID tracking card'), 'Mandatory RFID card requirement present');
  assert(res.body.includes('https://jksasb.nic.in/'), 'Official SASB Shrine Board link present');
  assert(res.body.includes('OPERATIONAL NOTICE'), 'Operational notice present');
  assert(res.body.includes('WHY CHOOSE CITY LINE TOURS AND TRAVELS?'), 'Why choose us present');
  assert(res.body.includes('916006725007'), 'Official WhatsApp contact 916006725007 present');
  console.log('✓ Route comparison, SASB portal link, Guidelines & WhatsApp integration verified');

  // [3] Alias Route Tests
  console.log('\n[3] Alias Route Tests:');
  const aliasRes = await fetch('http://localhost:3000/packages/amarnath-yatra');
  assert.strictEqual(aliasRes.status, 200, 'Alias /packages/amarnath-yatra must return 200 OK');
  assert(aliasRes.body.includes('A Sacred Journey to the Holy Cave of Baba Barfani'), 'Alias must load Amarnath package');
  console.log('✓ GET /packages/amarnath-yatra loads package successfully');

  // [4] Printable Itinerary Tests
  console.log('\n[4] Printable Itinerary Tests:');
  const printRes = await fetch('http://localhost:3000/packages/amarnath-yatra-holy-cave-baba-barfani-5d4n/print');
  assert.strictEqual(printRes.status, 200, 'Print itinerary must return 200 OK');
  assert(printRes.body.includes('A Sacred Journey to the Holy Cave of Baba Barfani'), 'Print page contains title');
  assert(printRes.body.includes('₹35,000'), 'Print page contains base price');
  console.log('✓ Print itinerary renders 200 OK with pricing badge');

  // [5] Packages Listing & Global Calculator
  console.log('\n[5] Packages Listing & Global Calculator:');
  const pkgsRes = await fetch('http://localhost:3000/packages');
  assert.strictEqual(pkgsRes.status, 200, 'GET /packages must return 200 OK');
  assert(pkgsRes.body.includes('amarnath-yatra-holy-cave-baba-barfani'), 'Packages dropdown includes amarnath package');
  assert(pkgsRes.body.includes('data-model="amarnath_yatra"'), 'Dropdown option has data-model="amarnath_yatra"');
  console.log('✓ /packages listing & global budget calculator integration verified');

  // [6] Homepage Packages Section
  console.log('\n[6] Homepage Packages Section:');
  const homeRes = await fetch('http://localhost:3000/');
  assert.strictEqual(homeRes.status, 200, 'GET / must return 200 OK');
  assert(homeRes.body.includes('Amarnath Yatra'), 'Homepage features Amarnath Yatra');
  console.log('✓ Homepage features Amarnath Yatra package');

  console.log('\n🌟 ALL AMARNATH YATRA PACKAGE TESTS PASSED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('AMARNATH PACKAGE TEST FAILED:', err);
  process.exit(1);
});
