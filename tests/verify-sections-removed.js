const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000' + url, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

async function verify() {
  const home = await get('/');
  console.log('GET / ->', home.status);
  
  const hasDestSection = home.body.includes('selectedDestinations');
  const hasExpSection = home.body.includes('selectedExperiencesSection');
  const hasSignatureValleys = home.body.includes("Discover Kashmir's Signature Valleys");
  const hasSignatureExps = home.body.includes('Experience Kashmir Beyond the Journey');

  console.log('Homepage contains selectedDestinations: ' + hasDestSection);
  console.log('Homepage contains selectedExperiencesSection: ' + hasExpSection);
  console.log('Homepage contains Signature Valleys title: ' + hasSignatureValleys);
  console.log('Homepage contains Signature Experiences title: ' + hasSignatureExps);

  const dests = await get('/destinations');
  console.log('GET /destinations -> ' + dests.status + ' (length: ' + dests.body.length + ')');

  const srinagar = await get('/destinations/srinagar');
  console.log('GET /destinations/srinagar -> ' + srinagar.status + ' (length: ' + srinagar.body.length + ')');

  const exps = await get('/experiences');
  console.log('GET /experiences -> ' + exps.status + ' (length: ' + exps.body.length + ')');

  if (!hasDestSection && !hasExpSection && !hasSignatureValleys && !hasSignatureExps && dests.status === 200 && exps.status === 200) {
    console.log('\n🌟 ALL REMOVAL CHECKS PASSED PERFECTLY!');
    process.exit(0);
  } else {
    console.error('\n❌ FAILED REMOVAL CHECKS');
    process.exit(1);
  }
}

verify();
