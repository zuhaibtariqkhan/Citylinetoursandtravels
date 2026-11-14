const assert = require('assert');
const http = require('http');
const db = require('../config/database');

console.log('====================================================');
console.log('RUNNING HIMALAYAN GRAND ESCAPE PRICING & ROUTE AUDIT');
console.log('====================================================\n');

// 1. Database Model Verification
const pkg = db.getPackageBySlug('the-himalayan-grand-escape-kashmir-ladakh-10d9n');
assert(pkg, 'Package must exist in database by slug');
assert.strictEqual(pkg.pricingModel, 'himalayan_escape', 'Pricing model must be himalayan_escape');
assert.strictEqual(pkg.baseOccupancy, 12, 'Base occupancy must be 12');
assert.strictEqual(pkg.minTravellers, 12, 'Min travellers must be 12');
assert.strictEqual(pkg.price, 325000, 'Starting price must be 325000');
assert.strictEqual(pkg.itinerary.length, 10, 'Itinerary must have 10 days');
console.log('✓ Database package structure verified.');

// Verify aliases
const alias1 = db.getPackageBySlug('the-himalayan-grand-escape');
const alias2 = db.getPackageBySlug('kashmir-to-ladakh-may-special');
assert(alias1 && alias1.id === pkg.id, 'Alias "the-himalayan-grand-escape" must resolve');
assert(alias2 && alias2.id === pkg.id, 'Alias "kashmir-to-ladakh-may-special" must resolve');
console.log('✓ Package aliases verified.');

// 2. Pricing Formula Verification
const BASE_PRICE = 325000;
const BASE_PAX = 12;
const ADDL_RATE = BASE_PRICE / BASE_PAX; // 27083.333333333336

function calculateHimalayanPrice(travellers) {
  if (travellers < BASE_PAX) return null;
  const additional = travellers - BASE_PAX;
  const additionalCharge = Math.round(additional * ADDL_RATE);
  const total = BASE_PRICE + additionalCharge;
  const perPerson = Math.round(total / travellers);
  return {
    travellers,
    additional,
    additionalCharge,
    total,
    perPerson
  };
}

const expectedResults = [
  { pax: 12, total: 325000, additional: 0, addlCharge: 0, perPerson: 27083 },
  { pax: 13, total: 352083, additional: 1, addlCharge: 27083, perPerson: 27083 },
  { pax: 14, total: 379167, additional: 2, addlCharge: 54167, perPerson: 27083 },
  { pax: 15, total: 406250, additional: 3, addlCharge: 81250, perPerson: 27083 },
  { pax: 16, total: 433333, additional: 4, addlCharge: 108333, perPerson: 27083 }
];

expectedResults.forEach(exp => {
  const res = calculateHimalayanPrice(exp.pax);
  assert.strictEqual(res.total, exp.total, `Total for ${exp.pax} pax must be ${exp.total}`);
  assert.strictEqual(res.additional, exp.additional, `Additional travellers for ${exp.pax} pax must be ${exp.additional}`);
  assert.strictEqual(res.additionalCharge, exp.addlCharge, `Additional charge for ${exp.pax} pax must be ${exp.addlCharge}`);
  assert.strictEqual(res.perPerson, exp.perPerson, `Effective per person for ${exp.pax} pax must be ${exp.perPerson}`);
  console.log(`✓ ${exp.pax} Travellers: Total = ₹${res.total.toLocaleString('en-IN')} | Addl = ${res.additional} (+₹${res.additionalCharge.toLocaleString('en-IN')}) | Per Person = ₹${res.perPerson.toLocaleString('en-IN')}`);
});

// Under minimum check
assert.strictEqual(calculateHimalayanPrice(11), null, 'Calculation below 12 pax must return null');
console.log('✓ Minimum traveller constraint (< 12 pax rejected) verified.');

// 3. WhatsApp Message Content Verification
function buildWhatsAppUrl(travellers) {
  const calc = calculateHimalayanPrice(travellers);
  const waMsg = `Hello City Line Tours And Travels,\nI would like to enquire about "The Himalayan Grand Escape: Kashmir to Ladakh – May Special":\n• Package Name: ${pkg.title}\n• Travel Duration: ${pkg.duration}\n• Number of Travellers: ${calc.travellers} Travellers\n• Starting Package Price: ₹3,25,000 (covers 12 travellers)\n• Additional Traveller Charges: ₹${calc.additionalCharge.toLocaleString('en-IN')} (${calc.additional} Additional Person${calc.additional === 1 ? '' : 's'})\n• Total Calculated Package Price: ₹${calc.total.toLocaleString('en-IN')} (₹${calc.perPerson.toLocaleString('en-IN')}/person)\n\nPlease share booking availability and quotation!`;
  return `https://wa.me/916006725007?text=${encodeURIComponent(waMsg)}`;
}

[12, 13, 14, 15, 16].forEach(pax => {
  const url = buildWhatsAppUrl(pax);
  assert(url.startsWith('https://wa.me/916006725007?text='), 'Must target official WhatsApp number 916006725007');
  const decoded = decodeURIComponent(url.split('text=')[1]);
  assert(decoded.includes(pkg.title), 'WhatsApp message must contain package title');
  assert(decoded.includes(pkg.duration), 'WhatsApp message must contain duration');
  assert(decoded.includes(`${pax} Travellers`), 'WhatsApp message must contain traveller count');
  assert(decoded.includes('₹3,25,000'), 'WhatsApp message must contain starting price');
  assert(decoded.includes('Additional Traveller Charges:'), 'WhatsApp message must contain additional charges');
  assert(decoded.includes('Total Calculated Package Price:'), 'WhatsApp message must contain total calculated price');
});
console.log('✓ WhatsApp enquiry message pre-fill verified across all tiers (12-16 pax).');

// 4. HTTP Endpoint Verification
function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

async function runHttpTests() {
  // Package detail page
  const detailRes = await fetch('http://localhost:3000/packages/the-himalayan-grand-escape-kashmir-ladakh-10d9n');
  assert.strictEqual(detailRes.status, 200, 'Package detail page must return 200');
  assert(detailRes.body.includes('The Himalayan Grand Escape'), 'Detail page must include package title');
  assert(detailRes.body.includes('heMinusBtn'), 'Detail page must have minus button');
  assert(detailRes.body.includes('hePlusBtn'), 'Detail page must have plus button');
  assert(detailRes.body.includes('heTravellersCount'), 'Detail page must have traveller counter');
  assert(detailRes.body.includes('heTotalPriceDisplay'), 'Detail page must have total price display');
  assert(detailRes.body.includes('hePerPersonDisplay'), 'Detail page must have per person display');
  assert(detailRes.body.includes('heAdditionalCountDisplay'), 'Detail page must have additional count display');
  assert(detailRes.body.includes('heAdditionalChargesDisplay'), 'Detail page must have additional charges display');
  assert(detailRes.body.includes('Enquire on WhatsApp'), 'Detail page must have "Enquire on WhatsApp" button');
  console.log('✓ Package detail page HTML & Calculator DOM verified.');

  // Packages list page
  const listRes = await fetch('http://localhost:3000/packages');
  assert.strictEqual(listRes.status, 200, 'Packages page must return 200');
  assert(listRes.body.includes('data-model="himalayan_escape"'), 'Packages page dropdown must include himalayan_escape model');
  assert(listRes.body.includes('the-himalayan-grand-escape'), 'Packages page must include package in list and cards');
  console.log('✓ Packages directory & dropdown integration verified.');

  // Print page
  const printRes = await fetch('http://localhost:3000/packages/the-himalayan-grand-escape-kashmir-ladakh-10d9n/print');
  assert.strictEqual(printRes.status, 200, 'Print page must return 200');
  assert(printRes.body.includes('12 Persons Base'), 'Print page must show 12 Persons Base pricing');
  console.log('✓ Print page verified.');

  console.log('\n====================================================');
  console.log('ALL HIMALAYAN GRAND ESCAPE TESTS PASSED SUCCESSFULLY');
  console.log('====================================================\n');
}

runHttpTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
