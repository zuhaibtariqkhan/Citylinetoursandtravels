const http = require('http');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== TESTING TOP LOADING / PROGRESS BAR & PERFORMANCE OPTIMISATIONS ===\n');

// 1. Verify loading-bar.js file existence and contents
const loadingBarJsPath = path.join(__dirname, '..', 'public', 'js', 'loading-bar.js');
assert(fs.existsSync(loadingBarJsPath), 'loading-bar.js must exist in public/js/');
const loadingBarSource = fs.readFileSync(loadingBarJsPath, 'utf8');

assert(loadingBarSource.includes('window.TopProgressBar = { start, done, reset, set }'), 'Must export TopProgressBar API');
assert(loadingBarSource.includes('document.addEventListener(\'click\''), 'Must have global click listener');
assert(loadingBarSource.includes('window.location.origin'), 'Must filter by same-origin');
assert(loadingBarSource.includes('pageshow'), 'Must handle BFCache pageshow');
assert(loadingBarSource.includes('beforeunload'), 'Must handle beforeunload');
assert(loadingBarSource.includes('8000'), 'Must have 8-second safety timeout');
console.log('✓ loading-bar.js source and capabilities verified.');

// 2. Test HTTP endpoints
function fetchUrl(urlPath, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, { headers }, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(data)
      }));
    }).on('error', reject);
  });
}

const testPages = [
  '/',
  '/about',
  '/packages',
  '/packages/winter-wonderland-kashmir-package',
  '/packages/kashmir-honeymoon-special-package',
  '/destinations',
  '/experiences',
  '/hotels',
  '/gallery',
  '/contact',
  '/faq',
  '/terms',
  '/privacy'
];

async function run() {
  for (const page of testPages) {
    const res = await fetchUrl(page);
    assert.strictEqual(res.statusCode, 200, `Page ${page} must return 200 OK`);
    const html = res.body.toString('utf8');

    // Verify topLoadingBar element
    assert(html.includes('id="topLoadingBar"'), `Page ${page} must include #topLoadingBar element in DOM`);
    assert(html.includes('top-loading-bar-indicator'), `Page ${page} must include loading indicator`);
    assert(html.includes('top-loading-bar-glow'), `Page ${page} must include glowing element`);

    // Verify loading-bar.js inclusion
    assert(html.includes('/js/loading-bar.js'), `Page ${page} must load /js/loading-bar.js`);

    // Verify main.js inclusion
    assert(html.includes('/js/main.js'), `Page ${page} must load /js/main.js`);
  }
  console.log(`✓ All ${testPages.length} public pages verified with #topLoadingBar, loading-bar.js, and main.js.`);

  // 3. Test Gzip Compression
  const resGzip = await fetchUrl('/', { 'Accept-Encoding': 'gzip' });
  assert.strictEqual(resGzip.headers['content-encoding'], 'gzip', 'Server should return gzip compressed response for HTML');
  console.log(`✓ Gzip compression active! (Uncompressed was 164 KB, compressed is ${Math.round(resGzip.body.length / 1024)} KB)`);

  // 4. Test Static Asset Cache-Control
  const resCss = await fetchUrl('/css/style.css');
  assert(resCss.headers['cache-control'] && resCss.headers['cache-control'].includes('max-age='), 'Static assets must have Cache-Control max-age header');
  console.log('✓ Static assets Cache-Control verified:', resCss.headers['cache-control']);

  // 5. Test &amp; URL normalization
  const resNormalized = await fetchUrl('/HOTELS/NAMROSE%20RESORTS%20&amp;%20SPA.jpeg');
  assert.strictEqual(resNormalized.statusCode, 200, 'Requests with &amp; entity should be normalized and return 200 OK');
  console.log('✓ URL normalization for HTML-escaped &amp; verified (Status 200 OK).');

  console.log('\n=== ALL TOP LOADING BAR & OPTIMISATION TESTS PASSED! ===');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
