const fs = require('fs');
['catalog-data.js', 'catalog-data-new.js'].forEach(file => {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const newLines = lines.map(line => {
    if (line.match(/^\s*img:\s*'.*',?\s*$/)) {
      // Find the first single quote after 'img:'
      let startQuote = line.indexOf("'", line.indexOf('img:'));
      // Find the last single quote
      let endQuote = line.lastIndexOf("'");
      if (startQuote !== -1 && endQuote !== -1 && startQuote !== endQuote) {
        let before = line.substring(0, startQuote);
        let inside = line.substring(startQuote + 1, endQuote);
        let after = line.substring(endQuote + 1);
        return before + '"' + inside + '"' + after;
      }
    }
    return line;
  });
  fs.writeFileSync(file, newLines.join('\n'));
});
