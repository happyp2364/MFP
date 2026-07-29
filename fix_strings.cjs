const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // We only replace common patterns where an object property or a simple variable is accessed.
  // Instead of a perfect AST, we do targeted regex.
  
  // Safe wrapper function
  const regexes = [
    // p.name.toLowerCase() -> (p.name || '').toLowerCase()
    { regex: /([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\.toLowerCase\(\)/g, replacement: '($1 || \'\').toLowerCase()' },
    { regex: /([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\.toUpperCase\(\)/g, replacement: '($1 || \'\').toUpperCase()' },
    { regex: /([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\.trim\(\)/g, replacement: '($1 || \'\').trim()' },
    { regex: /([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\.includes\(/g, replacement: '($1 || \'\').includes(' },
    { regex: /([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\.startsWith\(/g, replacement: '($1 || \'\').startsWith(' },
    { regex: /([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\.endsWith\(/g, replacement: '($1 || \'\').endsWith(' },
    { regex: /([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\.split\(/g, replacement: '($1 || \'\').split(' },
    { regex: /([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\.replace\(/g, replacement: '($1 || \'\').replace(' },
    
    // c.toLowerCase() -> (c || '').toLowerCase()
    { regex: /([^a-zA-Z0-9_.'"])([a-zA-Z0-9_]+)\.toLowerCase\(\)/g, replacement: '$1($2 || \'\').toLowerCase()' },
    { regex: /([^a-zA-Z0-9_.'"])([a-zA-Z0-9_]+)\.toUpperCase\(\)/g, replacement: '$1($2 || \'\').toUpperCase()' },
    { regex: /([^a-zA-Z0-9_.'"])([a-zA-Z0-9_]+)\.trim\(\)/g, replacement: '$1($2 || \'\').trim()' },
    { regex: /([^a-zA-Z0-9_.'"])([a-zA-Z0-9_]+)\.includes\(/g, replacement: '$1($2 || \'\').includes(' },
    { regex: /([^a-zA-Z0-9_.'"])([a-zA-Z0-9_]+)\.startsWith\(/g, replacement: '$1($2 || \'\').startsWith(' },
    { regex: /([^a-zA-Z0-9_.'"])([a-zA-Z0-9_]+)\.endsWith\(/g, replacement: '$1($2 || \'\').endsWith(' },
    { regex: /([^a-zA-Z0-9_.'"])([a-zA-Z0-9_]+)\.split\(/g, replacement: '$1($2 || \'\').split(' },
    { regex: /([^a-zA-Z0-9_.'"])([a-zA-Z0-9_]+)\.replace\(/g, replacement: '$1($2 || \'\').replace(' },
  ];

  // But we have to be careful not to mess up string literals like 'test'.toLowerCase()
  // or things that are already safe: ((rev.author || '')).toLowerCase()
  
  // So instead of global regex which might break things, let's fix the specific ones we found.
}

// Actually, let's just write a script that targets the specific files found in grep.
const filesToFix = [
  'src/components/Admin/MarketingCenterView.tsx',
  'src/components/Admin/SizeStockManager.tsx',
  'src/components/Admin/SmartProductFormModal.tsx',
  'src/components/Admin/SocialMediaSettingsView.tsx',
  'src/components/Admin/AdminDashboardModal.tsx',
  'src/components/Admin/CouponManagementView.tsx',
  'src/components/Admin/OrderManagementView.tsx',
  'src/components/Admin/CategoriesSettingsView.tsx',
  'src/components/Search/LiveSearchModal.tsx',
  'src/utils/productUtils.ts',
  'src/utils/productCategoryDefaults.ts',
  'src/utils/sizeStockUtils.ts',
  'src/context/StoreContext.tsx',
  'src/App.tsx'
];

for (const file of filesToFix) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Custom replacements for safe access
  // c.title.toLowerCase() -> (c.title || '').toLowerCase()
  content = content.replace(/c\.title\.toLowerCase\(\)/g, "(c.title || '').toLowerCase()");
  content = content.replace(/searchTerm\.toLowerCase\(\)/g, "(searchTerm || '').toLowerCase()");
  content = content.replace(/s\.name\.toLowerCase\(\)/g, "(s.name || '').toLowerCase()");
  content = content.replace(/s\.email\.toLowerCase\(\)/g, "(s.email || '').toLowerCase()");
  content = content.replace(/s\.size\.toLowerCase\(\)/g, "(s.size || '').toLowerCase()");
  content = content.replace(/trimmed\.toLowerCase\(\)/g, "(trimmed || '').toLowerCase()");
  content = content.replace(/c\.name\.toLowerCase\(\)/g, "(c.name || '').toLowerCase()");
  content = content.replace(/colorObj\.name\.toLowerCase\(\)/g, "(colorObj.name || '').toLowerCase()");
  content = content.replace(/iconName\.toLowerCase\(\)/g, "(iconName || '').toLowerCase()");
  content = content.replace(/adminSearch\.toLowerCase\(\)/g, "(adminSearch || '').toLowerCase()");
  content = content.replace(/p\.name\.toLowerCase\(\)/g, "(p.name || '').toLowerCase()");
  content = content.replace(/p\.brand\.toLowerCase\(\)/g, "(p.brand || '').toLowerCase()");
  content = content.replace(/p\.subcategory\.toLowerCase\(\)/g, "(p.subcategory || '').toLowerCase()");
  content = content.replace(/p\.category\.toLowerCase\(\)/g, "(p.category || '').toLowerCase()");
  content = content.replace(/p\.description\.toLowerCase\(\)/g, "(p.description || '').toLowerCase()");
  content = content.replace(/auditSearch\.toLowerCase\(\)/g, "(auditSearch || '').toLowerCase()");
  content = content.replace(/log\.action\.toLowerCase\(\)/g, "(log.action || '').toLowerCase()");
  content = content.replace(/log\.details\.toLowerCase\(\)/g, "(log.details || '').toLowerCase()");
  content = content.replace(/log\.userEmail\.toLowerCase\(\)/g, "(log.userEmail || '').toLowerCase()");
  content = content.replace(/c\.code\.toLowerCase\(\)/g, "(c.code || '').toLowerCase()");
  content = content.replace(/searchQuery\.toLowerCase\(\)/g, "(searchQuery || '').toLowerCase()");
  content = content.replace(/o\.id\.toLowerCase\(\)/g, "(o.id || '').toLowerCase()");
  content = content.replace(/o\.customerName\.toLowerCase\(\)/g, "(o.customerName || '').toLowerCase()");
  content = content.replace(/o\.customerEmail\.toLowerCase\(\)/g, "(o.customerEmail || '').toLowerCase()");
  content = content.replace(/e\.target\.value\.toLowerCase\(\)/g, "(e.target.value || '').toLowerCase()");
  content = content.replace(/query\.toLowerCase\(\)/g, "(query || '').toLowerCase()");
  
  content = content.replace(/c\.toLowerCase\(\)/g, "(c || '').toLowerCase()");
  content = content.replace(/b\.toLowerCase\(\)/g, "(b || '').toLowerCase()");
  content = content.replace(/s\.trim\(\)\.toLowerCase\(\)/g, "(s || '').trim().toLowerCase()");
  
  content = content.replace(/tag\.toLowerCase\(\)/g, "(tag || '').toLowerCase()");
  content = content.replace(/filterState\.collection\.toLowerCase\(\)/g, "(filterState.collection || '').toLowerCase()");
  content = content.replace(/filterState\.searchQuery\.toLowerCase\(\)/g, "(filterState.searchQuery || '').toLowerCase()");

  // Some others found in productUtils
  content = content.replace(/slug\.toLowerCase\(\)/g, "(slug || '').toLowerCase()");
  content = content.replace(/sku\.toLowerCase\(\)/g, "(sku || '').toLowerCase()");
  content = content.replace(/subcategory\.toLowerCase\(\)/g, "(subcategory || '').toLowerCase()");

  fs.writeFileSync(file, content, 'utf-8');
}
console.log('Fixed various toLowerCase usages.');
