const fs = require('fs');

const filesToFix = [
  'src/components/Admin/MarketingCenterView.tsx',
  'src/components/Admin/CouponManagementView.tsx',
  'src/components/Checkout/CheckoutModal.tsx',
  'src/components/Customer/CustomerAccountModal.tsx',
  'src/components/Promo/FlashDealSection.tsx'
];

for (const file of filesToFix) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/campaignCategory\.replace/g, "(campaignCategory || '').replace");
    content = content.replace(/s\.name\.replace/g, "(s.name || '').replace");
    content = content.replace(/campaign\.category\.replace/g, "(campaign.category || '').replace");
    content = content.replace(/c\.type\.replace/g, "(c.type || '').replace");
    content = content.replace(/res\.orderId\.replace/g, "(res.orderId || '').replace");
    content = content.replace(/order\.orderStatus\.replace/g, "(order.orderStatus || '').replace");
    content = content.replace(/msg\.replace/g, "(msg || '').replace");
    content = content.replace(/scarcityMessage\.replace/g, "(scarcityMessage || '').replace");
    fs.writeFileSync(file, content, 'utf-8');
  }
}

console.log('Fixed replace calls.');
