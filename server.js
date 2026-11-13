require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./config/database');
const mailer = require('./config/mailer');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static assets
app.use(express.static(path.join(__dirname, 'public'), { redirect: false }));

// Session middleware for admin protection
app.use(session({
  secret: process.env.SESSION_SECRET || 'city_line_kashmir_session_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Global locals for views
app.use((req, res, next) => {
  res.locals.settings = db.getSettings();
  res.locals.currentPath = req.path;
  res.locals.isAdmin = Boolean(req.session && req.session.isAdmin);
  next();
});

// Admin auth check middleware
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.redirect('/admin/login');
}

// ==========================================
// PUBLIC USER-FACING ROUTES
// ==========================================

// 1. Homepage
app.get('/', (req, res) => {
  const featuredPackages = db.getFeaturedPackages();
  const allPackages = db.getPublishedPackages();
  const destinations = db.getDestinations();
  const experiences = db.getExperiences();
  const faqs = db.getFaqs();
  const testimonials = db.getTestimonials().filter(t => t.approved);

  res.render('index', {
    pageTitle: 'Discover Kashmir | City Line Tours And Travels',
    featuredPackages,
    allPackages,
    destinations,
    experiences,
    faqs,
    testimonials
  });
});

// 2. About Us
app.get('/about', (req, res) => {
  res.render('about', {
    pageTitle: 'About Us | City Line Tours And Travels',
  });
});

// 3. Tour Packages Listing
app.get('/packages', (req, res) => {
  const category = req.query.category || 'all';
  let packages = db.getPublishedPackages();

  if (category && category !== 'all') {
    packages = packages.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  res.render('packages', {
    pageTitle: 'Kashmir Tour Packages | City Line Tours And Travels',
    packages,
    selectedCategory: category
  });
});

// 4. Tour Package Details
app.get('/packages/:slug', (req, res) => {
  const pkg = db.getPackageBySlug(req.params.slug);
  if (!pkg) {
    return res.status(404).render('404', { pageTitle: 'Package Not Found' });
  }

  const relatedPackages = db.getPublishedPackages()
    .filter(p => p.id !== pkg.id)
    .slice(0, 3);

  res.render('package-detail', {
    pageTitle: `${pkg.title} | City Line Tours`,
    pkg,
    relatedPackages
  });
});

// 4b. Printable Branded PDF Itinerary
app.get('/packages/:slug/print', (req, res) => {
  const pkg = db.getPackageBySlug(req.params.slug);
  if (!pkg) {
    return res.status(404).render('404', { pageTitle: 'Package Not Found' });
  }

  res.render('package-print', {
    pageTitle: `${pkg.title} - Official Itinerary | City Line Tours`,
    pkg
  });
});

// 5. Destinations Listing
app.get('/destinations', (req, res) => {
  const destinations = db.getDestinations();
  res.render('destinations', {
    pageTitle: 'Explore Kashmir Destinations | City Line Tours And Travels',
    destinations
  });
});

// 6. Destination Details
app.get('/destinations/:slug', (req, res) => {
  const destination = db.getDestinationBySlug(req.params.slug);
  if (!destination) {
    return res.status(404).render('404', { pageTitle: 'Destination Not Found' });
  }

  const relatedPackages = db.getPublishedPackages().filter(p => 
    p.destinationCoverage && p.destinationCoverage.some(d => d.toLowerCase().includes(destination.name.toLowerCase()))
  );

  res.render('destination-detail', {
    pageTitle: `${destination.name} - Kashmir Travel Guide | City Line Tours`,
    destination,
    relatedPackages: relatedPackages.length > 0 ? relatedPackages : db.getFeaturedPackages().slice(0, 3)
  });
});

// 7. Experiences
app.get('/experiences', (req, res) => {
  const experiences = db.getExperiences();
  res.render('experiences', {
    pageTitle: 'Kashmir Travel Experiences | City Line Tours And Travels',
    experiences
  });
});

// 8. Hotels & Accommodation
app.get('/hotels', (req, res) => {
  const hotels = db.getHotels();
  res.render('hotels', {
    pageTitle: 'Hotels, Resorts & Heritage Houseboats in Kashmir | City Line Tours',
    hotels
  });
});

// 10. Photo Gallery
app.get('/gallery', (req, res) => {
  res.render('gallery', {
    pageTitle: 'Kashmir Photo Gallery | City Line Tours And Travels'
  });
});

// 11. Contact Us
app.get('/contact', (req, res) => {
  res.render('contact', {
    pageTitle: 'Contact Us | City Line Tours And Travels'
  });
});

// 12. FAQs
app.get('/faq', (req, res) => {
  const faqs = db.getFaqs();
  res.render('faq', {
    pageTitle: 'Frequently Asked Questions | City Line Tours And Travels',
    faqs
  });
});

// 13. Terms & Privacy
app.get('/terms', (req, res) => {
  res.render('terms', {
    pageTitle: 'Terms, Conditions & Policies | City Line Tours'
  });
});

app.get('/privacy', (req, res) => {
  res.render('terms', {
    pageTitle: 'Privacy Policy & Terms | City Line Tours'
  });
});

// ==========================================
// ENQUIRY & EMAIL SUBMISSION APIS
// ==========================================

// Handle Enquiry submissions (from modals, quick bar, or custom planner)
app.post('/api/enquiries', async (req, res) => {
  try {
    const { name, phone, email, destination, packageTitle, travelDate, travellers, duration, budget, travelType, accommodation, message, source } = req.body;

    if (!name || !phone) {
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(400).json({ success: false, message: 'Please provide both your name and phone number.' });
      }
      return res.redirect('back');
    }

    // Save enquiry to database
    const newEnquiry = db.createEnquiry({
      name,
      phone,
      email,
      destination,
      packageTitle,
      travelDate,
      travellers,
      duration,
      budget,
      travelType,
      accommodation,
      message,
      source: source || 'Website Enquiry'
    });

    // Trigger Email Notification (Asynchronous / Non-blocking)
    mailer.sendEnquiryEmails(newEnquiry).catch(err => {
      console.error('Email dispatch error in background:', err);
    });

    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.json({
        success: true,
        message: 'Thank you! Your Kashmir travel enquiry has been received. Our team will contact you shortly and an email notification has been dispatched.',
        enquiryId: newEnquiry.id
      });
    }

    res.redirect(`/?enquiry_success=true&ref=${newEnquiry.id}`);
  } catch (error) {
    console.error('Error handling enquiry:', error);
    if (req.xhr || req.headers.accept?.includes('json')) {
      return res.status(500).json({ success: false, message: 'Internal server error while saving your enquiry.' });
    }
    res.redirect('back');
  }
});

// ==========================================
// ADMIN DASHBOARD ROUTES
// ==========================================

// Admin Login GET
app.get('/admin/login', (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.redirect('/admin');
  }
  res.render('admin/login', { pageTitle: 'Admin Login', error: null });
});

// Admin Login POST
app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  const adminSecret = process.env.ADMIN_PASSWORD || 'admin123';

  if (password === adminSecret) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }

  res.render('admin/login', { pageTitle: 'Admin Login', error: 'Invalid administrator password.' });
});

// Admin Logout
app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// Admin Dashboard Overview
app.get('/admin', requireAdmin, (req, res) => {
  const enquiries = db.getEnquiries();
  const packages = db.getPackages();
  const destinations = db.getDestinations();
  const emailLogs = db.getEmailLogs();

  const stats = {
    totalEnquiries: enquiries.length,
    newEnquiries: enquiries.filter(e => e.status === 'New').length,
    contactedEnquiries: enquiries.filter(e => e.status === 'Contacted').length,
    confirmedEnquiries: enquiries.filter(e => e.status === 'Confirmed').length,
    totalPackages: packages.length,
    publishedPackages: packages.filter(p => p.published !== false).length,
    totalDestinations: destinations.length,
    totalEmailsSent: emailLogs.length
  };

  const recentEnquiries = enquiries.slice(0, 8);

  res.render('admin/dashboard', {
    pageTitle: 'Dashboard Overview | City Line Admin',
    stats,
    recentEnquiries
  });
});

// Admin Enquiries Management
app.get('/admin/enquiries', requireAdmin, (req, res) => {
  const statusFilter = req.query.status || 'all';
  const search = req.query.search ? req.query.search.toLowerCase() : '';
  let enquiries = db.getEnquiries();

  if (statusFilter !== 'all') {
    enquiries = enquiries.filter(e => e.status.toLowerCase() === statusFilter.toLowerCase());
  }

  if (search) {
    enquiries = enquiries.filter(e => 
      (e.name && e.name.toLowerCase().includes(search)) ||
      (e.phone && e.phone.includes(search)) ||
      (e.email && e.email.toLowerCase().includes(search)) ||
      (e.id && e.id.toLowerCase().includes(search))
    );
  }

  res.render('admin/enquiries', {
    pageTitle: 'Customer Enquiries | City Line Admin',
    enquiries,
    statusFilter,
    search
  });
});

// Admin Enquiry Status Update & Add Note
app.post('/admin/enquiries/:id/status', requireAdmin, (req, res) => {
  const { status, noteText } = req.body;
  db.updateEnquiryStatus(req.params.id, status, noteText);
  res.redirect('back');
});

// Admin Enquiry Delete
app.post('/admin/enquiries/:id/delete', requireAdmin, (req, res) => {
  db.deleteEnquiry(req.params.id);
  res.redirect('/admin/enquiries');
});

// Admin Export Enquiries to CSV
app.get('/admin/enquiries/export', requireAdmin, (req, res) => {
  const enquiries = db.getEnquiries();
  
  const headers = ['ID', 'Date', 'Customer Name', 'Phone', 'Email', 'Source', 'Package/Destination', 'Travel Date', 'Travellers', 'Duration', 'Budget', 'Status', 'Message'];
  
  const csvRows = [headers.join(',')];

  enquiries.forEach(e => {
    const row = [
      `"${e.id || ''}"`,
      `"${new Date(e.createdAt).toLocaleDateString('en-IN')}"`,
      `"${(e.name || '').replace(/"/g, '""')}"`,
      `"${e.phone || ''}"`,
      `"${e.email || ''}"`,
      `"${e.source || ''}"`,
      `"${(e.packageTitle || e.destination || '').replace(/"/g, '""')}"`,
      `"${e.travelDate || ''}"`,
      `"${e.travellers || ''}"`,
      `"${e.duration || ''}"`,
      `"${e.budget || ''}"`,
      `"${e.status || ''}"`,
      `"${(e.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ];
    csvRows.push(row.join(','));
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="cityline_enquiries_${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csvRows.join('\r\n'));
});

// Admin Packages List
app.get('/admin/packages', requireAdmin, (req, res) => {
  const packages = db.getPackages();
  res.render('admin/packages', {
    pageTitle: 'Manage Tour Packages | City Line Admin',
    packages
  });
});

// Admin New Package Form
app.get('/admin/packages/new', requireAdmin, (req, res) => {
  res.render('admin/package-form', {
    pageTitle: 'Add New Tour Package | City Line Admin',
    pkg: null
  });
});

// Admin Save New Package
app.post('/admin/packages', requireAdmin, (req, res) => {
  const { title, category, duration, price, destinationCoverage, shortDescription, fullDescription, featuredImage, accommodation, transportation, featured, published } = req.body;
  
  const pkgData = {
    title,
    category,
    duration,
    price: price ? parseInt(price, 10) : null,
    startingPriceFormatted: price ? `₹${parseInt(price, 10).toLocaleString('en-IN')}` : 'On Request',
    destinationCoverage: destinationCoverage ? destinationCoverage.split(',').map(s => s.trim()) : [],
    shortDescription,
    fullDescription,
    featuredImage: featuredImage || 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1000&q=80',
    galleryImages: [featuredImage || 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80'],
    itinerary: [],
    inclusions: [
      "Accommodation as specified",
      "Daily Morning Breakfast & Dinner",
      "Private dedicated vehicle for sightseeing",
      "1-Hour Shikara ride on Dal Lake"
    ],
    exclusions: [
      "Flight tickets",
      "Personal activities and pony rides"
    ],
    accommodation: accommodation || '3-Star / 4-Star Deluxe Stays & Houseboat',
    transportation: transportation || 'Private dedicated vehicle',
    featured: featured === 'on' || featured === true,
    published: published !== 'off'
  };

  db.savePackage(pkgData);
  res.redirect('/admin/packages');
});

// Admin Edit Package Form
app.get('/admin/packages/:id/edit', requireAdmin, (req, res) => {
  const pkg = db.getPackageById(req.params.id);
  if (!pkg) return res.redirect('/admin/packages');
  res.render('admin/package-form', {
    pageTitle: `Edit Package: ${pkg.title}`,
    pkg
  });
});

// Admin Update Package
app.post('/admin/packages/:id', requireAdmin, (req, res) => {
  const current = db.getPackageById(req.params.id);
  if (!current) return res.redirect('/admin/packages');

  const { title, category, duration, price, destinationCoverage, shortDescription, fullDescription, featuredImage, accommodation, transportation, featured, published } = req.body;

  const updatedData = {
    ...current,
    title,
    category,
    duration,
    price: price ? parseInt(price, 10) : null,
    startingPriceFormatted: price ? `₹${parseInt(price, 10).toLocaleString('en-IN')}` : 'On Request',
    destinationCoverage: destinationCoverage ? destinationCoverage.split(',').map(s => s.trim()) : current.destinationCoverage,
    shortDescription,
    fullDescription,
    featuredImage: featuredImage || current.featuredImage,
    accommodation: accommodation || current.accommodation,
    transportation: transportation || current.transportation,
    featured: featured === 'on' || featured === true,
    published: published === 'on' || published === true
  };

  db.savePackage(updatedData);
  res.redirect('/admin/packages');
});

// Admin Delete Package
app.post('/admin/packages/:id/delete', requireAdmin, (req, res) => {
  db.deletePackage(req.params.id);
  res.redirect('/admin/packages');
});

// Admin Destinations List
app.get('/admin/destinations', requireAdmin, (req, res) => {
  const destinations = db.getDestinations();
  res.render('admin/destinations', {
    pageTitle: 'Manage Destinations | City Line Admin',
    destinations
  });
});

// Admin New Destination Form
app.get('/admin/destinations/new', requireAdmin, (req, res) => {
  res.render('admin/destination-form', {
    pageTitle: 'Add New Destination | City Line Admin',
    destination: null
  });
});

// Admin Save Destination
app.post('/admin/destinations', requireAdmin, (req, res) => {
  const { name, tagline, shortDescription, fullDescription, bestTimeToVisit, suggestedDuration, image, featured } = req.body;
  
  const destData = {
    name,
    tagline,
    shortDescription,
    fullDescription,
    bestTimeToVisit,
    suggestedDuration,
    image: image || 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
    gallery: [image || 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80'],
    attractions: [],
    thingsToDo: [],
    featured: featured === 'on' || featured === true
  };

  db.saveDestination(destData);
  res.redirect('/admin/destinations');
});

// Admin Edit Destination Form
app.get('/admin/destinations/:id/edit', requireAdmin, (req, res) => {
  const destination = db.getDestinationById(req.params.id);
  if (!destination) return res.redirect('/admin/destinations');
  res.render('admin/destination-form', {
    pageTitle: `Edit Destination: ${destination.name}`,
    destination
  });
});

// Admin Update Destination
app.post('/admin/destinations/:id', requireAdmin, (req, res) => {
  const current = db.getDestinationById(req.params.id);
  if (!current) return res.redirect('/admin/destinations');

  const { name, tagline, shortDescription, fullDescription, bestTimeToVisit, suggestedDuration, image, featured } = req.body;

  const updatedData = {
    ...current,
    name,
    tagline,
    shortDescription,
    fullDescription,
    bestTimeToVisit,
    suggestedDuration,
    image: image || current.image,
    featured: featured === 'on' || featured === true
  };

  db.saveDestination(updatedData);
  res.redirect('/admin/destinations');
});

// Admin Delete Destination
app.post('/admin/destinations/:id/delete', requireAdmin, (req, res) => {
  db.deleteDestination(req.params.id);
  res.redirect('/admin/destinations');
});

// Admin Email Notification Outbox & Logs
app.get('/admin/emails', requireAdmin, (req, res) => {
  const emailLogs = db.getEmailLogs();
  res.render('admin/emails', {
    pageTitle: 'Email Notifications Outbox | City Line Admin',
    emailLogs,
    testResult: req.query.testResult || null
  });
});

// Admin Send Test Email
app.post('/admin/emails/test', requireAdmin, async (req, res) => {
  const { targetEmail } = req.body;
  const result = await mailer.sendTestEmail(targetEmail || db.getSettings().notificationEmail);
  res.redirect(`/admin/emails?testResult=${encodeURIComponent(result.message)}`);
});

// Admin Settings GET
app.get('/admin/settings', requireAdmin, (req, res) => {
  const settings = db.getSettings();
  res.render('admin/settings', {
    pageTitle: 'Website & Notification Settings | City Line Admin',
    settings,
    saved: req.query.saved === 'true'
  });
});

// Admin Settings POST
app.post('/admin/settings', requireAdmin, (req, res) => {
  const {
    companyName,
    tagline,
    phone,
    whatsapp,
    email,
    notificationEmail,
    address,
    businessHours,
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
    smtpFromName,
    smtpFromEmail
  } = req.body;

  db.updateSettings({
    companyName,
    tagline,
    phone,
    whatsapp,
    whatsappDisplay: phone,
    email,
    notificationEmail,
    address,
    businessHours,
    smtp: {
      host: smtpHost ? smtpHost.trim() : '',
      port: smtpPort ? parseInt(smtpPort, 10) : 587,
      user: smtpUser ? smtpUser.trim() : '',
      pass: smtpPass ? smtpPass.trim() : '',
      fromName: smtpFromName || companyName,
      fromEmail: smtpFromEmail || email
    }
  });

  res.redirect('/admin/settings?saved=true');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found | City Line Tours' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌟 City Line Tours And Travels - Server Running`);
  console.log(`🌐 Website: http://localhost:${PORT}`);
  console.log(`🔒 Admin Dashboard: http://localhost:${PORT}/admin`);
  console.log(`📧 Customer Enquiries forward to: ${process.env.NOTIFICATION_EMAIL || db.getSettings().notificationEmail}`);
  console.log(`=======================================================`);
});

