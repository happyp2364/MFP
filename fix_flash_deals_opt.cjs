const fs = require('fs');
let content = fs.readFileSync('src/components/Promo/FlashDealSection.tsx', 'utf-8');

const oldFilter = `  const activeDeals = flashDeals.filter(d => {`;
const newFilter = `  const activeDeals = !flashDealConfig?.masterEnabled ? [] : flashDeals.filter(d => {`;

content = content.replace(oldFilter, newFilter);

fs.writeFileSync('src/components/Promo/FlashDealSection.tsx', content, 'utf-8');
console.log('Fixed FlashDealRenderer opt');
