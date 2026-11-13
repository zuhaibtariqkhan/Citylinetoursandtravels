const http = require('http');

const pages = [
  '/',
  '/about',
  '/packages',
  '/packages/kashmir-classic-honeymoon-6d5n',
  '/destinations',
  '/destinations/srinagar',
  '/experiences',
  '/hotels',
  '/gallery',
  '/contact',
  '/faq',
  '/terms'
];

function fetchUrl(url) {
  return new Promise((resolve) => {
    http.get('http://localhost:3000' + url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', err => resolve({ status: 500, error: err.message }));
  });
}

async function audit() {
  const assets = new Set();
  for (const page of pages) {
    const res = await fetchUrl(page);
    const regex = /(?:src|href)=["']([^"']+)["']/g;
    let match;
    while ((match = regex.exec(res.body)) !== null) {
      let src = match[1];
      if (src.startsWith('/') && !src.startsWith('//')) {
        const isRoute = ['/packages', '/destinations', '/experiences', '/hotels', '/gallery', '/contact', '/about', '/faq', '/terms', '/admin'].some(rt => src === rt || src.startsWith(rt + '/') || src.startsWith(rt + '?') || src.startsWith(rt + '#'));
        if (!isRoute && !src.includes('#')) {
          src = src.replace(/&amp;/g, '&');
          assets.add(src);
        }
      }
    }
  }

  console.log('Auditing ' + assets.size + ' local asset URLs across all pages...');
  let failed = 0;
  for (const asset of assets) {
    const finalUrl = encodeURI(decodeURI(asset));
    const r = await fetchUrl(finalUrl);
    if (r.status !== 200) {
      console.error('BROKEN ASSET (' + r.status + '): ' + asset + ' -> ' + finalUrl);
      failed++;
    }
  }
  console.log('Audit complete! Broken assets count: ' + failed);
}

audit();
