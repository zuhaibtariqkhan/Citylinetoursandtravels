const fs = require('fs');
const http = require('http');

console.log('--- Verifying Email Redirection for Enquire Buttons ---');

// 1. Check main.js
const mainJs = fs.readFileSync('public/js/main.js', 'utf8');
const hasRedirectFn = mainJs.includes('window.redirectToEmailEnquiry = function');
const targetsEmail = mainJs.includes('askcitylinetravels@gmail.com');
const bindsEnquireBtns = mainJs.includes("document.querySelectorAll('.enquire-now-btn')");
console.log('✓ main.js defines redirectToEmailEnquiry:', hasRedirectFn);
console.log('✓ main.js targets askcitylinetravels@gmail.com:', targetsEmail);
console.log('✓ main.js binds .enquire-now-btn:', bindsEnquireBtns);

if (!hasRedirectFn || !targetsEmail || !bindsEnquireBtns) {
  console.error('FAILED: main.js is missing email enquiry redirect logic');
  process.exit(1);
}

// 2. Check packages.ejs
const packagesEjs = fs.readFileSync('views/packages.ejs', 'utf8');
const hasCalcEmailRedirect = packagesEjs.includes('mailto:askcitylinetravels@gmail.com');
console.log('✓ packages.ejs calculator redirects to mailto:askcitylinetravels@gmail.com:', hasCalcEmailRedirect);
if (!hasCalcEmailRedirect) {
  console.error('FAILED: packages.ejs missing calculator email redirect');
  process.exit(1);
}

// 3. Check package-detail.ejs
const packageDetailEjs = fs.readFileSync('views/package-detail.ejs', 'utf8');
const hasDetailCalcEmailRedirect = packageDetailEjs.includes('mailto:askcitylinetravels@gmail.com');
console.log('✓ package-detail.ejs calculator redirects to mailto:askcitylinetravels@gmail.com:', hasDetailCalcEmailRedirect);
if (!hasDetailCalcEmailRedirect) {
  console.error('FAILED: package-detail.ejs missing calculator email redirect');
  process.exit(1);
}

// 4. Check contact.ejs
const contactEjs = fs.readFileSync('views/contact.ejs', 'utf8');
const hasContactEmailRedirect = contactEjs.includes('mailto:askcitylinetravels@gmail.com');
const formRemoved = !contactEjs.includes('contactForm') && !contactEjs.includes('SEND AN ENQUIRY');
console.log('✓ contact.ejs redirects to mailto:askcitylinetravels@gmail.com:', hasContactEmailRedirect);
console.log('✓ contact.ejs enquiry form section is removed:', formRemoved);
if (!hasContactEmailRedirect || !formRemoved) {
  console.error('FAILED: contact.ejs missing email redirect or still contains enquiry form');
  process.exit(1);
}

// 5. Check server response
http.get('http://localhost:3000/contact', res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('✓ Contact page responds with HTTP', res.statusCode);
    const hasEmail = body.includes('mailto:askcitylinetravels@gmail.com');
    const formIsGone = !body.includes('id="contactForm"') && !body.includes('SEND AN ENQUIRY');
    if (res.statusCode !== 200 || !hasEmail || !formIsGone) {
      console.error('FAILED: Contact page response invalid (email missing or form still present)');
      process.exit(1);
    }
    console.log('\n🌟 ALL ENQUIRE EMAIL REDIRECTION TESTS PASSED!\n');
    process.exit(0);
  });
}).on('error', err => {
  console.error('Server request error:', err);
  process.exit(1);
});
