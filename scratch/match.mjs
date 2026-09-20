import fs from 'fs';
import path from 'path';

// Normalization function to make matching easier
const normalize = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-zA-Z0-9]/g, "") // remove non-alphanumerics (spaces, punctuation)
    .toLowerCase();
};

const getFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).map(f => ({ name: f, path: path.join(dir, f).replace(/\\/g, '/'), norm: normalize(f) }));
};

const femmeFiles = getFiles('perfumes/dar-safia-femme.img');
const hommeFiles = getFiles('perfumes/dar-safia-homme.img');
const allFiles = [...femmeFiles, ...hommeFiles];

function findBestMatch(brand, name) {
  const target1 = normalize(brand + name);
  const target2 = normalize(name);
  
  let bestFile = null;
  let bestScore = 0;

  for (const file of allFiles) {
    let score = 0;
    // Simple substring matching or exact matching
    if (file.norm.includes(target1) || target1.includes(file.norm)) score += 10;
    if (file.norm.includes(target2) || target2.includes(file.norm)) score += 5;
    
    // Levenshtein or just simple includes works for most cases
    // We can just check if file name contains the words of brand and name
    let words = (brand + " " + name).toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(w => w.length > 2);
    let matchCount = words.filter(w => file.name.toLowerCase().includes(w)).length;
    score += matchCount;

    if (score > bestScore) {
      bestScore = score;
      bestFile = file;
    }
  }
  return bestFile ? '/' + bestFile.path : null;
}

function processCatalog(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // We need to parse brand, name, and replace img
  let newContent = "";
  let blocks = content.split(/(\{\s*id:\s*\d+,)/);
  if (blocks.length === 1) return;
  
  newContent += blocks[0];
  
  for (let i = 1; i < blocks.length; i += 2) {
    let prefix = blocks[i];
    let block = blocks[i+1];
    
    let brandMatch = block.match(/brand:\s*['"]([^'"]+)['"]/);
    let nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);
    let currentImgMatch = block.match(/img:\s*['"]([^'"]+)['"]/);
    
    if (brandMatch && nameMatch && currentImgMatch) {
      let brand = brandMatch[1];
      let name = nameMatch[1];
      
      let matchedFile = findBestMatch(brand, name);
      if (matchedFile) {
        // replace img property
        block = block.replace(/img:\s*['"][^'"]+['"]/, `img: "${matchedFile}"`);
        console.log(`Matched: ${brand} ${name} -> ${matchedFile}`);
      } else {
        console.log(`NO MATCH FOUND: ${brand} ${name}`);
      }
    }
    
    newContent += prefix + block;
  }
  
  fs.writeFileSync(file, newContent);
}

processCatalog('catalog-data.js');
processCatalog('catalog-data-new.js');
