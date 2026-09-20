const fs = require('fs');
const catalogPath = 'c:/Users/dell/dar-safia/catalog-data.js';

const mapping = {
  "Givenchy L'Interdit Rouge": "/perfumes/dar-safia-femme.img/givenchy L'Interdit Eau de Parfum Rouge.jpg",
  "Givenchy L'Interdit Rouge Ultime": "/perfumes/dar-safia-femme.img/givenchy L'Interdit Eau de Parfum Rouge.jpg",
  "Dior J'adore Intense": "/perfumes/dar-safia-femme.img/Dior J'adore Intense.jpg",
  "L'Instant de Guerlain Femme": "/perfumes/dar-safia-femme.img/L'Instant de Guerlain Eau de Parfum.jpg",
  "Dolce & Gabbana L'Impératrice": "/perfumes/dar-safia-femme.img/Dolce & Gabbana L'Imperatrice Eau de Toilette.jpg",
  "Prada Paradigme / L'Homme": "/perfumes/dar-safia-homme.img/prada paradox.paradigm.jpg",
  "Hermès Terre d'Hermès Intense": "/perfumes/dar-safia-homme.img/Hermès terre d'hermés intense.jpg",
  "Yves Saint Laurent La Nuit de L'Homme Eau de Parfum": "/perfumes/dar-safia-homme.img/yves saint laurent La Nuit de L'Homme perfume.jpg"
};

let txt = fs.readFileSync(catalogPath, 'utf8');

for (const [name, path] of Object.entries(mapping)) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // find name: 'Name' or name: "Name"
    const regex = new RegExp(`(name:\\s*['"]${escapedName}['"][\\s\\S]*?img:\\s*['"])([^'"]+)(['"])`);
    txt = txt.replace(regex, `$1${path}$3`);
}

fs.writeFileSync(catalogPath, txt);
console.log('Fixed the remaining 8!');
