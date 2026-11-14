const http = require('http');
const fs = require('fs');
const path = require('path');

function checkServer() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const checks = [
          { name: 'Footer container id="ztmCredit"', pass: data.includes('id="ztmCredit"') },
          { name: 'Prefix text "Crafted & Developed by"', pass: data.includes('Crafted &amp; Developed by') },
          { name: 'Class "ztm-wordmark"', pass: data.includes('ztm-wordmark') },
          { name: 'Golden underline "ztm-underline"', pass: data.includes('ztm-underline') },
          { name: 'Letter Z index --l-idx: 0', pass: data.includes('style="--l-idx: 0;"') },
          { name: 'Letter T index --l-idx: 1', pass: data.includes('style="--l-idx: 1;"') },
          { name: 'Letter M index --l-idx: 2', pass: data.includes('style="--l-idx: 2;"') }
        ];

        console.log('--- HTML Render Checks ---');
        let allHtmlPassed = true;
        checks.forEach(c => {
          console.log(`${c.pass ? '✓' : '✗'} ${c.name}`);
          if (!c.pass) allHtmlPassed = false;
        });

        resolve(allHtmlPassed);
      });
    }).on('error', reject);
  });
}

function checkCss() {
  const cssPath = path.join(__dirname, '../public/css/style.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  const cssChecks = [
    { name: 'ztm-credit class definition', pass: css.includes('.ztm-credit {') },
    { name: 'ztm-ready state', pass: css.includes('.ztm-credit.ztm-ready') },
    { name: 'ztm-animate state', pass: css.includes('.ztm-credit.ztm-animate') },
    { name: 'ztm-settled state', pass: css.includes('.ztm-credit.ztm-settled') },
    { name: 'ztmLetterReveal keyframe', pass: css.includes('@keyframes ztmLetterReveal') },
    { name: 'ztmDrawUnderline keyframe', pass: css.includes('@keyframes ztmDrawUnderline') },
    { name: 'ztmPrefixFadeIn keyframe', pass: css.includes('@keyframes ztmPrefixFadeIn') },
    { name: 'ztmLightSweep keyframe', pass: css.includes('@keyframes ztmLightSweep') },
    { name: 'desktop hover interaction with hover query', pass: css.includes('@media (hover: hover)') },
    { name: 'prefers-reduced-motion accessibility', pass: css.includes('@media (prefers-reduced-motion: reduce)') }
  ];

  console.log('\n--- CSS Rules & Keyframes Checks ---');
  let allCssPassed = true;
  cssChecks.forEach(c => {
    console.log(`${c.pass ? '✓' : '✗'} ${c.name}`);
    if (!c.pass) allCssPassed = false;
  });

  return allCssPassed;
}

function checkJs() {
  const jsPath = path.join(__dirname, '../public/js/main.js');
  const js = fs.readFileSync(jsPath, 'utf8');

  const jsChecks = [
    { name: 'ztmCredit element lookup', pass: js.includes("document.getElementById('ztmCredit')") },
    { name: 'IntersectionObserver usage', pass: js.includes('new IntersectionObserver') },
    { name: 'unobserve to prevent repeat animations', pass: js.includes('observer.unobserve(entry.target)') },
    { name: 'transition to settled state', pass: js.includes("ztmCredit.classList.add('ztm-settled')") },
    { name: 'reduced-motion check', pass: js.includes('prefers-reduced-motion: reduce') }
  ];

  console.log('\n--- JavaScript Logic Checks ---');
  let allJsPassed = true;
  jsChecks.forEach(c => {
    console.log(`${c.pass ? '✓' : '✗'} ${c.name}`);
    if (!c.pass) allJsPassed = false;
  });

  return allJsPassed;
}

async function run() {
  try {
    const htmlOk = await checkServer();
    const cssOk = checkCss();
    const jsOk = checkJs();

    if (htmlOk && cssOk && jsOk) {
      console.log('\n🌟 ALL ZTM MICRO-ANIMATION VERIFICATIONS PASSED!\n');
      process.exit(0);
    } else {
      console.error('\n❌ Some verifications failed.\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error during test execution:', err);
    process.exit(1);
  }
}

run();
