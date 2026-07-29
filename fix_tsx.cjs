const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

if (pkg.devDependencies && pkg.devDependencies['tsx']) {
  pkg.dependencies['tsx'] = pkg.devDependencies['tsx'];
  delete pkg.devDependencies['tsx'];
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2), 'utf-8');
console.log('Fixed tsx');
