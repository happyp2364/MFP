const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf-8');

content = content.replace(/getFirestore,/g, 'getFirestore, initializeFirestore,');
content = content.replace(/export const db = getFirestore\(app, \(firebaseConfig as any\)\.firestoreDatabaseId \|\| undefined\);/g, `export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId || undefined);`);

fs.writeFileSync('src/lib/firebase.ts', content, 'utf-8');
console.log('Firebase config updated');
