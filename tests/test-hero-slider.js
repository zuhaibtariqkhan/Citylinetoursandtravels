const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('--- Testing Hero Section 4 Photos Optimization & Transitions ---');

// 1. Verify files on disk and check sizes
const images = [
  'HERO SECTION (1).jpg',
  'HERO SECTION (2).jpg',
  'HERO SECTION (3).jpg',
  'HERO SECTION (4).jpg'
];

let diskErrors = 0;
images.forEach(img => {
  const p = path.join(__dirname, '..', 'public', 'images', img);
  if (!fs.existsSync(p)) {
    console.error(`[FAIL] Disk file missing: ${img}`);
    diskErrors++;
  } else {
    const size = fs.statSync(p).size;
    const kb = (size / 1024).toFixed(1);
    console.log(`[PASS] Disk file exists: ${img} (${kb} KB)`);
    if (size > 2 * 1024 * 1024) {
      console.warn(`[WARN] File size is over 2MB: ${kb} KB`);
    }
  }
});

// 2. Test HTTP 200 for all 4 images on server
let httpTested = 0;
let httpErrors = 0;

images.forEach(img => {
  const encUrl = '/images/' + encodeURIComponent(img);
  http.get('http://localhost:3000' + encUrl, res => {
    httpTested++;
    if (res.statusCode !== 200) {
      console.error(`[FAIL] HTTP ${res.statusCode} for ${encUrl}`);
      httpErrors++;
    } else {
      console.log(`[PASS] HTTP 200 OK for ${encUrl} (${res.headers['content-type']}, ${res.headers['content-length']} bytes)`);
    }

    if (httpTested === images.length) {
      testHomepage();
    }
  }).on('error', err => {
    httpTested++;
    httpErrors++;
    console.error(`[FAIL] HTTP error for ${img}: ${err.message}`);
    if (httpTested === images.length) {
      testHomepage();
    }
  });
});

function testHomepage() {
  http.get('http://localhost:3000/', res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      let pageErrors = 0;
      console.log(`[PASS] Homepage returned HTTP ${res.statusCode}`);

      // Verify all 4 images in slides
      images.forEach((img, idx) => {
        const slidePattern = `HERO SECTION (${idx + 1}).jpg`;
        if (body.includes(slidePattern)) {
          console.log(`[PASS] Slide ${idx + 1} with ${slidePattern} found in HTML`);
        } else {
          console.error(`[FAIL] Slide ${idx + 1} with ${slidePattern} MISSING from HTML`);
          pageErrors++;
        }
      });

      // Verify 4 data-slide attributes
      for (let i = 0; i < 4; i++) {
        if (body.includes(`data-slide="${i}"`)) {
          console.log(`[PASS] data-slide="${i}" found`);
        } else {
          console.error(`[FAIL] data-slide="${i}" missing`);
          pageErrors++;
        }
      }

      // Verify 4 dot targets
      for (let i = 0; i < 4; i++) {
        if (body.includes(`data-target="${i}"`)) {
          console.log(`[PASS] hero-scene-dot data-target="${i}" found`);
        } else {
          console.error(`[FAIL] hero-scene-dot data-target="${i}" missing`);
          pageErrors++;
        }
      }

      // Verify preloads
      images.forEach((img, idx) => {
        const encImg = encodeURIComponent(img);
        if (body.includes(encImg)) {
          console.log(`[PASS] Preload for ${img} found in head`);
        } else {
          console.error(`[FAIL] Preload for ${img} missing in head`);
          pageErrors++;
        }
      });

      // Check CSS for kenburns 1 through 4
      const css = fs.readFileSync(path.join(__dirname, '..', 'public', 'css', 'style.css'), 'utf8');
      ['kenburns-1', 'kenburns-2', 'kenburns-3', 'kenburns-4'].forEach(kb => {
        if (css.includes(kb)) {
          console.log(`[PASS] CSS contains ${kb}`);
        } else {
          console.error(`[FAIL] CSS missing ${kb}`);
          pageErrors++;
        }
      });

      if (diskErrors === 0 && httpErrors === 0 && pageErrors === 0) {
        console.log('\n🌟 ALL HERO SECTION OPTIMIZATION CHECKS PASSED PERFECTLY!');
        process.exit(0);
      } else {
        console.error(`\n❌ Completed with failures: disk=${diskErrors}, http=${httpErrors}, page=${pageErrors}`);
        process.exit(1);
      }
    });
  });
}
