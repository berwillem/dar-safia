const fs = require('fs');
const txt = fs.readFileSync('c:/Users/dell/dar-safia/catalog-data.js', 'utf8');

const regex = /name:\s*["'](.*?)["']/g;
let match;
while ((match = regex.exec(txt)) !== null) {
  const name = match[1];
  // extract the image for this name
  const imgRegex = new RegExp(`name:\\s*["']${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][\\s\\S]*?img:\\s*["']([^"']+)["']`);
  const imgMatch = txt.match(imgRegex);
  if (imgMatch) {
    if (!imgMatch[1].startsWith('/perfumes/')) {
        console.log("Unmapped:", name, "->", imgMatch[1]);
    }
  }
}
