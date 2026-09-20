const fs = require('fs');
['catalog-data.js', 'catalog-data-new.js'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/img:\s*'([^']*'[^']*)'/g, 'img: "$1"');
  fs.writeFileSync(file, content);
});
