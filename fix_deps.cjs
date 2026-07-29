const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

if (pkg.devDependencies) {
  for (const dep of ['vite', 'esbuild', 'typescript', '@vitejs/plugin-react', '@tailwindcss/vite', 'tailwindcss']) {
    if (pkg.devDependencies[dep]) {
      pkg.dependencies[dep] = pkg.devDependencies[dep];
      delete pkg.devDependencies[dep];
    }
  }
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2), 'utf-8');
console.log('Fixed dependencies');
