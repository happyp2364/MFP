const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(/filterState\.\(searchQuery \|\| ''\)\.toLowerCase\(\)/g, "(filterState.searchQuery || '').toLowerCase()");
fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('Fixed App.tsx');
