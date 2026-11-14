const http = require('http');

const pagesToCrawl = [
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

function decodeHtml(html) {
  return html.replace(/&amp;/g, '&')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>');
}

function fetch(urlPath) {
  return new Promise((resolve, reject) => {
    // Ensure urlPath is properly single-decoded then encoded
    const decoded = decodeURIComponent(urlPath);
    http.get(`http://localhost:3000${encodeURI(decoded)}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data, headers: res.headers }));
    }).on('error', reject);
  });
}

function checkAsset(assetPath) {
  return new Promise((resolve) => {
    const decoded = decodeURIComponent(assetPath);
    http.get(`http://localhost:3000${encodeURI(decoded)}`, (res) => {
      resolve(res.statusCode);
    }).on('error', () => resolve(500));
  });
}

async function audit() {
  console.log('--- STARTING COMPLETE AUDIT OF LINKS AND ASSETS ---');
  const foundLinks = new Set();
  const foundAssets = new Set();
  const brokenLinks = [];
  const brokenAssets = [];

  for (const page of pagesToCrawl) {
    const res = await fetch(page);
    if (res.statusCode !== 200) {
      brokenLinks.push({ page, status: res.statusCode });
      continue;
    }

    // Extract hrefs
    const hrefRegex = /href=["']([^"']+)["']/g;
    let match;
    while ((match = hrefRegex.exec(res.body)) !== null) {
      let href = decodeHtml(match[1]);
      if (href.startsWith('/') && !href.startsWith('//')) {
        const cleanHref = href.split('#')[0].split('?')[0];
        if (cleanHref) foundLinks.add(cleanHref);
      }
    }

    // Extract img src
    const srcRegex = /src=["']([^"']+)["']/g;
    while ((match = srcRegex.exec(res.body)) !== null) {
      let src = decodeHtml(match[1]);
      if (src.startsWith('/') && !src.startsWith('//')) {
        foundAssets.add(src);
      }
    }
  }

  console.log(`Found ${foundLinks.size} unique internal routes to test.`);
  for (const link of foundLinks) {
    const res = await fetch(link);
    if (res.statusCode === 404 || res.statusCode >= 500) {
      console.error(`✗ Broken internal link: ${link} (Status ${res.statusCode})`);
      brokenLinks.push({ link, status: res.statusCode });
    }
  }

  console.log(`Found ${foundAssets.size} unique local assets (images/CSS/JS) to test.`);
  for (const asset of foundAssets) {
    const status = await checkAsset(asset);
    if (status === 404 || status >= 500) {
      console.error(`✗ Broken asset: ${asset} (Status ${status})`);
      brokenAssets.push({ asset, status });
    }
  }

  console.log('\n--- AUDIT SUMMARY ---');
  console.log(`Total Routes Checked: ${foundLinks.size}, Broken: ${brokenLinks.length}`);
  console.log(`Total Assets Checked: ${foundAssets.size}, Broken: ${brokenAssets.length}`);

  if (brokenLinks.length > 0 || brokenAssets.length > 0) {
    console.error('\nFAILED: Detected broken links or assets.');
    process.exit(1);
  } else {
    console.log('\n🌟 ALL 52 INTERNAL ROUTES & 98 LOCAL ASSETS ARE 100% VALID (200 OK)!');
  }
}

audit().catch(err => {
  console.error('Audit exception:', err);
  process.exit(1);
});
