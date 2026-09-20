const fs = require('fs');
const txt = fs.readFileSync('c:/Users/dell/dar-safia/catalog-data.js', 'utf8');

const names = [];
const lines = txt.split('\n');
for (const line of lines) {
    if (line.includes('name:')) {
        const match = line.match(/name:\s*(['"])(.*?)\1/);
        if (match) names.push(match[2]);
        else if (line.includes("name: \"")) {
           const str = line.split("name: \"")[1].split("\",")[0];
           names.push(str);
        } else if (line.includes("name: '")) {
           const str = line.split("name: '")[1].split("',")[0];
           names.push(str);
        }
    }
}
console.log(names);
