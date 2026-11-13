const http = require('http');
const exps = require('../data/experiences.json');

const v2Exps = exps.filter(e => e.image && e.image.startsWith('/EXPERIENCEV2/'));
console.log('Testing ' + v2Exps.length + ' EXPERIENCEV2 images on http://localhost:3000...');

let tested = 0;
let errors = 0;

v2Exps.forEach(e => {
  const encUrl = encodeURI(e.image);
  http.get('http://localhost:3000' + encUrl, res => {
    tested++;
    if (res.statusCode !== 200) {
      console.error('FAIL: ' + e.image + ' -> ' + res.statusCode);
      errors++;
    } else {
      console.log('OK (200): ' + e.id + ' -> ' + e.image + ' (' + res.headers['content-type'] + ', ' + res.headers['content-length'] + ' bytes)');
    }
    if (tested === v2Exps.length) {
      console.log('Done testing images. Errors: ' + errors);
      testPage();
    }
  }).on('error', err => {
    tested++;
    errors++;
    console.error('HTTP ERROR: ' + e.image + ' ' + err.message);
  });
});

function testPage() {
  http.get('http://localhost:3000/experiences', res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('/experiences HTTP status: ' + res.statusCode);
      let pageErrors = 0;
      v2Exps.forEach(e => {
        const found = body.includes(e.image);
        if (!found) {
          console.error('MISSING from HTML: ' + e.id + ' (' + e.image + ')');
          pageErrors++;
        } else {
          console.log('VERIFIED IN HTML: ' + e.id + ' (' + e.image + ')');
        }
      });
      
      const hasBadElevation = body.includes('( to )');
      console.log('Contains bad elevation "( to )": ' + hasBadElevation);
      const hasGoodElevation = body.includes('Gulmarg (2,650m to 4,390m)');
      console.log('Contains good elevation "Gulmarg (2,650m to 4,390m)": ' + hasGoodElevation);

      if (errors === 0 && pageErrors === 0 && !hasBadElevation && hasGoodElevation) {
        console.log('ALL CHECKS PASSED PERFECTLY!');
        process.exit(0);
      } else {
        console.error('SOME CHECKS FAILED');
        process.exit(1);
      }
    });
  });
}
