const http = require('http');

function fetchPage(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data, headers: res.headers });
      });
    }).on('error', reject);
  });
}

function calculateTulipPrice(travellers) {
  if (travellers < 2) travellers = 2;
  const additional = travellers - 2;
  const additionalCharge = additional * 13500;
  const total = 27000 + additionalCharge;
  const perPerson = Math.round(total / travellers);
  return { travellers, additional, additionalCharge, total, perPerson };
}

async function runTests() {
  console.log('--- TESTING TULIP FESTIVAL PACKAGE IMPLEMENTATION ---');
  let failures = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ ${message}`);
    } else {
      console.error(`✗ FAILED: ${message}`);
      failures++;
    }
  }

  // 1. Math and Formula Verification
  console.log('\n[1] Math & Formula Verification:');
  const expectedTiers = [
    { pax: 2, total: 27000, perPerson: 13500 },
    { pax: 3, total: 40500, perPerson: 13500 },
    { pax: 4, total: 54000, perPerson: 13500 },
    { pax: 5, total: 67500, perPerson: 13500 },
    { pax: 6, total: 81000, perPerson: 13500 },
    { pax: 7, total: 94500, perPerson: 13500 },
    { pax: 8, total: 108000, perPerson: 13500 }
  ];

  expectedTiers.forEach(tier => {
    const calc = calculateTulipPrice(tier.pax);
    assert(
      calc.total === tier.total && calc.perPerson === tier.perPerson,
      `Formula for ${tier.pax} travellers = ₹${calc.total.toLocaleString('en-IN')} (Expected: ₹${tier.total.toLocaleString('en-IN')})`
    );
  });

  // 2. Package Detail Page Request
  console.log('\n[2] Package Detail Page Tests:');
  const slug = 'tulip-festival-blooming-paradise-kashmir-4d3n';
  const detailRes = await fetchPage(`/packages/${slug}`);
  assert(detailRes.statusCode === 200, `GET /packages/${slug} returns 200 OK`);

  const body = detailRes.body;
  assert(body.includes('Tulip Festival – The Blooming Paradise of Kashmir'), 'Package title rendered');
  assert(body.includes('Where Your Travel Dreams Take Flight'), 'Tagline rendered');
  assert(body.includes('3 Nights / 4 Days'), 'Duration 3 Nights / 4 Days rendered');
  assert(body.includes('Srinagar – Pahalgam – Gulmarg – Srinagar'), 'Route rendered');
  assert(body.includes('₹27,000'), 'Starting price ₹27,000 rendered');

  // Calculator DOM checks
  assert(body.includes('id="tulipMinusBtn"'), 'Calculator has #tulipMinusBtn');
  assert(body.includes('id="tulipPlusBtn"'), 'Calculator has #tulipPlusBtn');
  assert(body.includes('id="tulipTravellersCount"'), 'Calculator has #tulipTravellersCount');
  assert(body.includes('id="tulipTotalPriceDisplay"'), 'Calculator has #tulipTotalPriceDisplay');
  assert(body.includes('id="tulipPerPersonDisplay"'), 'Calculator has #tulipPerPersonDisplay');
  assert(body.includes('tulip-tier-card'), 'Calculator contains quick reference tier cards');

  // Day-wise itinerary checks
  assert(body.includes('ARRIVAL IN SRINAGAR &amp; LOCAL SIGHTSEEING') || body.includes('ARRIVAL IN SRINAGAR & LOCAL SIGHTSEEING'), 'Day 1 title rendered');
  assert(body.includes('Indira Gandhi Memorial Tulip Garden'), 'Tulip Garden rendered in Day 1');
  assert(body.includes('SRINAGAR TO PAHALGAM — THE VALLEY OF SHEPHERDS'), 'Day 2 title rendered');
  assert(body.includes('PAHALGAM TO GULMARG — THE MEADOW OF FLOWERS'), 'Day 3 title rendered');
  assert(body.includes('GULMARG TO SRINAGAR AIRPORT — DEPARTURE'), 'Day 4 title rendered');

  // Inclusions & Exclusions
  assert(body.includes('Accommodation in well-rated hotels'), 'Inclusion: hotels rendered');
  assert(body.includes('Comfortable Deluxe Sedan for the complete tour'), 'Inclusion: Sedan rendered');
  assert(body.includes('Daily breakfast and dinner at hotels'), 'Inclusion: breakfast & dinner rendered');
  assert(body.includes('Airport pickup and departure transfers'), 'Inclusion: transfers rendered');

  // Important Notes
  assert(body.includes('IMPORTANT NOTE — SIGHTSEEING &amp; ACTIVITY CHARGES') || body.includes('IMPORTANT NOTE — SIGHTSEEING & ACTIVITY CHARGES'), 'Important Notes title rendered');
  assert(body.includes('Entry tickets to gardens, monuments and sightseeing attractions are not included'), 'Note on entry tickets rendered');
  assert(body.includes('Tulip blooming is seasonal and depends on weather conditions'), 'Note on seasonal blooming rendered');

  // Responsible Tourism
  assert(body.includes('OUR REQUEST — KEEP KASHMIR CLEAN &amp; GREEN') || body.includes('OUR REQUEST — KEEP KASHMIR CLEAN & GREEN'), 'Responsible Tourism title rendered');
  assert(body.includes('Do not throw plastic bottles, wrappers or waste in public areas'), 'Responsible guideline rendered');
  assert(body.includes('Let&#39;s keep Kashmir Clean &amp; Green') || body.includes("Let's keep Kashmir Clean & Green"), 'Closing green message rendered');
  assert(body.includes('Respect Every Faith, Embrace Every Journey'), 'Closing tagline rendered');

  // WhatsApp official number
  assert(body.includes('916006725007'), 'Official WhatsApp number 916006725007 present');

  // 3. Alias Slug Verification
  console.log('\n[3] Alias Route Tests:');
  const aliasRes = await fetchPage('/packages/tulip-festival');
  assert(aliasRes.statusCode === 200, 'GET /packages/tulip-festival returns 200 OK');
  assert(aliasRes.body.includes('Tulip Festival – The Blooming Paradise of Kashmir'), 'Alias page contains package title');

  // 4. Print Itinerary Page Verification
  console.log('\n[4] Printable Itinerary Tests:');
  const printRes = await fetchPage(`/packages/${slug}/print`);
  assert(printRes.statusCode === 200, 'GET print itinerary returns 200 OK');
  assert(printRes.body.includes('Tulip Festival – The Blooming Paradise of Kashmir'), 'Print page contains title');
  assert(printRes.body.includes('Comfortable Deluxe Sedan'), 'Print page contains vehicle');

  // 5. Packages Listing Page & Dropdown Calculator
  console.log('\n[5] Packages Listing & Global Calculator:');
  const pkgsPage = await fetchPage('/packages');
  assert(pkgsPage.statusCode === 200, 'GET /packages returns 200 OK');
  assert(pkgsPage.body.includes('tulip-festival-blooming-paradise'), 'Dropdown includes tulip-festival-blooming-paradise');
  assert(pkgsPage.body.includes('data-model="tulip_festival"'), 'Dropdown option has data-model="tulip_festival"');

  // 6. Homepage listing
  console.log('\n[6] Homepage Packages Section:');
  const homePage = await fetchPage('/');
  assert(homePage.statusCode === 200, 'GET / returns 200 OK');
  assert(homePage.body.includes('Tulip Festival – The Blooming Paradise of Kashmir'), 'Homepage features Tulip Festival');

  if (failures === 0) {
    console.log('\n🌟 ALL TULIP FESTIVAL PACKAGE TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.error(`\n❌ ${failures} test assertion(s) failed.\n`);
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
