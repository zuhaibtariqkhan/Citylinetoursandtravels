const fs = require('fs');
const path = require('path');

const icons = new Set();
function findIcons(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(ent => {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) findIcons(full);
    else if (ent.name.endsWith('.ejs') || ent.name.endsWith('.js') || ent.name.endsWith('.json')) {
      const txt = fs.readFileSync(full, 'utf8');
      const regex = /data-lucide=["']([^"']+)["']/g;
      let m;
      while ((m = regex.exec(txt)) !== null) {
        icons.add(m[1]);
      }
    }
  });
}
findIcons('views');
console.log('Total unique icons found: ' + icons.size);
console.log(Array.from(icons).sort().join(', '));
