const http = require('http');

http.get('http://localhost:3000/hotels', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('HTML LENGTH:', data.length);
    const cardMatches = data.match(/class=\"[^\"]*hotel-card/g);
    console.log('HOTEL CARD ELEMENTS COUNT:', cardMatches ? cardMatches.length : 0);

    const hotels = [
      'Taj Dal View',
      'The LaLit Grand Palace',
      'Sarovar Premiere',
      'WelcomHeritage',
      'Asian Park',
      'Namrose Resorts',
      'Comrade Inn',
      'Ov Boutique',
      'Midtown Greens',
      'Pride Inn',
      'The Khyber Himalayan Resorts',
      'Hilltop (Gulmarg)',
      'Apple Tree Resorts',
      'Welcomhotel by ITC Hotels, Pine N Peak',
      'Mountnoor Sarovar Premiere',
      'The Walnut Creek',
      'Black Pearl',
      'Houseboat Royal Star',
      'Macot Houseboats'
    ];

    let allFound = true;
    hotels.forEach((h, idx) => {
      const found = data.includes(h);
      console.log(`[${found ? 'PASS' : 'FAIL'}] #${idx + 1}: ${h}`);
      if (!found) allFound = false;
    });

    if (allFound && cardMatches && cardMatches.length === 19) {
      console.log('\n🌟 ALL 19 HOTELS VERIFIED SUCCESSFULLY ON HOTELS PAGE!');
    } else {
      console.error('\n❌ SOME HOTELS MISSING OR COUNT MISMATCH');
      process.exit(1);
    }
  });
}).on('error', err => {
  console.error('Request failed:', err.message);
  process.exit(1);
});
