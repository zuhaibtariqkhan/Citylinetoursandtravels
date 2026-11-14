const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, '..', 'data');

function readJsonFile(filename, defaultValue = []) {
  const filePath = path.join(dataDir, filename);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultValue;
  }
}

function writeJsonFile(filename, data) {
  const filePath = path.join(dataDir, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
    return false;
  }
}

module.exports = {
  // Settings
  getSettings() {
    return readJsonFile('settings.json', {});
  },
  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    writeJsonFile('settings.json', updated);
    return updated;
  },

  // Packages
  getPackages() {
    return readJsonFile('packages.json', []);
  },
  getPublishedPackages() {
    return this.getPackages().filter(p => p.published !== false);
  },
  getFeaturedPackages() {
    return this.getPublishedPackages().filter(p => p.featured === true);
  },
  getPackageBySlug(slug) {
    return this.getPackages().find(p => p.slug === slug || (p.aliases && p.aliases.includes(slug)));
  },
  getPackageById(id) {
    return this.getPackages().find(p => p.id === id || (p.aliases && p.aliases.includes(id)));
  },
  savePackage(pkgData) {
    const packages = this.getPackages();
    if (pkgData.id) {
      const idx = packages.findIndex(p => p.id === pkgData.id);
      if (idx !== -1) {
        packages[idx] = { ...packages[idx], ...pkgData };
        writeJsonFile('packages.json', packages);
        return packages[idx];
      }
    }
    const newPkg = {
      id: pkgData.id || `pkg-${Date.now()}`,
      slug: pkgData.slug || (pkgData.title ? pkgData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `pkg-${Date.now()}`),
      ...pkgData,
      published: pkgData.published !== false,
      featured: Boolean(pkgData.featured)
    };
    packages.unshift(newPkg);
    writeJsonFile('packages.json', packages);
    return newPkg;
  },
  deletePackage(id) {
    const packages = this.getPackages();
    const filtered = packages.filter(p => p.id !== id);
    writeJsonFile('packages.json', filtered);
    return filtered.length !== packages.length;
  },

  // Destinations
  getDestinations() {
    return readJsonFile('destinations.json', []);
  },
  getFeaturedDestinations() {
    return this.getDestinations().filter(d => d.featured === true);
  },
  getDestinationBySlug(slug) {
    return this.getDestinations().find(d => d.slug === slug);
  },
  getDestinationById(id) {
    return this.getDestinations().find(d => d.id === id);
  },
  saveDestination(destData) {
    const destinations = this.getDestinations();
    if (destData.id) {
      const idx = destinations.findIndex(d => d.id === destData.id);
      if (idx !== -1) {
        destinations[idx] = { ...destinations[idx], ...destData };
        writeJsonFile('destinations.json', destinations);
        return destinations[idx];
      }
    }
    const newDest = {
      id: destData.id || `dest-${Date.now()}`,
      slug: destData.slug || (destData.name ? destData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `dest-${Date.now()}`),
      ...destData,
      featured: Boolean(destData.featured)
    };
    destinations.push(newDest);
    writeJsonFile('destinations.json', destinations);
    return newDest;
  },
  deleteDestination(id) {
    const destinations = this.getDestinations();
    const filtered = destinations.filter(d => d.id !== id);
    writeJsonFile('destinations.json', filtered);
    return filtered.length !== destinations.length;
  },

  // Experiences
  getExperiences() {
    return readJsonFile('experiences.json', []);
  },

  // FAQs
  getFaqs() {
    return readJsonFile('faqs.json', []);
  },

  // Testimonials
  getTestimonials() {
    return readJsonFile('testimonials.json', []);
  },

  // Traveller Photo Memories
  getTravellerMemories() {
    return readJsonFile('traveller-memories.json', []);
  },

  // Enquiries
  getEnquiries() {
    const list = readJsonFile('enquiries.json', []);
    // Sort descending by createdAt
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  getEnquiryById(id) {
    return this.getEnquiries().find(e => e.id === id);
  },
  createEnquiry(enquiryData) {
    const list = readJsonFile('enquiries.json', []);
    const timestamp = new Date().toISOString();
    const shortId = 'ENQ-' + Math.floor(100000 + Math.random() * 900000);

    const newEnquiry = {
      id: shortId,
      source: enquiryData.source || 'General Enquiry', // 'Homepage Quick Enquiry', 'Plan My Trip', 'Package Details', 'Contact Form'
      name: enquiryData.name ? enquiryData.name.trim() : 'Guest Traveller',
      phone: enquiryData.phone ? enquiryData.phone.trim() : '',
      email: enquiryData.email ? enquiryData.email.trim() : '',
      destination: enquiryData.destination || '',
      packageId: enquiryData.packageId || '',
      packageTitle: enquiryData.packageTitle || '',
      travelDate: enquiryData.travelDate || '',
      duration: enquiryData.duration || '',
      travellers: enquiryData.travellers || '1',
      budget: enquiryData.budget || '',
      travelType: enquiryData.travelType || '', // Family, Honeymoon, Couple, Group, Solo, etc.
      accommodation: enquiryData.accommodation || '', // Budget, Standard, Deluxe, Luxury
      message: enquiryData.message ? enquiryData.message.trim() : '',
      status: 'New', // New, Contacted, Follow-up Required, Quotation Sent, Confirmed, Cancelled, Closed
      notes: [],
      createdAt: timestamp,
      updatedAt: timestamp
    };

    list.unshift(newEnquiry);
    writeJsonFile('enquiries.json', list);
    return newEnquiry;
  },
  updateEnquiryStatus(id, status, noteText = '') {
    const list = readJsonFile('enquiries.json', []);
    const enquiry = list.find(e => e.id === id);
    if (!enquiry) return null;

    if (status) {
      enquiry.status = status;
    }
    if (noteText && noteText.trim()) {
      enquiry.notes = enquiry.notes || [];
      enquiry.notes.push({
        text: noteText.trim(),
        date: new Date().toISOString()
      });
    }
    enquiry.updatedAt = new Date().toISOString();
    writeJsonFile('enquiries.json', list);
    return enquiry;
  },
  deleteEnquiry(id) {
    const list = readJsonFile('enquiries.json', []);
    const filtered = list.filter(e => e.id !== id);
    writeJsonFile('enquiries.json', filtered);
    return filtered.length !== list.length;
  },

  // Hotels & Resorts
  getHotels() {
    return readJsonFile('hotels.json', []);
  },
  getHotelById(id) {
    return this.getHotels().find(h => h.id === id);
  },

  // Email Logs
  getEmailLogs() {
    const logs = readJsonFile('email_logs.json', []);
    return logs.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  },
  logEmail(logEntry) {
    const logs = readJsonFile('email_logs.json', []);
    const newLog = {
      id: 'MAIL-' + Math.floor(100000 + Math.random() * 900000),
      sentAt: new Date().toISOString(),
      ...logEntry
    };
    logs.unshift(newLog);
    // Keep last 150 email logs
    if (logs.length > 150) logs.length = 150;
    writeJsonFile('email_logs.json', logs);
    return newLog;
  },

  // Industry Recognition & Affiliations Logos
  getTrustedLogos() {
    const trustedDirUpper = path.join(__dirname, '..', 'public', 'Trusted');
    const trustedDirLower = path.join(__dirname, '..', 'public', 'trusted');
    const targetDir = fs.existsSync(trustedDirUpper) ? trustedDirUpper : (fs.existsSync(trustedDirLower) ? trustedDirLower : null);
    if (!targetDir) return [];
    try {
      const files = fs.readdirSync(targetDir);
      return files
        .filter(f => /\.(png|jpe?g|svg|webp)$/i.test(f))
        .map(f => {
          const folderName = path.basename(targetDir);
          const rawName = path.parse(f).name;
          const cleanName = rawName.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          return {
            filename: f,
            url: `/${folderName}/${encodeURIComponent(f)}`,
            name: cleanName
          };
        });
    } catch (err) {
      console.warn('Error reading trusted logos directory:', err.message);
      return [];
    }
  }
};

