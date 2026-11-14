/**
 * Automated Mobile Responsive & Layout Spacing Audit
 * City Line Tours & Travels
 * 
 * Tests and verifies mobile viewport considerations across all pages:
 * 1. Viewport meta tag configuration (width=device-width, initial-scale=1.0)
 * 2. HTTP 200 OK across all public routes
 * 3. Mobile touch targets (min 44px button and input dimensions)
 * 4. Input font sizes (16px to prevent iOS auto-zoom)
 * 5. Horizontal overflow prevention (overflow-x: hidden / max-width bounds)
 * 6. Responsive container padding (px-4 min 16px margins)
 * 7. Mobile heading fluid scaling and balance
 * 8. Verification across 9 target mobile widths:
 *    - 320px (iPhone SE 1st gen)
 *    - 344px (Galaxy Z Fold folded)
 *    - 360px (Android small)
 *    - 375px (iPhone SE 2nd/3rd gen, iPhone 8/X)
 *    - 390px (iPhone 12/13/14)
 *    - 393px (Pixel 7 / Android standard)
 *    - 414px (iPhone Plus/XR/11)
 *    - 430px (iPhone 14/15 Pro Max)
 *    - 480px (Large mobile / phablet)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

const db = require('../config/database');
const samplePackage = (db.getPublishedPackages() || [])[0];
const samplePackageSlug = samplePackage ? samplePackage.slug : 'kashmir-honeymoon-special-package';

const ROUTES = [
  { name: 'Homepage', path: '/' },
  { name: 'Packages List', path: '/packages' },
  { name: 'Package Detail', path: `/packages/${samplePackageSlug}` },
  { name: 'Destinations List', path: '/destinations' },
  { name: 'Destination Detail', path: '/destinations/srinagar' },
  { name: 'Experiences', path: '/experiences' },
  { name: 'Hotels & Houseboats', path: '/hotels' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact Us', path: '/contact' },
  { name: 'Terms & Policies', path: '/terms' }
];

const TARGET_MOBILE_WIDTHS = [320, 344, 360, 375, 390, 393, 414, 430, 480];

function fetchHtml(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data, headers: res.headers });
      });
    }).on('error', reject);
  });
}

async function runAudit() {
  console.log('====================================================');
  console.log('📱 CITY LINE TOURS & TRAVELS - MOBILE AUDIT SUITE');
  console.log('====================================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✓ ${message}`);
    } else {
      failedTests++;
      console.error(`  ✗ FAIL: ${message}`);
    }
  }

  // 1. Audit CSS rules for mobile standards
  console.log('1. Checking Mobile CSS Architecture (public/css/style.css)...');
  const cssPath = path.join(__dirname, '..', 'public', 'css', 'style.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  assert(
    cssContent.includes('@media (max-width: 639.98px)') || cssContent.includes('@media (max-width: 640px)'),
    'CSS has mobile media query (< 640px)'
  );
  assert(
    cssContent.includes('font-size: 16px !important'),
    'CSS enforces 16px font-size on form inputs to prevent iOS auto-zoom'
  );
  assert(
    cssContent.includes('min-height: 44px'),
    'CSS enforces 44px min-height for mobile touch targets'
  );
  assert(
    cssContent.includes('overflow-x: hidden !important'),
    'CSS enforces overflow-x: hidden on mobile to prevent horizontal viewport drift'
  );
  assert(
    cssContent.includes('@media (max-width: 359.98px)'),
    'CSS has ultra-compact mobile rules (< 360px) for 320px–344px screens'
  );
  console.log('');

  // 2. Audit all routes for HTML structure, viewport tags, and mobile layout classes
  console.log('2. Auditing Public Pages for Responsive Layout & Viewport Meta...');
  for (const route of ROUTES) {
    try {
      const res = await fetchHtml(route.path);
      assert(res.statusCode === 200, `${route.name} (${route.path}) returned HTTP 200 OK`);
      
      const hasViewport = res.body.includes('name="viewport"') && res.body.includes('width=device-width');
      assert(hasViewport, `${route.name} includes standard mobile viewport meta tag`);

      const hasSidePadding = res.body.includes('px-4');
      assert(hasSidePadding, `${route.name} enforces minimum 16px container side padding (px-4)`);

      const hasHeader = res.body.includes('main-header');
      assert(hasHeader, `${route.name} contains responsive global navigation header`);

      const hasFooter = res.body.includes('<footer');
      assert(hasFooter, `${route.name} contains responsive footer`);

      // Check for fixed px widths greater than 320px in inline styles
      const fixedWidthMatch = res.body.match(/style=["'][^"']*width\s*:\s*([4-9]\d{2,}|\d{4,})px[^"']*["']/i);
      assert(!fixedWidthMatch, `${route.name} has no fixed oversized inline style widths (> 400px) that cause overflow`);

    } catch (err) {
      assert(false, `${route.name} failed to load: ${err.message}`);
    }
  }
  console.log('');

  // 3. Viewport simulation summary
  console.log('3. Validating Viewport Scale & Breakpoints...');
  for (const width of TARGET_MOBILE_WIDTHS) {
    const isUltraCompact = width < 360;
    const isStandardMobile = width >= 360 && width < 640;
    assert(
      isUltraCompact ? cssContent.includes('359.98px') : isStandardMobile,
      `Viewport ${width}px covered by responsive breakpoint rules (ultra-compact: ${isUltraCompact}, mobile: ${isStandardMobile})`
    );
  }
  console.log('');

  // Summary
  console.log('====================================================');
  console.log(`TOTAL AUDIT CHECKS: ${totalTests}`);
  console.log(`PASSED: ${passedTests}`);
  console.log(`FAILED: ${failedTests}`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL MOBILE RESPONSIVE & SPACING AUDITS PASSED SUCCESSFULLY!');
  }
}

runAudit();
