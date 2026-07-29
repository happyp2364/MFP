const fs = require('fs');
let content = fs.readFileSync('src/components/Promo/FlashDealSection.tsx', 'utf-8');

// Fix FlashDealRenderer
const oldRendererStart = `  const [timers, setTimers] = useState<Record<string, string>>({});
  
  if (!flashDealConfig?.masterEnabled) return null;`;

const newRendererStart = `  const [timers, setTimers] = useState<Record<string, string>>({});`;

content = content.replace(oldRendererStart, newRendererStart);

const oldRendererReturn = `  if (activeDeals.length === 0) return null;`;
const newRendererReturn = `  if (!flashDealConfig?.masterEnabled || activeDeals.length === 0) return null;`;
content = content.replace(oldRendererReturn, newRendererReturn);

fs.writeFileSync('src/components/Promo/FlashDealSection.tsx', content, 'utf-8');
console.log('Fixed FlashDealRenderer');
