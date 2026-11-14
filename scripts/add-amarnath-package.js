const fs = require('fs');
const path = require('path');

const packagesPath = path.join(__dirname, '../data/packages.json');
const pkgs = JSON.parse(fs.readFileSync(packagesPath, 'utf8'));

const existingIndex = pkgs.findIndex(p => p.id === 'amarnath-yatra-holy-cave-baba-barfani');

const newPkg = {
  id: 'amarnath-yatra-holy-cave-baba-barfani',
  slug: 'amarnath-yatra-holy-cave-baba-barfani-5d4n',
  aliases: [
    'amarnath-yatra',
    'amarnath-yatra-package',
    'amarnath-yatra-baba-barfani',
    'amarnath-yatra-5d4n',
    'pkg-amarnath-yatra'
  ],
  title: 'Amarnath Yatra — A Sacred Journey to the Holy Cave of Baba Barfani',
  shortTitle: 'Amarnath Yatra Pilgrimage',
  mainHeading: 'A Sacred Journey to the Holy Cave of Baba Barfani',
  tagline: 'Where Your Travel Dreams Take Flight',
  additionalTagline: 'Respect Every Faith, Embrace Every Journey.',
  category: 'Pilgrimage / Spiritual',
  categoryLabel: 'Sacred Pilgrimage Package',
  duration: '04 Nights / 05 Days',
  durationDays: 5,
  durationNights: 4,
  route: 'Srinagar – Sonamarg – Baltal – Holy Amarnath Cave – Srinagar',
  destinationsCovered: 'Srinagar – Sonamarg – Baltal – Holy Amarnath Cave – Srinagar',
  destinationCoverage: [
    'Srinagar',
    'Sonamarg',
    'Baltal Base Camp',
    'Holy Amarnath Cave',
    'Srinagar'
  ],
  tourType: 'Family, Group & Individual Pilgrimage',
  baseOccupancy: 2,
  minTravellers: 2,
  maxTravellers: 25,
  occupancyLabel: '2 Yatris (Base Group)',
  price: 35000,
  basePrice: 35000,
  startingPriceFormatted: '₹35,000',
  pricePerPerson: 17500,
  pricePerYatri: 17500,
  additionalPersonCharge: 17500,
  additionalYatriCharge: 17500,
  pricingType: '2 yatris base',
  pricingModel: 'amarnath_yatra',
  additionalPersonPricing: true,
  currency: 'INR',
  accommodation: 'Deluxe Hotels / Camps (03 Nights Srinagar Deluxe Room + 01 Night Baltal/Sonamarg Deluxe Camp/Hotel)',
  meals: 'Daily Breakfast & Dinner',
  transportation: 'Private Dedicated Vehicle for all Airport, Sightseeing & Baltal Base Camp Transfers',
  shortDescription: 'Experience a spiritually enriching pilgrimage to the sacred cave of Shri Amarnath Ji, situated amidst the majestic Himalayas of Jammu and Kashmir. Worshipped as Baba Barfani, the naturally formed ice Shiva Lingam is a beacon of faith surrounded by breathtaking mountain landscapes.',
  fullDescription: 'Experience a spiritually enriching journey to the sacred cave of Shri Amarnath Ji, situated amidst the majestic Himalayas of Jammu and Kashmir.\n\nThe holy shrine is renowned for the naturally formed ice Shiva Lingam, worshipped by devotees as Baba Barfani. Surrounded by breathtaking Himalayan landscapes, this pilgrimage offers a unique combination of spiritual devotion, natural beauty and unforgettable experiences.\n\nWith City Line Tours and Travels, enjoy a thoughtfully planned journey with comfortable accommodation, reliable transportation and dedicated travel assistance. We welcome pilgrims from every background and aim to make every journey peaceful, comfortable and memorable.\n\nRespect Every Faith, Embrace Every Journey.',
  featuredImage: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80',
  galleryImages: [
    'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=1000&q=80',
    '/images/Expriences/DAL LAKE SHIKARA.jpeg',
    '/images/Expriences/MUGHAL GARDENS.jpeg',
    '/images/Expriences/GULMARG GANDOLA.jpeg'
  ],
  itinerary: [
    {
      day: 1,
      title: 'ARRIVAL IN SRINAGAR – SRINAGAR LOCAL SIGHTSEEING',
      description: 'Pickup from Srinagar International Airport. Welcome by company representative and transfer to pre-booked hotel. Check-in and relaxation. Proceed for Srinagar local sightseeing. Major attractions: 1. Shankaracharya Temple (ancient hilltop shrine dedicated to Lord Shiva), 2. Pari Mahal (Palace of Fairies overlooking Dal Lake), 3. Nishat Garden (Garden of Bliss), 4. Shalimar Bagh (Abode of Love), 5. Dal Lake — optional Shikara ride at guest\'s expense. Return to hotel in evening.',
      places: [
        'Shankaracharya Temple',
        'Pari Mahal',
        'Nishat Garden',
        'Shalimar Bagh',
        'Dal Lake (Optional Shikara Ride)'
      ],
      stay: 'Deluxe Room in Srinagar',
      meals: 'Dinner Included'
    },
    {
      day: 2,
      title: 'SRINAGAR – SONAMARG – BALTAL BASE CAMP',
      description: 'Breakfast at hotel. Check out and proceed towards Sonamarg. Enjoy a scenic drive along the roaring Sindh River. Major attractions en route: 1. Gagangir, 2. Sonamarg Meadows, 3. Thajiwas Glacier, 4. Baltal Valley. Arrive at Baltal and check in to pre-arranged camp or accommodation. Meet the local support team and prepare for the sacred pilgrimage.',
      places: [
        'Sindh River Scenic Drive',
        'Gagangir Valley',
        'Sonamarg Meadows',
        'Thajiwas Glacier Viewpoint',
        'Baltal Valley Base Camp'
      ],
      stay: 'Deluxe Camp / Hotel in Baltal or Sonamarg (Subject to availability)',
      meals: 'Breakfast & Dinner Included'
    },
    {
      day: 3,
      title: 'BALTAL – HOLY AMARNATH CAVE – DIVINE DARSHAN',
      description: 'Early morning wake-up call. Breakfast and preparation for the holy pilgrimage. Proceed to the designated access control point after completing Yatra formalities. Begin the trek towards Shri Amarnath Ji Cave. Major Yatra route attractions: 1. Baltal Base Camp, 2. Domail, 3. Barari Marg, 4. Sangam, 5. Shri Amarnath Ji Holy Cave. Seek the divine blessings of Baba Barfani. After darshan, return towards Baltal according to approved route arrangements.\n\nIMPORTANT TREKKING INFORMATION:\nThe Baltal trekking route is approximately 14 km one way. It is steep and physically demanding. Pilgrims should be medically fit and prepared for high-altitude conditions. Same-day return is subject to fitness, weather, official timings and administration instructions.',
      places: [
        'Baltal Base Camp',
        'Domail Access Point',
        'Barari Marg',
        'Sangam Point',
        'Shri Amarnath Ji Holy Cave (Baba Barfani)'
      ],
      stay: 'Deluxe Camp / Hotel in Baltal (Subject to availability)',
      meals: 'Breakfast & Dinner Included'
    },
    {
      day: 4,
      title: 'BALTAL – SONAMARG – SRINAGAR',
      description: 'Breakfast at camp or hotel. Complete check-out formalities. Proceed towards Srinagar via Sonamarg. Enjoy scenic views of the Sindh River and Himalayan mountains. Photography and sightseeing stops wherever permitted. Arrive in Srinagar and transfer to hotel. Evening free for leisure, relaxation, and souvenir shopping in local markets.',
      places: [
        'Return Scenic Drive via Sindh River',
        'Sonamarg Photography Stops',
        'Srinagar Leisure & Shopping'
      ],
      stay: 'Deluxe Room in Srinagar',
      meals: 'Breakfast & Dinner Included'
    },
    {
      day: 5,
      title: 'SRINAGAR – AIRPORT DEPARTURE',
      description: 'Breakfast at hotel. Check out. Transfer to Srinagar International Airport according to flight timing (arrival at least 2 hours prior to scheduled departure). Tour Ends With Divine Blessings & Beautiful Memories!',
      stay: 'Tour Concludes (Airport Drop)',
      meals: 'Breakfast Included'
    }
  ],
  inclusions: [
    '03 Nights accommodation in Srinagar (Deluxe Room category).',
    '01 Night accommodation in Baltal / Sonamarg (Deluxe Camp / Hotel).',
    'Daily breakfast and dinner throughout the itinerary.',
    'Private vehicle for airport pickup and drop-off.',
    'Srinagar–Sonamarg–Baltal–Srinagar transportation.',
    'Srinagar local sightseeing as mentioned in itinerary.',
    'Driver allowance, toll tax and parking charges.',
    'Dedicated travel assistance throughout the tour.',
    'Accommodation coordination at the Yatra base camp.',
    'Applicable accommodation taxes as specified at booking.'
  ],
  exclusions: [
    'Amarnath Yatra registration and permit charges.',
    'Helicopter tickets (subject to official availability and separate booking).',
    'Pony, palki and porter charges along the trek.',
    'Medical check-up and personal medicines / CHC certificate fees.',
    'Special accommodation or tent upgrades at base camp.',
    'Lunch, snacks and beverages.',
    'Personal expenses, tips and shopping.',
    'Entry fees and optional activities (Shikara ride, etc.).',
    'Additional services not mentioned under package inclusions.'
  ],
  routeComparison: {
    baltalRoute: {
      name: 'Baltal Route (Included in Package Itinerary)',
      distance: 'Approximately 14 km one way',
      characteristics: 'Shorter but steep and challenging. Suitable for physically fit pilgrims. Usually planned as a demanding single-day trek from Baltal base camp.',
      note: 'The listed package itinerary is based on this Baltal route.'
    },
    pahalgamRoute: {
      name: 'Pahalgam Route (Traditional Alternative)',
      distance: 'Approximately 36–48 km depending on route measurement',
      characteristics: 'Traditional pilgrimage route via Chandanwari, Sheshnag and Panchtarni. Generally requires multiple days. Offers beautiful Himalayan landscapes.',
      note: 'The Pahalgam route is an optional alternative and is not automatically included in the quoted package.'
    }
  },
  yatraGuidelines: {
    title: 'IMPORTANT YATRA GUIDELINES & STATUTORY REQUIREMENTS',
    officialPortalUrl: 'https://jksasb.nic.in/',
    officialPortalLabel: 'Shri Amarnathji Shrine Board (SASB) Official Portal',
    rules: [
      'Every pilgrim must complete official Amarnath Yatra registration through the Shrine Board.',
      'A valid Compulsory Health Certificate (CHC) from an authorised medical institution is mandatory as per SASB guidelines.',
      'Collect and wear the mandatory RFID tracking card before proceeding past base camp access control points.',
      'Carry valid government-issued photo identity documents (Aadhaar Card, Voter ID, Passport) at all times.',
      'Carry heavy warm woollens, windproof/waterproof jackets, thermal inners, rain poncho, gloves, and comfortable trekking shoes.',
      'Keep essential personal medicines, altitude medication (as advised by your physician), and emergency contact details.',
      'Strictly follow instructions issued by the Shri Amarnathji Shrine Board, security personnel, and local civil administration.',
      'Avoid trekking beyond permitted gate cut-off timings established for pilgrim safety.',
      'Yatra operations are subject to weather, route accessibility, high-altitude safety clearance, and official permissions.'
    ],
    operationalDisclaimer: 'OPERATIONAL NOTICE: City Line Tours and Travels provides hospitality, transportation, and accommodation coordination. Registration, permits, helicopter tickets, and darshan cannot be guaranteed before official Shrine Board permissions, and route operations depend strictly on weather and official administration clearances.'
  },
  whyChooseUs: {
    heading: 'WHY CHOOSE CITY LINE TOURS AND TRAVELS?',
    tagline: 'Respect Every Faith, Embrace Every Journey.',
    description: 'At City Line Tours and Travels, we believe every journey deserves comfort, care and proper planning. We welcome pilgrims from every background and aim to make every journey peaceful, comfortable and memorable.',
    pillars: [
      { title: 'Comfortable Accommodation', desc: 'Pre-vetted Deluxe rooms in Srinagar and clean, organized camps/hotels at Baltal base camp.' },
      { title: 'Reliable Mountain Transport', desc: 'Clean, sanitized private vehicles operated by experienced mountain drivers familiar with the Sindh valley.' },
      { title: 'Dedicated Travel Assistance', desc: 'Direct 24/7 on-trip coordinator to assist with timings, camp check-ins, and airport transfers.' },
      { title: 'Professional Hospitality', desc: 'Transparent guidance, punctual scheduling, and respectful service for every devotee.' },
      { title: 'Proper Itinerary Planning', desc: 'Balanced travel days allowing adequate rest before and after the demanding high-altitude trek.' },
      { title: 'Memorable Travel Experiences', desc: 'A seamless journey blending spiritual devotion with the awe-inspiring beauty of Kashmir.' }
    ]
  },
  importantNotesTitle: 'IMPORTANT NOTICE — PILGRIMAGE TRAVEL & PERMITS',
  importantNotes: [
    'The package price of ₹35,000 (for 2 Yatris) covers private travel, deluxe accommodation, meals, and assistance as specified.',
    'Amarnath Yatra registration, Compulsory Health Certificate (CHC), RFID cards, and helicopter tickets are excluded and must be arranged as per SASB guidelines.',
    'Ponies, palkis, and porters are payable directly by guests at official government-notified rates.',
    'Same-day return from the Holy Cave is subject to fitness, mountain weather, official cut-off timings, and Shrine Board directives.',
    'Yatra operations and road access are subject to daily safety clearance by local civil administration and traffic authorities.'
  ],
  responsibleTourism: {
    title: 'SACRED ENVIRONMENT — KEEP THE HIMALAYAS PRISTINE',
    intro: 'The holy Himalayas and the sacred Amarnath valley are revered natural sanctuaries. Devotees and travellers are requested to protect their purity.',
    guidelines: [
      'Do not discard plastic bottles, wrappers, or polybags on the holy trekking trail or in water bodies.',
      'Use designated waste bins provided at camps, langars, and transit points.',
      'Respect fellow pilgrims, local mountain workers, security personnel, and volunteers.',
      'Maintain the sanctity of the Holy Cave, temples, and natural shrines throughout the journey.',
      'Adhere strictly to official Shri Amarnathji Shrine Board eco-guidelines.'
    ],
    closingHeading: 'May Baba Barfani bless your sacred journey with peace and fulfillment!',
    closingNote: 'Thank you for choosing City Line Tours and Travels. Respect Every Faith, Embrace Every Journey.',
    closingMessage: 'May Baba Barfani bless your sacred journey with peace and fulfillment!\nThank you for choosing City Line Tours and Travels. Respect Every Faith, Embrace Every Journey.'
  },
  contactInfo: {
    companyName: 'CITY LINE TOURS AND TRAVELS',
    tagline: 'Where Your Travel Dreams Take Flight',
    additionalTagline: 'Respect Every Faith, Embrace Every Journey.',
    phones: [
      '6006725007',
      '99066 76890'
    ],
    email: 'askcitylinetravels@gmail.com',
    location: 'Srinagar, Kashmir',
    closingMessage: 'Thank you for choosing City Line Tours and Travels. Respect Every Faith, Embrace Every Journey.'
  },
  featured: true,
  published: true
};

if (existingIndex >= 0) {
  pkgs[existingIndex] = newPkg;
  console.log('Updated existing Amarnath Yatra package in data/packages.json');
} else {
  // Add as a featured package
  pkgs.push(newPkg);
  console.log('Added new Amarnath Yatra package to data/packages.json');
}

fs.writeFileSync(packagesPath, JSON.stringify(pkgs, null, 2), 'utf8');
console.log('Total packages in packages.json:', pkgs.length);
