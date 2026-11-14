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

function fetchNoFollow(url) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: 'GET' }, (res) => {
      resolve({ status: res.statusCode, headers: res.headers });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- TESTING WEBSITE UPDATES ---');

  // 1. Verify /gallery and /faq 301 redirects
  const gallRes = await fetchNoFollow('http://localhost:3000/gallery');
  assert.strictEqual(gallRes.status, 301, '/gallery must return 301 redirect');
  assert.strictEqual(gallRes.headers.location, '/', '/gallery must redirect to /');
  console.log('✓ /gallery -> 301 to / verified');

  const faqRes = await fetchNoFollow('http://localhost:3000/faq');
  assert.strictEqual(faqRes.status, 301, '/faq must return 301 redirect');
  assert.strictEqual(faqRes.headers.location, '/', '/faq must redirect to /');
  console.log('✓ /faq -> 301 to / verified');

  // 2. Verify Homepage HTML
  const home = await fetch('http://localhost:3000/');
  assert.strictEqual(home.status, 200, 'Homepage must return 200');

  // Navigation check: No /gallery or /faq links in header/footer
  assert(!home.body.includes('href="/gallery"'), 'Homepage must not have href="/gallery" in navigation');
  assert(!home.body.includes('href="/faq"'), 'Homepage must not have href="/faq" in navigation');
  console.log('✓ Navigation menus verified: /gallery and /faq completely removed');

  // Section 03 check: Mountain Climate & Travel Advisory
  assert(home.body.includes('weather-mobile-container'), 'Homepage must contain weather-mobile-container');
  assert(home.body.includes('weather-mobile-scroll-container'), 'Homepage must contain weather-mobile-scroll-container');
  assert(home.body.includes('Scroll Valleys'), 'Homepage must contain mobile scroll indicator');
  console.log('✓ Section 03 (Mountain Climate) mobile 2-col vertical scroll verified');

  // Section 08 check: Our Commitment
  assert(home.body.includes('Travel With Confidence'), 'Homepage must contain Travel With Confidence');
  console.log('✓ Section 08 (Our Commitment) verified');

  // Customer Photo Carousel removal check
  assert(!home.body.includes('id="travellerMemoriesSection"'), 'Homepage must NOT contain travellerMemoriesSection after deletion request');
  assert(!home.body.includes('Memories by Our Travellers'), 'Homepage must NOT contain Memories by Our Travellers heading');
  console.log('✓ Verified Memories by Our Travellers section deleted from homepage');

  // 3. Verify About page
  const about = await fetch('http://localhost:3000/about');
  assert.strictEqual(about.status, 200, 'About page must return 200');
  assert(!about.body.includes('href="/gallery"'), 'About page must not have href="/gallery"');
  assert(!about.body.includes('href="/faq"'), 'About page must not have href="/faq"');
  assert(about.body.includes('id="purposeDirectionSection"'), 'About page must contain purposeDirectionSection');
  assert(about.body.includes('PURPOSE & DIRECTION'), 'About page must contain PURPOSE & DIRECTION badge');
  console.log('✓ About page Purpose & Direction tiles verified');

  // 4. Verify Packages page
  const pkgs = await fetch('http://localhost:3000/packages');
  assert.strictEqual(pkgs.status, 200, 'Packages page must return 200');
  assert(!pkgs.body.includes('href="/gallery"'), 'Packages page must not have href="/gallery"');
  assert(!pkgs.body.includes('href="/faq"'), 'Packages page must not have href="/faq"');
  console.log('✓ Packages page verified');

  // 5. Verify Hotels page
  const hotels = await fetch('http://localhost:3000/hotels');
  assert.strictEqual(hotels.status, 200, 'Hotels page must return 200');
  assert(!hotels.body.includes('href="/gallery"'), 'Hotels page must not have href="/gallery"');
  assert(!hotels.body.includes('href="/faq"'), 'Hotels page must not have href="/faq"');
  console.log('✓ Hotels page verified');

  // 6. Verify Destinations page
  const dests = await fetch('http://localhost:3000/destinations');
  assert.strictEqual(dests.status, 200, 'Destinations page must return 200');
  assert(!dests.body.includes('href="/gallery"'), 'Destinations page must not have href="/gallery"');
  assert(!dests.body.includes('href="/faq"'), 'Destinations page must not have href="/faq"');
  console.log('✓ Destinations page verified');

  // 7. Verify Experiences page
  const exps = await fetch('http://localhost:3000/experiences');
  assert.strictEqual(exps.status, 200, 'Experiences page must return 200');
  assert(!exps.body.includes('href="/gallery"'), 'Experiences page must not have href="/gallery"');
  assert(!exps.body.includes('href="/faq"'), 'Experiences page must not have href="/faq"');
  console.log('✓ Experiences page verified');

  // 8. Verify Contact page
  const contact = await fetch('http://localhost:3000/contact');
  assert.strictEqual(contact.status, 200, 'Contact page must return 200');
  assert(!contact.body.includes('href="/gallery"'), 'Contact page must not have href="/gallery"');
  assert(!contact.body.includes('href="/faq"'), 'Contact page must not have href="/faq"');
  console.log('✓ Contact page verified');

  console.log('\n🌟 ALL WEBSITE UPDATES VERIFIED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
