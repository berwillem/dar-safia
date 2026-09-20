const fs = require('fs');
['catalog-data.js', 'catalog-data-new.js'].forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // My previous scripts messed up. Let's fix lines that have a single double quote at the start of the value, and a single quote at the end.
  // For example: img: "/perfumes/dar-safia-femme.img/Prada paradox.jpg',
  // Or: top: "Néroli de Calabre, Bergamote, Mandarine',
  
  let lines = content.split('\n');
  let fixedLines = lines.map(line => {
    let m = line.match(/^(\s*\w+:\s*)"(.*?)',$/);
    if (m) {
      return m[1] + '"' + m[2] + '",';
    }
    m = line.match(/^(\s*\w+:\s*)"(.*?)'$/);
    if (m) {
      return m[1] + '"' + m[2] + '"';
    }
    // Also let's fix original unescaped single quotes if they are still there (for example in catalog-data-new.js where I might have missed them or if I restored catalog-data.js).
    // Actually, I restored catalog-data.js. Let's fix unescaped single quotes in both safely.
    // We look for: key: '... ' ... ',
    // But safely:
    // A string starting with ' and ending with ', but containing ' in the middle.
    let m2 = line.match(/^(\s*\w+:\s*)'(.*)',$/);
    if (m2) {
      let inner = m2[2];
      if (inner.includes("'")) {
        // change outer to double quotes, assuming inner has no double quotes
        return m2[1] + '"' + inner + '",';
      }
    }
    let m3 = line.match(/^(\s*\w+:\s*)'(.*)'$/);
    if (m3) {
      let inner = m3[2];
      if (inner.includes("'")) {
        return m3[1] + '"' + inner + '"';
      }
    }
    
    return line;
  });
  
  fs.writeFileSync(file, fixedLines.join('\n'));
});
