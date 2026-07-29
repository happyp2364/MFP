const fs = require('fs');

const file = 'src/utils/autoContrastEngine.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'const bg = computed.backgroundColor;',
  `const bgImage = computed.backgroundImage;
    if (bgImage && bgImage.includes('gradient')) {
      const parsedBgImg = parseColor(bgImage);
      if (parsedBgImg && parsedBgImg.a > 0.3) {
        return parsedBgImg;
      }
    }
    const bg = computed.backgroundColor;`
);

fs.writeFileSync(file, code);
console.log('Fixed gradient detection');
