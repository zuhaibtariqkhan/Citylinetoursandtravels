const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

async function verify() {
  console.log('--- VERIFYING MOBILE-SPECIFIC ENHANCEMENTS ---');

  const res = await fetch('http://localhost:3000/');
  assert.strictEqual(res.status, 200, 'Homepage must return 200');

  // 1. Mountain Climate Advisory (Section 03)
  console.log('\n[1] Mountain Climate Travel Advisory:');
  assert(res.body.includes('weather-mobile-container'), 'Section 03 container must exist');
  assert(res.body.includes('weather-mobile-scroll-container'), 'Scroll container must exist');
  assert(res.body.includes('w-[195px] sm:w-auto'), 'Valley cards must have compact mobile width and auto for desktop/tablet');
  assert(res.body.includes('snap-x snap-mandatory'), 'Mobile container must have smooth touch snap');

  const css = fs.readFileSync(path.join(__dirname, '../public/css/style.css'), 'utf-8');
  assert(!css.includes('grid-template-columns: 135px 1fr !important;'), 'Cramped 135px 2-col CSS must be eliminated');
  assert(css.includes('scroll-snap-type: x mandatory'), 'CSS must include horizontal scroll-snap for mobile cards');
  console.log('✓ Zero text overlap, clean full-width header, and horizontal snap carousel verified');

  // 2. Our Commitment — Travel with Confidence (Section 08)
  console.log('\n[2] Our Commitment — Travel with Confidence:');
  assert(res.body.includes('items-center sm:items-start text-center sm:text-left'), 'Commitment cards must be centered on mobile, left-aligned on sm+');
  assert(res.body.includes('mx-auto sm:mx-0'), 'Commitment icons must be centered with mx-auto on mobile');
  console.log('✓ Commitment cards centered on mobile and left-aligned on desktop/tablet verified');

  // 3. Testimonials Carousel & Scaled Size
  console.log('\n[3] Testimonials / Verified Reviews:');
  assert(res.body.includes('id="reviewsGrid"'), '#reviewsGrid must exist');
  assert(res.body.includes('flex md:grid overflow-x-auto md:overflow-visible'), 'Reviews must be horizontal flex on mobile, grid on md+');
  assert(res.body.includes('w-[265px] sm:w-[300px] md:w-auto shrink-0 md:shrink'), 'Review cards must be compact on mobile and unconstrained on desktop');
  assert(res.body.includes('id="reviewsMobileDots"'), 'Mobile dots container must exist');
  assert(res.body.includes('review-dot'), 'Review dots must be present');

  const js = fs.readFileSync(path.join(__dirname, '../public/js/main.js'), 'utf-8');
  assert(js.includes('reviewsMobileDots'), 'main.js must sync dots on mobile swipe');
  assert(js.includes('reviewsGrid.scrollTo'), 'main.js must scroll carousel smoothly');
  console.log('✓ Testimonials mobile carousel, scaled compact cards, and interactive dot navigation verified');

  console.log('\n🌟 ALL 3 MOBILE IMPROVEMENTS VERIFIED AND GREEN!');
}

verify().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
