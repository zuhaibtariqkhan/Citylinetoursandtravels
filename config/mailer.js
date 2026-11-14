const nodemailer = require('nodemailer');
const db = require('./database');

// Create reusable transporter based on settings or env
function getTransporter() {
  const settings = db.getSettings();
  const smtp = settings.smtp || {};

  const host = process.env.SMTP_HOST || smtp.host;
  const port = parseInt(process.env.SMTP_PORT || smtp.port || 587, 10);
  const secure = (process.env.SMTP_SECURE === 'true') || smtp.secure || port === 465;
  const user = process.env.SMTP_USER || smtp.user;
  const pass = process.env.SMTP_PASS || smtp.pass;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // If no SMTP configured, return null to trigger simulator/logger
  return null;
}

// Generate Admin Notification HTML
function generateAdminEmailHtml(enquiry, settings) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #172b4d; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
      .header { background: #0B2545; color: #ffffff; padding: 28px 30px; text-align: left; }
      .header h1 { margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
      .header p { margin: 6px 0 0 0; color: #93c5fd; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
      .badge { display: inline-block; background: #145DA0; color: #ffffff; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; margin-top: 10px; }
      .content { padding: 30px; }
      .section-title { font-size: 14px; font-weight: 700; color: #145DA0; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; border-bottom: 2px solid #eff6ff; padding-bottom: 6px; }
      .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      .info-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
      .info-table td.label { width: 35%; color: #64748b; font-weight: 600; }
      .info-table td.value { width: 65%; color: #0b2545; font-weight: 500; }
      .message-box { background: #eff6ff; border-left: 4px solid #145DA0; padding: 14px 16px; border-radius: 4px; font-size: 14px; line-height: 1.5; color: #1e3a8a; margin-bottom: 24px; }
      .action-btns { text-align: center; margin: 25px 0 10px; }
      .btn { display: inline-block; background: #145DA0; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 4px 6px; }
      .btn-outline { background: #f8fafc; color: #0b2545 !important; border: 1px solid #cbd5e1; }
      .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>New Customer Tour Enquiry</h1>
        <p>${settings.companyName || 'City Line Tours And Travels'}</p>
        <span class="badge">Enquiry ID: ${enquiry.id}</span>
      </div>
      <div class="content">
        <div class="section-title">Customer Information</div>
        <table class="info-table">
          <tr>
            <td class="label">Full Name</td>
            <td class="value"><strong>${enquiry.name || 'Not provided'}</strong></td>
          </tr>
          <tr>
            <td class="label">Phone / Mobile</td>
            <td class="value"><a href="tel:${enquiry.phone}" style="color: #145da0; font-weight: 600;">${enquiry.phone || 'Not provided'}</a></td>
          </tr>
          <tr>
            <td class="label">Email Address</td>
            <td class="value">${enquiry.email ? `<a href="mailto:${enquiry.email}" style="color: #145da0;">${enquiry.email}</a>` : '<span style="color:#94a3b8;">None provided</span>'}</td>
          </tr>
          <tr>
            <td class="label">Enquiry Source</td>
            <td class="value">${enquiry.source || 'Website'}</td>
          </tr>
        </table>

        <div class="section-title">Trip & Requirement Details</div>
        <table class="info-table">
          ${enquiry.packageTitle ? `<tr><td class="label">Interested Package</td><td class="value"><strong style="color:#145da0;">${enquiry.packageTitle}</strong></td></tr>` : ''}
          ${enquiry.destination ? `<tr><td class="label">Destination</td><td class="value">${enquiry.destination}</td></tr>` : ''}
          <tr>
            <td class="label">Travel Date</td>
            <td class="value">${enquiry.travelDate || 'Flexible / Not specified'}</td>
          </tr>
          <tr>
            <td class="label">Number of Travellers</td>
            <td class="value">${enquiry.travellers || '1 Person'}</td>
          </tr>
          ${enquiry.duration ? `<tr><td class="label">Duration</td><td class="value">${enquiry.duration}</td></tr>` : ''}
          ${enquiry.travelType ? `<tr><td class="label">Travel Type</td><td class="value">${enquiry.travelType}</td></tr>` : ''}
          ${enquiry.accommodation ? `<tr><td class="label">Accommodation</td><td class="value">${enquiry.accommodation}</td></tr>` : ''}
          ${enquiry.budget ? `<tr><td class="label">Approximate Budget</td><td class="value">${enquiry.budget}</td></tr>` : ''}
        </table>

        ${enquiry.message ? `
          <div class="section-title">Customer Message & Special Requests</div>
          <div class="message-box">${enquiry.message.replace(/\n/g, '<br>')}</div>
        ` : ''}

        <div class="action-btns">
          <a href="tel:${enquiry.phone}" class="btn">Call Customer</a>
          ${enquiry.email ? `<a href="mailto:${enquiry.email}?subject=City%20Line%20Tours%20-%20Kashmir%20Travel%20Proposal" class="btn btn-outline">Reply via Email</a>` : ''}
          <a href="https://wa.me/${(enquiry.phone || '').replace(/[^0-9]/g, '')}" class="btn btn-outline" style="background:#25d366;color:#ffffff !important;border-color:#25d366;">WhatsApp</a>
        </div>
      </div>
      <div class="footer">
        Received on: ${new Date(enquiry.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST<br>
        City Line Tours And Travels • Palpora, Srinagar, Jammu & Kashmir, India
      </div>
    </div>
  </body>
  </html>
  `;
}

// Generate Customer Confirmation HTML
function generateCustomerEmailHtml(enquiry, settings) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Georgia', serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #172b4d; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .hero { background: linear-gradient(135deg, #0B2545 0%, #145DA0 100%); color: #ffffff; padding: 40px 30px; text-align: center; }
      .hero h1 { margin: 0; font-family: 'Georgia', serif; font-size: 26px; font-weight: normal; color: #ffffff; }
      .hero p { margin: 8px 0 0 0; color: #bfdbfe; font-size: 14px; letter-spacing: 0.5px; }
      .body-content { padding: 32px 30px; font-size: 15px; line-height: 1.6; color: #334155; }
      .highlight-card { background: #eff6ff; border-radius: 8px; padding: 18px 20px; margin: 22px 0; border: 1px solid #bfdbfe; }
      .highlight-card h4 { margin: 0 0 10px 0; color: #145DA0; font-size: 15px; }
      .highlight-card ul { margin: 0; padding-left: 20px; font-size: 14px; }
      .highlight-card li { margin-bottom: 6px; }
      .btn-wa { display: inline-block; background: #25D366; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 15px; }
      .footer { background: #0B2545; color: #94a3b8; padding: 24px 30px; text-align: center; font-size: 12px; line-height: 1.5; }
      .footer a { color: #60a5fa; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="hero">
        <h1>Where Your Travel Dreams Take Flight</h1>
        <p>City Line Tours And Travels • Kashmir</p>
      </div>
      <div class="body-content">
        <p style="font-size: 16px;">Dear <strong>${enquiry.name || 'Valued Traveller'}</strong>,</p>
        <p>Thank you for reaching out to <strong>City Line Tours And Travels</strong>! We have successfully received your travel enquiry (Reference: <strong>#${enquiry.id}</strong>).</p>
        <p>Kashmir is a land of timeless poetry, snowy summits, and warm hospitality. Our local travel specialists are currently reviewing your request and will craft a tailored quotation and day-wise itinerary for your trip.</p>
        
        <div class="highlight-card">
          <h4>Your Enquiry Summary:</h4>
          <ul>
            ${enquiry.packageTitle ? `<li><strong>Package:</strong> ${enquiry.packageTitle}</li>` : ''}
            ${enquiry.destination ? `<li><strong>Destination:</strong> ${enquiry.destination}</li>` : ''}
            ${enquiry.travelDate ? `<li><strong>Travel Date:</strong> ${enquiry.travelDate}</li>` : ''}
            ${enquiry.travellers ? `<li><strong>Travellers:</strong> ${enquiry.travellers}</li>` : ''}
            ${enquiry.duration ? `<li><strong>Duration:</strong> ${enquiry.duration}</li>` : ''}
          </ul>
        </div>

        <p>We typically respond promptly during business hours (Monday – Saturday: 10:00 AM – 5:00 PM). If you need immediate assistance or wish to discuss requirements directly, feel free to contact us anytime:</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://wa.me/${(settings.whatsapp || '916006725007').replace(/[^0-9]/g, '')}?text=Hello%20City%20Line%20Tours,%20I%20submitted%20enquiry%20${enquiry.id}" class="btn-wa">Chat with us on WhatsApp (6006725007)</a>
          <p style="margin-top: 10px; font-size: 13px; color: #64748b;">Or call us at <strong>${settings.phone || '6006725007'} / ${settings.secondaryPhone || '9906676890'}</strong></p>
        </div>

        <p style="margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 14px; color: #64748b;">
          Warm regards,<br>
          <strong>City Line Tours And Travels Team</strong><br>
          Palpora, Srinagar, Kashmir
        </p>
      </div>
      <div class="footer">
        City Line Tours And Travels • Palpora, Srinagar, Jammu & Kashmir, India<br>
        Phone: ${settings.phone || '6006725007'} / ${settings.secondaryPhone || '9906676890'} | Email: ${settings.email || 'askcitylinetravels@gmail.com'}<br>
        <a href="https://www.citylinetravels.com">Visit Website</a>
      </div>
    </div>
  </body>
  </html>
  `;
}

module.exports = {
  // Main dispatch function when a new enquiry is submitted
  async sendEnquiryEmails(enquiry) {
    const settings = db.getSettings();
    const adminRecipient = process.env.NOTIFICATION_EMAIL || settings.notificationEmail || settings.email || 'info@citylinetours.com';
    const transporter = getTransporter();

    const results = {
      adminEmailSent: false,
      customerEmailSent: false,
      adminStatus: 'pending',
      customerStatus: 'pending'
    };

    // 1. Send Notification to Business Owner
    const adminHtml = generateAdminEmailHtml(enquiry, settings);
    const adminSubject = `🔔 New Kashmir Tour Enquiry [${enquiry.id}] from ${enquiry.name || 'Guest'}`;
    const fromAddress = process.env.SMTP_FROM || `"${settings.companyName || 'City Line Tours'}" <${settings.smtp?.fromEmail || 'no-reply@citylinetours.com'}>`;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: fromAddress,
          to: adminRecipient,
          subject: adminSubject,
          html: adminHtml
        });
        results.adminEmailSent = true;
        results.adminStatus = 'delivered';
      } catch (err) {
        console.error('Failed to send admin notification email via SMTP:', err.message);
        results.adminStatus = 'smtp_error: ' + err.message;
      }
    } else {
      // SMTP not yet configured - log simulated delivery
      results.adminEmailSent = true;
      results.adminStatus = 'simulated (SMTP credentials pending in settings)';
    }

    db.logEmail({
      type: 'Admin Notification',
      enquiryId: enquiry.id,
      recipient: adminRecipient,
      subject: adminSubject,
      status: results.adminStatus,
      htmlPreview: adminHtml
    });

    // 2. Send Confirmation to Customer if email was provided
    if (enquiry.email && enquiry.email.includes('@')) {
      const customerHtml = generateCustomerEmailHtml(enquiry, settings);
      const customerSubject = `Thank you for contacting City Line Tours And Travels [Ref: #${enquiry.id}]`;

      if (transporter) {
        try {
          await transporter.sendMail({
            from: fromAddress,
            to: enquiry.email,
            subject: customerSubject,
            html: customerHtml
          });
          results.customerEmailSent = true;
          results.customerStatus = 'delivered';
        } catch (err) {
          console.error('Failed to send customer confirmation email via SMTP:', err.message);
          results.customerStatus = 'smtp_error: ' + err.message;
        }
      } else {
        results.customerEmailSent = true;
        results.customerStatus = 'simulated (SMTP credentials pending in settings)';
      }

      db.logEmail({
        type: 'Customer Confirmation',
        enquiryId: enquiry.id,
        recipient: enquiry.email,
        subject: customerSubject,
        status: results.customerStatus,
        htmlPreview: customerHtml
      });
    } else {
      results.customerStatus = 'skipped (no customer email provided)';
    }

    return results;
  },

  // Test email utility for Admin Dashboard
  async sendTestEmail(targetEmail) {
    const settings = db.getSettings();
    const transporter = getTransporter();

    const subject = `Test Email from City Line Tours And Travels - SMTP Verification`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 25px; background: #eff6ff; color: #0b2545;">
        <h2 style="color: #145da0;">City Line Tours And Travels</h2>
        <p><strong>Congratulations!</strong> Your email system is working correctly.</p>
        <p>This test verifies that enquiry notifications will successfully reach your inbox.</p>
        <p>Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
      </div>
    `;

    if (!transporter) {
      db.logEmail({
        type: 'Test Email',
        recipient: targetEmail,
        subject,
        status: 'simulated (Configure SMTP in Settings for live inbox delivery)',
        htmlPreview: html
      });
      return { success: false, message: 'SMTP credentials are not configured yet. Configure SMTP Host, User & Password in Admin Settings.' };
    }

    try {
      const fromAddress = process.env.SMTP_FROM || `"${settings.companyName || 'City Line Tours'}" <${settings.smtp?.fromEmail || 'no-reply@citylinetours.com'}>`;
      await transporter.sendMail({
        from: fromAddress,
        to: targetEmail,
        subject,
        html
      });

      db.logEmail({
        type: 'Test Email',
        recipient: targetEmail,
        subject,
        status: 'delivered',
        htmlPreview: html
      });

      return { success: true, message: `Test email successfully sent to ${targetEmail}!` };
    } catch (err) {
      db.logEmail({
        type: 'Test Email',
        recipient: targetEmail,
        subject,
        status: 'error: ' + err.message,
        htmlPreview: html
      });
      return { success: false, message: 'SMTP error: ' + err.message };
    }
  }
};

