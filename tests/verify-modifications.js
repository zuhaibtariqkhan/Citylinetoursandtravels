const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000' + path, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    }).on('error', reject);
  });
}

async function verifyAll() {
  console.log('--- Verifying Requirements ---');
  let passed = 0;
  let total = 0;

  function check(desc, condition) {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] ${desc}`);
    } else {
      console.error(`[FAIL] ${desc}`);
    }
  }
  
  // 1. Homepage
  const home = await get('/');
  check('Homepage returns 200', home.status === 200);
  check('Phone 6006725007 present on homepage', home.body.includes('6006725007'));
  check('Phone 9906676890 present on homepage', home.body.includes('9906676890'));
  check('WhatsApp 916006725007 linked on homepage', home.body.includes('916006725007'));
  check('Address displays Palpora, Srinagar, Jammu & Kashmir', home.body.includes('Palpora, Srinagar, Jammu & Kashmir'));
  check('Business timings display Monday – Saturday: 10:00 AM – 5:00 PM', home.body.includes('Monday – Saturday: 10:00 AM – 5:00 PM'));
  check('Customize Your Trip completely removed from homepage', !home.body.includes('/customize-trip'));
  check('Staff Login completely removed from footer', !home.body.includes('Staff Login'));
  check('Plan Your Trip / Plan My Custom Trip removed from footer', !home.body.includes('Plan Your Trip') && !home.body.includes('Plan My Custom Trip'));
  check('Floating WhatsApp widget removed', !home.body.includes('whatsapp-float group'));
  check('No outdated phone numbers (94190) on homepage', !home.body.includes('94190'));

  // 2. Packages Listing Page
  const pkgs = await get('/packages');
  check('Packages page returns 200', pkgs.status === 200);
  check('Budget Calculator present on Packages page (#calculator)', pkgs.body.includes('id="calculator"'));
  check('Heading "Calculate Your Kashmir Trip Budget" present', pkgs.body.includes('Calculate Your Kashmir Trip Budget'));
  check('Package selector dropdown present in calculator', pkgs.body.includes('id="pkgCalcSelect"'));
  check('Plus and Minus buttons present in calculator', pkgs.body.includes('id="pkgCalcMinus"') && pkgs.body.includes('id="pkgCalcPlus"'));
  check('Enquire button present in calculator', pkgs.body.includes('id="calcEnquireBtn"'));
  check('WhatsApp 916006725007 button present in calculator', pkgs.body.includes('916006725007'));

  // 3. Package Detail Page (Priced Package)
  const detail = await get('/packages/kashmir-classic-honeymoon-6d5n');
  check('Package detail returns 200', detail.status === 200);
  check('Budget Calculator present on Package Detail page', detail.body.includes('id="packageBudgetCalculator"'));
  check('Adults counter present on Package Detail', detail.body.includes('id="detailAdultsCount"'));
  check('Children counter present on Package Detail', detail.body.includes('id="detailKidsCount"'));
  check('Estimated Total Budget display present', detail.body.includes('id="detailTotalBudgetText"'));
  check('Estimated Per-Person display present', detail.body.includes('id="detailPerPersonText"'));
  check('WhatsApp 6006725007 button present on detail', detail.body.includes('916006725007'));

  // 4. Contact Page
  const contact = await get('/contact');
  check('Contact page returns 200', contact.status === 200);
  check('Contact shows both phone numbers', contact.body.includes('6006725007') && contact.body.includes('9906676890'));
  check('Contact shows Palpora, Srinagar address', contact.body.includes('Palpora, Srinagar, Jammu & Kashmir'));
  check('Contact shows Monday – Saturday: 10:00 AM – 5:00 PM', contact.body.includes('Monday – Saturday: 10:00 AM – 5:00 PM'));

  // 5. Unpriced Package (Quote On Request)
  const unpriced = await get('/packages/customised-kashmir-odyssey');
  check('Unpriced package detail returns 200', unpriced.status === 200);
  check('Displays "Contact us for a personalised quotation."', unpriced.body.includes('Contact us for a personalised quotation.'));
  check('Does not show ₹0 as package price', !unpriced.body.includes('₹0'));

  console.log(`\nResults: ${passed}/${total} checks passed.`);
  if (passed === total) {
    console.log('ALL 28 REQUIREMENTS AND TESTS PASSED PERFECTLY!');
  }
}

verifyAll().catch(console.error);

