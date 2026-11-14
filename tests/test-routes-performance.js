const http = require('http');

const routes = [
  '/',
  '/about',
  '/packages',
  '/packages/winter-wonderland-kashmir-package',
  '/packages/kashmir-honeymoon-special-package',
  '/destinations',
  '/destinations/srinagar',
  '/destinations/gulmarg',
  '/destinations/pahalgam',
  '/destinations/sonamarg',
  '/experiences',
  '/hotels',
  '/gallery',
  '/contact',
  '/faq',
  '/terms',
  '/privacy'
];

function testRoute(route) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    http.get(`http://localhost:3000${route}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({
          route,
          statusCode: res.statusCode,
          duration,
          length: data.length,
          hasHeader: data.includes('id="main-header"'),
          hasScripts: data.includes('/js/main.js')
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing all public routes for response time and status...');
  let hasErrors = false;
  for (const route of routes) {
    try {
      const res = await testRoute(route);
      const ok = res.statusCode === 200;
      if (!ok) hasErrors = true;
      console.log(`${ok ? '✓' : '✗'} [${res.statusCode}] ${route.padEnd(45)} ${res.duration}ms (${Math.round(res.length / 1024)} KB)`);
    } catch (err) {
      hasErrors = true;
      console.error(`✗ Failed to load ${route}:`, err.message);
    }
  }

  if (hasErrors) {
    console.error('\nFAILED: Some routes returned non-200 or failed.');
    process.exit(1);
  } else {
    console.log('\nSUCCESS: All public routes loaded with 200 OK.');
  }
}

run();
