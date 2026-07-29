const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf-8');

content = content.replace(/experimentalAutoDetectLongPolling: true/g, 'experimentalForceLongPolling: true');

fs.writeFileSync('src/lib/firebase.ts', content, 'utf-8');
console.log('Firebase config updated 2');
