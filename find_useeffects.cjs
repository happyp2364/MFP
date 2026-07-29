const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const matches = content.matchAll(/useEffect\(\s*\(\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*(\[[\s\S]*?\])?\s*\)/g);
    for (const match of matches) {
      const body = match[1];
      const deps = match[2];
      if (body.includes('set') || body.includes('dispatch') || body.includes('update')) {
        console.log(`\n\n--- ${filePath} ---`);
        console.log(`Dependencies: ${deps}`);
        console.log(`Body:\n${body.substring(0, 500)}`);
      }
    }
  }
});
