const fs = require('fs');
const path = require('path');

const packagesPath = path.join(__dirname, '../data/packages.json');
const pkgs = JSON.parse(fs.readFileSync(packagesPath, 'utf8'));

// Check if already exists
const existingIndex = pkgs.findIndex(p => p.id === 'tulip-festival-blooming-paradise');

const newPkg = {
  id: 'tulip-festival-blooming-paradise',
  slug: 'tulip-festival-blooming-paradise-kashmir-4d3n',
  aliases: [
    'tulip-festival',
    'tulip-festival-blooming-paradise',
    'tulip-festival-the-blooming-paradise-of-kashmir',
    'pkg-tulip-festival',
    'tulip-festival-kashmir'
  ],
  title: 'Tulip Festival – The Blooming Paradise of Kashmir',
  shortTitle: 'Tulip Festival Kashmir',
  tagline: 'Where Your Travel Dreams Take Flight',
  additionalTagline: 'Respect Every Faith, Embrace Every Journey.',
  category: 'Seasonal / Spring',
  categoryLabel: 'Spring / Festival Package',
  duration: '3 Nights / 4 Days',
  durationDays: 4,
  durationNights: 3,
  route: 'Srinagar – Pahalgam – Gulmarg – Srinagar',
  destinationsCovered: 'Srinagar – Pahalgam – Gulmarg – Srinagar',
  destinationCoverage: [
    'Srinagar',
    'Pahalgam',
    'Gulmarg'
  ],
  baseOccupancy: 2,
  minTravellers: 2,
  maxTravellers: 20,
  occupancyLabel: '2 Travellers (Base Group)',
  price: 27000,
  basePrice: 27000,
  startingPriceFormatted: '₹27,000',
  pricePerPerson: 13500,
  additionalPersonCharge: 13500,
  pricingType: '2 travellers base',
  pricingModel: 'tulip_festival',
  additionalPersonPricing: true,
  currency: 'INR',
  shortDescription: 'Experience the breathtaking beauty of Kashmir during its most colourful season. Witness the magnificent Tulip Garden in full bloom, explore the Mughal gardens of Srinagar, enjoy the scenic valleys of Pahalgam and discover the snow-capped mountains of Gulmarg. This specially designed spring package offers a beautiful combination of nature, sightseeing and relaxation.',
  fullDescription: 'Experience the breathtaking beauty of Kashmir during its most colourful season. Witness the magnificent Tulip Garden in full bloom, explore the Mughal gardens of Srinagar, enjoy the scenic valleys of Pahalgam and discover the snow-capped mountains of Gulmarg.\n\nThis specially designed spring package offers a beautiful combination of nature, sightseeing and relaxation. Complete with Deluxe room category accommodations in well-rated hotels, a comfortable Deluxe Sedan for all transfers and sightseeing, daily breakfast and dinner, and hassle-free Srinagar airport pickup and departure transfers.',
  featuredImage: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1200&q=80',
  galleryImages: [
    'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1000&q=80',
    '/images/Expriences/MUGHAL GARDENS.jpeg',
    '/images/Expriences/DAL LAKE SHIKARA.jpeg',
    '/images/Expriences/GULMARG GANDOLA.jpeg',
    '/images/Expriences/BETAAB VALLEY.jpeg'
  ],
  itinerary: [
    {
      day: 1,
      title: 'ARRIVAL IN SRINAGAR & LOCAL SIGHTSEEING',
      description: 'Pickup: Srinagar International Airport. Welcome guests at the airport, transfer them to the hotel and proceed with Srinagar sightseeing after check-in and relaxation. Places to visit: Chashme Shahi Garden, Indira Gandhi Memorial Tulip Garden (Asia\'s largest tulip garden boasting millions of blooming flowers), Chrysanthemum Garden, Nishat Bagh, Shalimar Bagh, Shankaracharya Temple, and Dal Lake — optional Shikara ride at guest\'s expense.',
      places: [
        'Chashme Shahi Garden',
        'Indira Gandhi Memorial Tulip Garden',
        'Chrysanthemum Garden',
        'Nishat Bagh',
        'Shalimar Bagh',
        'Shankaracharya Temple',
        'Dal Lake (Optional Shikara Ride)'
      ],
      stay: 'Deluxe Room in Srinagar',
      meals: 'Dinner & Breakfast'
    },
    {
      day: 2,
      title: 'SRINAGAR TO PAHALGAM — THE VALLEY OF SHEPHERDS',
      description: 'Distance: Approximately 90–95 KM | Travel Time: Approximately 2.5–3.5 Hours. Travel through Kashmir\'s scenic countryside towards Pahalgam. En-route sightseeing: Saffron Fields at Pampore, Dry Fruits Market, and Cricket Bat Factories in Sangam. Check in to the hotel and relax amidst the pine forests and rushing Lidder River.',
      distance: 'Approximately 90–95 KM (2.5–3.5 Hours)',
      places: [
        'Saffron Fields, Pampore',
        'Dry Fruits Market',
        'Cricket Bat Factories, Sangam',
        'Lidder River & Pine Valleys'
      ],
      stay: 'Deluxe Room in Pahalgam',
      meals: 'Dinner & Breakfast'
    },
    {
      day: 3,
      title: 'PAHALGAM TO GULMARG — THE MEADOW OF FLOWERS',
      description: 'Distance: Approximately 140–150 KM | Travel Time: Approximately 4–5 Hours. Proceed towards Gulmarg and explore: Gulmarg Meadows, Gulmarg Gondola (ticket at guest\'s expense), St. Mary\'s Church, Maharani Temple, and Gulmarg Golf Course. Check in to the hotel after sightseeing and relax surrounded by snow-covered peaks.',
      distance: 'Approximately 140–150 KM (4–5 Hours)',
      places: [
        'Gulmarg Meadows',
        'Gulmarg Gondola (Cable Car)',
        'St. Mary\'s Church',
        'Maharani Temple',
        'Gulmarg Golf Course'
      ],
      stay: 'Deluxe Room in Gulmarg',
      meals: 'Dinner & Breakfast'
    },
    {
      day: 4,
      title: 'GULMARG TO SRINAGAR AIRPORT — DEPARTURE',
      description: 'After breakfast, check out from the hotel and transfer to Srinagar Airport. Ensure arrival at least 2 hours before the scheduled flight departure. Tour ends with beautiful memories of Kashmir!',
      stay: 'Tour Concludes (Airport Drop)',
      meals: 'Breakfast Included'
    }
  ],
  inclusions: [
    'Accommodation in well-rated hotels.',
    'Deluxe room category at all destinations.',
    'Comfortable Deluxe Sedan for the complete tour.',
    'Daily breakfast and dinner at hotels.',
    'Airport pickup and departure transfers.',
    'Applicable vehicle tolls, parking charges and driver allowances.',
    'Applicable hotel taxes as per package quotation.'
  ],
  exclusions: [
    'Entry tickets to gardens, monuments and sightseeing attractions.',
    'Shikara rides, Gondola tickets, pony rides, local union vehicles and adventure activities (payable directly by guests).',
    'Additional sightseeing and activity charges must be paid by guests.',
    'Lunch, personal expenses, beverages, and tips.',
    'Any items or services not explicitly mentioned under package inclusions.'
  ],
  importantNotesTitle: 'IMPORTANT NOTE — SIGHTSEEING & ACTIVITY CHARGES',
  importantNotes: [
    'Entry tickets to gardens, monuments and sightseeing attractions are not included.',
    'Shikara rides, Gondola tickets, pony rides, local union vehicles and adventure activities are payable directly by guests.',
    'Additional sightseeing and activity charges must be paid by guests.',
    'Sightseeing is subject to weather, road accessibility and local administration guidelines.',
    'Tulip blooming is seasonal and depends on weather conditions. Full bloom cannot be guaranteed on fixed dates.'
  ],
  responsibleTourism: {
    title: 'OUR REQUEST — KEEP KASHMIR CLEAN & GREEN',
    intro: 'Kashmir is a beautiful paradise, and it is our collective responsibility to protect its natural beauty.',
    guidelines: [
      'Do not throw plastic bottles, wrappers or waste in public areas.',
      'Avoid spitting on roads, streets and public places.',
      'Use designated dustbins.',
      'Help maintain the cleanliness of gardens, lakes, mountains and valleys.',
      'Respect nature, local traditions and the environment.'
    ],
    closingHeading: 'Let\'s keep Kashmir Clean & Green for generations to come!',
    closingNote: 'Thank you for choosing City Line Tours and Travels. Respect Every Faith, Embrace Every Journey.',
    closingMessage: 'Let\'s keep Kashmir Clean & Green for generations to come!\nThank you for choosing City Line Tours and Travels. Respect Every Faith, Embrace Every Journey.'
  },
  contactInfo: {
    companyName: 'CITY LINE TOURS AND TRAVELS',
    tagline: 'Where Your Travel Dreams Take Flight',
    additionalTagline: 'Respect Every Faith, Embrace Every Journey.',
    phones: [
      '6006725007',
      '99066 76890'
    ],
    email: 'citylinetoursandtravels@gmail.com',
    location: 'Srinagar, Kashmir',
    closingMessage: 'Thank you for choosing City Line Tours and Travels. Respect Every Faith, Embrace Every Journey.'
  },
  accommodation: '3 Nights / 4 Days in Deluxe Room Category across Srinagar, Pahalgam & Gulmarg',
  transportation: 'Comfortable Deluxe Sedan for the complete tour',
  featured: true,
  published: true
};

if (existingIndex >= 0) {
  pkgs[existingIndex] = newPkg;
  console.log('Updated existing package in data/packages.json');
} else {
  pkgs.push(newPkg);
  console.log('Added new package to data/packages.json');
}

fs.writeFileSync(packagesPath, JSON.stringify(pkgs, null, 2), 'utf8');
console.log('Total packages in packages.json:', pkgs.length);
