const fs = require('fs');
const path = require('path');
const http = require('http');

const hotels = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'hotels.json'), 'utf8'));

console.log('--- TESTING 19 HOTELS AND ASSETS ---');
console.log(`Loaded ${hotels.length} hotels from data/hotels.json\n`);

let missingFiles = 0;
let localImagesCount = 0;

hotels.forEach((h, index) => {
  if (h.image.startsWith('/HOTELS/')) {
    localImagesCount++;
    const filename = h.image.replace('/HOTELS/', '');
    const diskPath = path.join(__dirname, '..', 'public', 'HOTELS', filename);
    if (!fs.existsSync(diskPath)) {
      console.error(`[FAIL] Disk file missing for #${index + 1} ${h.name}: ${diskPath}`);
      missingFiles++;
    } else {
      const stats = fs.statSync(diskPath);
      console.log(`[PASS] #${index + 1} ${h.name} -> ${h.image} (${Math.round(stats.size / 1024)} KB)`);
    }
  } else {
    console.log(`[INFO] #${index + 1} ${h.name} -> external fallback: ${h.image.substring(0, 50)}...`);
  }
});

console.log(`\nSummary: ${localImagesCount} local /HOTELS/ images verified, ${hotels.length - localImagesCount} fallback image(s). Missing disk files: ${missingFiles}`);

if (missingFiles > 0) {
  console.error('\nTest failed due to missing files on disk!');
  process.exit(1);
}

// Test fetching each local image over HTTP from the local running server
function testHttpImage(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${encodeURI(urlPath)}`, (res) => {
      if (res.statusCode === 200) {
        resolve({ path: urlPath, status: res.statusCode, type: res.headers['content-type'], size: res.headers['content-length'] });
      } else {
        reject(new Error(`Failed ${urlPath} with status ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function runHttpTests() {
  console.log('\n--- VERIFYING HTTP 200 FOR ALL LOCAL /HOTELS/ ASSETS ---');
  const localHotels = hotels.filter(h => h.image.startsWith('/HOTELS/'));
  for (const h of localHotels) {
    try {
      const res = await testHttpImage(h.image);
      console.log(`[HTTP 200] ${h.name}: ${res.type} (${res.size} bytes)`);
    } catch (err) {
      console.error(`[HTTP ERR] ${h.name}: ${err.message}`);
      process.exit(1);
    }
  }
  console.log('\n🌟 ALL LOCAL HOTEL IMAGES RETRIEVED SUCCESSFULLY WITH HTTP 200!');
}

runHttpTests();
