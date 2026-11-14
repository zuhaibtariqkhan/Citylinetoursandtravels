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
      { name: 'Taj Dal View', loc: 'Kralsangri, Brein, Srinagar' },
      { name: 'The LaLiT Grand Palace', loc: 'Gupkar Road, Srinagar' },
      { name: 'Sarovar Premiere', loc: 'M.A. Road, Regal Chowk, Srinagar' },
      { name: 'WelcomHeritage', loc: 'Airport Road, Srinagar' },
      { name: 'Asian Park', loc: 'M.A. Link Road, Munawarabad, Srinagar' },
      { name: 'Namrose Resorts', loc: 'Munawarabad, Srinagar' },
      { name: 'Comrade Inn', loc: 'Rajbagh, Srinagar' },
      { name: 'OV Boutique', loc: 'Rajbagh, Srinagar' },
      { name: 'Midtown Greens', loc: 'Baghat, Srinagar' },
      { name: 'Pride Inn', loc: 'Rajbagh, Srinagar' },
      { name: 'The Khyber Himalayan Resorts', loc: 'Hotel Khyber Road, Gulmarg' },
      { name: 'Hilltop', loc: 'Gulmarg, Gulmarg' },
      { name: 'Apple Tree Resorts', loc: 'Kunzer, Tangmarg Road, Gulmarg area' },
      { name: 'Welcomhotel by ITC Hotels, Pine N Peak', loc: 'Aru Road, Pahalgam' },
      { name: 'Mountnoor Sarovar Premiere', loc: 'Sallar Dalseer, Pahalgam' },
      { name: 'The Walnut Creek', loc: 'Dewathoo, Pahalgam' },
      { name: 'Black Pearl Houseboat', loc: 'Dal Lake, Srinagar' },
      { name: 'Houseboat Royal Star', loc: 'Gate No. 14, Dal Lake, Gagribal, Srinagar' },
      { name: 'Mascot Houseboats', loc: 'Nigeen Lake, Srinagar' }
    ];

    let allFound = true;
    hotels.forEach((h, idx) => {
      const nameFound = data.includes(h.name);
      const locFound = data.includes(h.loc);
      const pass = nameFound && locFound;
      console.log(`[${pass ? 'PASS' : 'FAIL'}] #${idx + 1}: ${h.name} -> ${h.loc}`);
      if (!pass) allFound = false;
    });

    if (allFound && cardMatches && cardMatches.length === 19) {
      console.log('\n🌟 ALL 19 HOTELS AND UPDATED LOCATIONS VERIFIED SUCCESSFULLY ON HOTELS PAGE!');
    } else {
      console.error('\n❌ SOME HOTELS OR LOCATIONS MISSING OR COUNT MISMATCH');
      process.exit(1);
    }
  });
}).on('error', err => {
  console.error('Request failed:', err.message);
  process.exit(1);
});
