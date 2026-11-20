const http = require('http');
const fs = require('fs');
const path = require('path');

// Set test port
process.env.PORT = 3055;
process.env.ADMIN_PASSWORD = 'admin123';
process.env.NOTIFICATION_EMAIL = 'owner@citylinetours.com';

const app = require('../server'); // Note: server starts listening on PORT 3055

const BASE_URL = 'http://localhost:3055';

function fetchUrl(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting City Line Tours Application Tests ---');
  let failures = 0;

  async function test(desc, fn) {
    try {
      await fn();
      console.log(`[PASS] ${desc}`);
    } catch (err) {
      failures++;
      console.error(`[FAIL] ${desc}: ${err.message}`);
    }
  }

  // 1. Test Public Routes
  const publicRoutes = [
    { path: '/', expected: 200 },
    { path: '/about', expected: 200 },
    { path: '/packages', expected: 200 },
    { path: '/packages/kashmir-honeymoon-special-package', expected: 200 },
    { path: '/packages/kashmir-honeymoon-special-package/print', expected: 200 },
    { path: '/destinations', expected: 200 },
    { path: '/destinations/srinagar', expected: 200 },
    { path: '/experiences', expected: 200 },
    { path: '/hotels', expected: 200 },
    { path: '/gallery', expected: 301 },
    { path: '/contact', expected: 200 },
    { path: '/faq', expected: 301 },
    { path: '/terms', expected: 200 },
    { path: '/admin/login', expected: 200 }
  ];

  for (const item of publicRoutes) {
    await test(`GET ${item.path}`, async () => {
      const res = await fetchUrl(item.path);
      if (res.status !== item.expected) {
        throw new Error(`Expected status ${item.expected} but received ${res.status}`);
      }
      if (item.expected === 200 && !res.body.includes('City Line')) {
        throw new Error(`Response body missing brand identifier 'City Line'`);
      }
      if (item.path === '/') {
        if (!res.body.includes('quickConsultWhatsAppBtn') || !res.body.includes('quickConsultEmailBtn')) {
          throw new Error(`Homepage missing Quick Consultation WhatsApp or Email buttons`);
        }
      }
      if (item.path === '/experiences') {
        if (!res.body.includes('/thevinci.jpeg')) {
          throw new Error(`Experiences page missing updated Pangong Lake image '/thevinci.jpeg'`);
        }
      }
    });
  }

  // Test static thevinci image assets
  await test('GET /thevinci.jpeg', async () => {
    const res = await fetchUrl('/thevinci.jpeg');
    if (res.status !== 200) throw new Error(`Expected 200 but got ${res.status}`);
    if (!res.headers['content-type'] || !res.headers['content-type'].includes('image')) {
      throw new Error(`Expected image content-type but got ${res.headers['content-type']}`);
    }
  });

  await test('GET /thevinci (extensionless alias)', async () => {
    const res = await fetchUrl('/thevinci');
    if (res.status !== 200) throw new Error(`Expected 200 but got ${res.status}`);
    if (!res.headers['content-type'] || !res.headers['content-type'].includes('image/jpeg')) {
      throw new Error(`Expected image/jpeg content-type but got ${res.headers['content-type']}`);
    }
  });

  // 2. Test Customer Enquiry Submission & Email Generation
  await test('POST /api/enquiries (Customer enquiry & mail notification dispatch)', async () => {
    const payload = JSON.stringify({
      name: 'Mohammad Farooq',
      phone: '+91 94191 23456',
      email: 'farooq.traveler@example.com',
      destination: 'Gulmarg & Pahalgam',
      packageTitle: 'Kashmir Classic Honeymoon - Romance in the Valley',
      travelDate: '2026-12-20',
      travellers: 'Couple (2 Adults)',
      duration: '6 Days / 5 Nights',
      budget: '₹25,000 - ₹35,000',
      message: 'Looking for a heated room in Gulmarg and candlelit dinner on Dal Lake houseboat.',
      source: 'Testing Suite'
    });

    const res = await fetchUrl('/api/enquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      body: payload
    });

    if (res.status !== 200) {
      throw new Error(`Expected 200 OK, got ${res.status}. Body: ${res.body}`);
    }

    const data = JSON.parse(res.body);
    if (!data.success || !data.enquiryId) {
      throw new Error(`Response does not indicate success or missing enquiryId: ${res.body}`);
    }

    // Verify enquiry in enquiries.json
    const enquiries = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'enquiries.json'), 'utf8'));
    const saved = enquiries.find(e => e.id === data.enquiryId);
    if (!saved) {
      throw new Error(`Enquiry ${data.enquiryId} was not saved to database`);
    }
    if (saved.name !== 'Mohammad Farooq') {
      throw new Error(`Enquiry name mismatch: got ${saved.name}`);
    }

    // Verify email outbox log
    const emailLogs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'email_logs.json'), 'utf8'));
    const adminLog = emailLogs.find(m => m.enquiryId === data.enquiryId && m.type === 'Admin Notification');
    const customerLog = emailLogs.find(m => m.enquiryId === data.enquiryId && m.type === 'Customer Confirmation');

    if (!adminLog) {
      throw new Error(`No Admin Notification email logged for enquiry ${data.enquiryId}`);
    }
    if (!customerLog) {
      throw new Error(`No Customer Confirmation email logged for enquiry ${data.enquiryId}`);
    }
    console.log(`       - Admin notification prepared for: ${adminLog.recipient}`);
    console.log(`       - Customer confirmation prepared for: ${customerLog.recipient}`);
  });

  // 3. Test Admin Protected Routes & CSV Export
  await test('Admin auth redirect when unauthenticated', async () => {
    const res = await fetchUrl('/admin');
    if (res.status !== 302 && res.status !== 301) {
      throw new Error(`Expected redirect (302/301), got ${res.status}`);
    }
  });

  await test('Admin Login & Session Access', async () => {
    // Perform login POST
    const loginPayload = 'password=admin123';
    const loginRes = await fetchUrl('/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(loginPayload)
      },
      body: loginPayload
    });

    const cookie = loginRes.headers['set-cookie'];
    if (!cookie) {
      throw new Error('No session cookie returned from admin login');
    }

    const sessionCookie = cookie[0].split(';')[0];

    // Access Dashboard with cookie
    const dashRes = await fetchUrl('/admin', {
      headers: { 'Cookie': sessionCookie }
    });
    if (dashRes.status !== 200 || !dashRes.body.includes('Operations Dashboard')) {
      throw new Error('Failed to load Admin Dashboard with session cookie');
    }

    // Access Enquiries
    const enqRes = await fetchUrl('/admin/enquiries', {
      headers: { 'Cookie': sessionCookie }
    });
    if (enqRes.status !== 200 || !enqRes.body.includes('Customer Tour Enquiries')) {
      throw new Error('Failed to load Admin Enquiries');
    }

    // Access CSV Export
    const csvRes = await fetchUrl('/admin/enquiries/export', {
      headers: { 'Cookie': sessionCookie }
    });
    if (csvRes.status !== 200 || !csvRes.body.includes('Mohammad Farooq')) {
      throw new Error('CSV Export missing customer data');
    }

    // Access Email Logs
    const mailRes = await fetchUrl('/admin/emails', {
      headers: { 'Cookie': sessionCookie }
    });
    if (mailRes.status !== 200 || !mailRes.body.includes('Email Notifications & Outbox')) {
      throw new Error('Failed to load Admin Email Logs');
    }

    // Cleanup test records
    const enquiriesFile = path.join(__dirname, '..', 'data', 'enquiries.json');
    const emailLogsFile = path.join(__dirname, '..', 'data', 'email_logs.json');
    if (fs.existsSync(enquiriesFile)) fs.writeFileSync(enquiriesFile, '[]', 'utf8');
    if (fs.existsSync(emailLogsFile)) fs.writeFileSync(emailLogsFile, '[]', 'utf8');
  });

  console.log(`--------------------------------------------------`);
  if (failures === 0) {
    console.log(`ALL TESTS PASSED! Application is completely robust.`);
    process.exit(0);
  } else {
    console.error(`${failures} test(s) failed.`);
    process.exit(1);
  }
}

// Allow server a split second to listen
setTimeout(runTests, 500);
