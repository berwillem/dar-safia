const fs = require('fs');
let c = fs.readFileSync('catalog-data-new.js', 'utf8');
c = c.replace(/img:\s*"(.*?)',/g, 'img: "$1",');
fs.writeFileSync('catalog-data-new.js', c);
