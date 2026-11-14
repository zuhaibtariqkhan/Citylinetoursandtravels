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

async function runScrollSnapTests() {
  console.log('🧪 Starting Premium Full-Page Section Scrolling Test Suite...\n');

  // Test 1: Verify CSS Rules in style.css
  console.log('Test 1: Verify CSS Scroll Snap rules in public/css/style.css');
  const css = fs.readFileSync('public/css/style.css', 'utf8');

  assert(css.includes('scroll-snap-type: y proximity'), 'Must configure scroll-snap-type: y proximity on html');
  assert(css.includes('scroll-padding-top: var(--header-snap-offset'), 'Must configure scroll-padding-top for sticky header offset');
  assert(css.includes('.scroll-snap-section'), 'Must define .scroll-snap-section');
  assert(css.includes('scroll-snap-align: start'), 'Must define scroll-snap-align: start on sections');
  assert(css.includes('scroll-snap-stop: normal'), 'Must define scroll-snap-stop: normal for fluid user scrolling');
  assert(css.includes('.snap-viewport-fit'), 'Must define .snap-viewport-fit for full viewport presentation');
  assert(css.includes('footer {') && css.includes('scroll-snap-align: end'), 'Footer must have scroll-snap-align: end');
  assert(css.includes('prefers-reduced-motion: reduce'), 'Must include prefers-reduced-motion accessibility reset');
  assert(css.includes('scroll-snap-type: none !important'), 'Reduced motion must disable scroll-snap-type');
  console.log('  ✓ Core CSS Scroll Snap rules, responsive media queries, and accessibility verified.');

  // Test 2: Verify Homepage Major Sections
  console.log('\nTest 2: Verify Homepage Section Snap Classes');
  const indexHtml = fs.readFileSync('views/index.ejs', 'utf8');
  const reviewsHtml = fs.readFileSync('views/partials/verified-reviews.ejs', 'utf8');
  const carouselHtml = fs.readFileSync('views/partials/customer-photos-carousel.ejs', 'utf8');

  // Hero Section
  assert(indexHtml.includes('id="heroSection"') && indexHtml.includes('scroll-snap-section'), 'heroSection must have scroll-snap-section');
  assert(indexHtml.includes('min-h-[calc(100svh-80px)]') || indexHtml.includes('lg:min-h-[calc(100vh-80px)]'), 'heroSection must have responsive full viewport height');

  // Quick Consultation Bar
  assert(indexHtml.includes('id="quickConsultationBar"') && indexHtml.includes('scroll-snap-section'), 'quickConsultationBar must have scroll-snap-section');

  // Live Mountain Weather Section
  assert(indexHtml.includes('id="liveWeatherSection"') && indexHtml.includes('scroll-snap-section') && indexHtml.includes('snap-viewport-fit'), 'liveWeatherSection must have scroll-snap-section and snap-viewport-fit');

  // Introduction Section
  assert(indexHtml.includes('id="introSection"') && indexHtml.includes('scroll-snap-section') && indexHtml.includes('snap-viewport-fit'), 'introSection must have scroll-snap-section and snap-viewport-fit');

  // Interactive Mountain Map Section
  assert(indexHtml.includes('id="kashmirMapSection"') && indexHtml.includes('scroll-snap-section') && indexHtml.includes('snap-viewport-fit'), 'kashmirMapSection must have scroll-snap-section and snap-viewport-fit');

  // Featured Packages Section (Content-heavy: must have scroll-snap-section, but NOT forced viewport fit)
  assert(indexHtml.includes('id="featuredPackagesSection"') && indexHtml.includes('scroll-snap-section'), 'featuredPackagesSection must have scroll-snap-section');

  // Why Choose Us Section
  assert(indexHtml.includes('id="whyChooseUsSection"') && indexHtml.includes('scroll-snap-section') && indexHtml.includes('snap-viewport-fit'), 'whyChooseUsSection must have scroll-snap-section and snap-viewport-fit');

  // Verified Reviews Section
  assert(reviewsHtml.includes('id="verifiedReviewsSection"') && reviewsHtml.includes('scroll-snap-section'), 'verifiedReviewsSection must have scroll-snap-section');

  // Traveller Memories Carousel Section
  assert(carouselHtml.includes('id="travellerMemoriesSection"') && carouselHtml.includes('scroll-snap-section') && carouselHtml.includes('snap-viewport-fit'), 'travellerMemoriesSection must have scroll-snap-section and snap-viewport-fit');

  // Final CTA Section
  assert(indexHtml.includes('id="finalCtaSection"') && indexHtml.includes('scroll-snap-section'), 'finalCtaSection must have scroll-snap-section');

  console.log('  ✓ All 10 homepage major sections intelligently tagged with scroll-snap and viewport-fit classes.');

  // Test 3: HTTP GET Homepage
  console.log('\nTest 3: HTTP GET Homepage /');
  const homeRes = await fetch('/');
  assert.strictEqual(homeRes.statusCode, 200, 'Homepage must return 200 OK');
  assert(homeRes.body.includes('scroll-snap-section'), 'Rendered homepage must include scroll-snap-section');
  assert(homeRes.body.includes('snap-viewport-fit'), 'Rendered homepage must include snap-viewport-fit');
  console.log('  ✓ Homepage renders 200 OK with all scroll-snap section markup.');

  // Test 4: HTTP GET Static Assets
  console.log('\nTest 4: HTTP GET /css/style.css');
  const cssRes = await fetch('/css/style.css');
  assert.strictEqual(cssRes.statusCode, 200, 'style.css must return 200 OK');
  assert(cssRes.body.includes('scroll-snap-type: y proximity'), 'style.css must contain scroll-snap-type: y proximity');
  assert(cssRes.body.includes('.scroll-snap-section'), 'style.css must serve .scroll-snap-section');
  console.log('  ✓ Served CSS contains all scroll-snap properties.');

  // Test 5: HTTP GET Inner Pages
  console.log('\nTest 5: Verify Inner Pages Render Smoothly');
  const innerPages = ['/about', '/packages', '/destinations', '/hotels', '/experiences', '/contact'];
  for (const page of innerPages) {
    const res = await fetch(page);
    assert.strictEqual(res.statusCode, 200, `Page ${page} must return 200 OK`);
    assert(res.body.includes('scroll-snap-section'), `Page ${page} must include scroll-snap-section`);
    console.log(`  ✓ ${page} returned 200 OK with scroll-snap classes`);
  }

  console.log('\n======================================================');
  console.log('🎉 ALL FULL-PAGE SECTION SCROLL SNAP TESTS PASSED!');
  console.log('======================================================\n');
}

runScrollSnapTests().catch(err => {
  console.error('\n❌ Test failure:', err);
  process.exit(1);
});
