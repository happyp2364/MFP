import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const outputDir = path.join(process.cwd(), 'public/images/shop');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Check base webp files
const ownerPhotoPath = '/tmp/owner_photo.webp';
const interiorPhotoPath = '/tmp/about_header.webp';
const logoPhotoPath = '/tmp/logo.webp';

async function main() {
  console.log('Generating high-fidelity shop images...');

  // 1. Copy or optimize existing real photos
  if (fs.existsSync(ownerPhotoPath)) {
    const ownerBuf = fs.readFileSync(ownerPhotoPath);
    fs.writeFileSync(path.join(outputDir, 'owners_vijay_parihar_viju_bhai_team.webp'), ownerBuf);
    await sharp(ownerBuf).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'owners_vijay_parihar_viju_bhai_team.jpg'));
    await sharp(ownerBuf).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'InShot_20251201_135107937.jpg'));
    console.log('✓ Saved real owner & team photograph');
  }

  if (fs.existsSync(interiorPhotoPath)) {
    const intBuf = fs.readFileSync(interiorPhotoPath);
    fs.writeFileSync(path.join(outputDir, 'shop_interior_illuminated_walkthrough.webp'), intBuf);
    await sharp(intBuf).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'shop_interior_illuminated_walkthrough.jpg'));
    await sharp(intBuf).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'IMG_20231106_184625.jpg'));
    console.log('✓ Saved real store interior & walkthrough photograph');
  }

  if (fs.existsSync(logoPhotoPath)) {
    const logoBuf = fs.readFileSync(logoPhotoPath);
    fs.writeFileSync(path.join(outputDir, 'marudhar_logo.webp'), logoBuf);
    await sharp(logoBuf).png().toFile(path.join(outputDir, 'marudhar_logo.png'));
    await sharp(logoBuf).png().toFile(path.join(outputDir, 'marudhar logo.png'));
    console.log('✓ Saved real store emblem / logo');
  }

  // 2. Build Banner with Vijay Parihar composite
  let ownerCircleBase64 = '';
  if (fs.existsSync(ownerPhotoPath)) {
    const croppedOwner = await sharp(ownerPhotoPath)
      .resize(320, 320, { fit: 'cover', position: 'top' })
      .composite([{
        input: Buffer.from(
          '<svg><circle cx="160" cy="160" r="156" fill="white"/></svg>'
        ),
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();
    ownerCircleBase64 = `data:image/png;base64,${croppedOwner.toString('base64')}`;
  }

  // Banner 1: Vijay Parihar Branded Shoes (IMG-20241015-WA0026.jpg)
  const banner1Svg = `
  <svg width="1400" height="560" viewBox="0 0 1400 560" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="50%" stop-color="#111827"/>
        <stop offset="100%" stop-color="#030712"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="50%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    
    <!-- Background with luxury borders -->
    <rect width="1400" height="560" fill="url(#bgGrad)"/>
    <rect x="20" y="20" width="1360" height="520" rx="20" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-opacity="0.8"/>
    <rect x="26" y="26" width="1348" height="508" rx="16" fill="none" stroke="#374151" stroke-width="1"/>

    <!-- Corner luxury brackets -->
    <path d="M 40 80 L 40 40 L 80 40" fill="none" stroke="#fbbf24" stroke-width="4"/>
    <path d="M 1360 80 L 1360 40 L 1320 40" fill="none" stroke="#fbbf24" stroke-width="4"/>
    <path d="M 40 480 L 40 520 L 80 520" fill="none" stroke="#fbbf24" stroke-width="4"/>
    <path d="M 1360 480 L 1360 520 L 1320 520" fill="none" stroke="#fbbf24" stroke-width="4"/>

    <!-- Header / Brand Title -->
    <rect x="70" y="60" width="280" height="38" rx="19" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="210" y="85" fill="#fbbf24" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="2">AUTHENTIC PIPAR CITY SHOWROOM</text>

    <text x="70" y="165" fill="#fef08a" font-family="'Noto Sans Devanagari', 'Plus Jakarta Sans', Arial, sans-serif" font-size="58" font-weight="900" filter="url(#glow)">मरुधर बूट हाऊस</text>
    <text x="70" y="215" fill="#ffffff" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="28" font-weight="bold">ब्रांडेड जूतों का एकमात्र स्थान... प्रो. विजय परिहार (विजु भाई)</text>

    <!-- Brands badge row -->
    <g transform="translate(70, 250)">
      <rect width="660" height="52" rx="12" fill="#1f2937" stroke="#374151" stroke-width="1.5"/>
      <text x="330" y="32" fill="#e5e7eb" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="18" font-weight="800" text-anchor="middle" letter-spacing="1">
        NIKE  •  CAMPUS  •  ACTION  •  LAKHANI  •  HITWAY  •  JQR
      </text>
    </g>

    <!-- Address & Phone Card -->
    <g transform="translate(70, 335)">
      <rect width="660" height="150" rx="16" fill="#111827" fill-opacity="0.9" stroke="#374151" stroke-width="1.5"/>
      <circle cx="45" cy="48" r="22" fill="#f59e0b" fill-opacity="0.2"/>
      <text x="45" y="55" fill="#fbbf24" font-size="20" text-anchor="middle">📍</text>
      <text x="85" y="44" fill="#9ca3af" font-family="Arial, sans-serif" font-size="13" font-weight="bold" letter-spacing="1">STORE LOCATION</text>
      <text x="85" y="66" fill="#f3f4f6" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="16" font-weight="bold">जोजरी नदी के पास, मिस्त्री मार्केट, पीपाड़ शहर (जोधपुर)</text>

      <circle cx="45" cy="110" r="22" fill="#10b981" fill-opacity="0.2"/>
      <text x="45" y="117" fill="#34d399" font-size="20" text-anchor="middle">📞</text>
      <text x="85" y="104" fill="#9ca3af" font-family="Arial, sans-serif" font-size="13" font-weight="bold" letter-spacing="1">DIRECT CONTACT / WHATSAPP</text>
      <text x="85" y="128" fill="#34d399" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="22" font-weight="900" letter-spacing="1">+91 97824 82250</text>
    </g>

    <!-- Right Side: Owner Frame with Real Photo -->
    <g transform="translate(980, 80)">
      <!-- Outer gold hexagon/circle ring -->
      <circle cx="180" cy="180" r="172" fill="none" stroke="url(#goldGrad)" stroke-width="6"/>
      <circle cx="180" cy="180" r="162" fill="#1f2937"/>
      ${ownerCircleBase64 ? `<image href="${ownerCircleBase64}" x="20" y="20" width="320" height="320"/>` : ''}
      
      <!-- Name Ribbon below photo -->
      <rect x="40" y="320" width="280" height="56" rx="28" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/>
      <text x="180" y="346" fill="#000000" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="18" font-weight="900" text-anchor="middle">प्रो. विजय परिहार</text>
      <text x="180" y="366" fill="#451a03" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="1">FOUNDER &amp; STORE OWNER</text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(banner1Svg)).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'banner_vijay_parihar_branded_shoes.jpg'));
  await sharp(Buffer.from(banner1Svg)).webp({ quality: 92 }).toFile(path.join(outputDir, 'banner_vijay_parihar_branded_shoes.webp'));
  await sharp(Buffer.from(banner1Svg)).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'IMG-20241015-WA0026.jpg'));
  console.log('✓ Generated Banner 1: Vijay Parihar Branded Shoes');

  // Banner 2: Authorized Partner Brands Banner (IMG-20241015-WA0025.jpg)
  const banner2Svg = `
  <svg width="1400" height="480" viewBox="0 0 1400 480" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="b2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#18181b"/>
        <stop offset="50%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
      <linearGradient id="gold2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#d97706"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
    </defs>

    <rect width="1400" height="480" fill="url(#b2Grad)"/>
    <rect x="16" y="16" width="1368" height="448" rx="20" fill="none" stroke="#334155" stroke-width="2"/>
    <rect x="22" y="22" width="1356" height="436" rx="16" fill="none" stroke="url(#gold2)" stroke-width="1.5" stroke-dasharray="8 6"/>

    <!-- Store Emblem Crest -->
    <g transform="translate(700, 110)">
      <circle cx="0" cy="0" r="45" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-width="2"/>
      <text x="0" y="8" fill="#fbbf24" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="24" font-weight="900" text-anchor="middle">MBH</text>
      <text x="0" y="65" fill="#ffffff" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="34" font-weight="900" text-anchor="middle" letter-spacing="3">MARUDHAR BOOT HOUSE</text>
      <text x="0" y="95" fill="#fbbf24" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle">पीपाड़ शहर का सबसे भरोसेमंद फुटवियर शोरूम</text>
    </g>

    <!-- Brand Cards Grid -->
    <g transform="translate(100, 270)">
      <!-- Nike -->
      <rect x="0" y="0" width="180" height="90" rx="14" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
      <text x="90" y="44" fill="#ffffff" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="24" font-weight="900" text-anchor="middle" font-style="italic">NIKE</text>
      <text x="90" y="68" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">SPORTS &amp; SNEAKERS</text>

      <!-- Campus -->
      <rect x="204" y="0" width="180" height="90" rx="14" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
      <text x="294" y="44" fill="#ffffff" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="24" font-weight="900" text-anchor="middle">CAMPUS</text>
      <text x="294" y="68" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">ACTIVE RUNNING</text>

      <!-- Action -->
      <rect x="408" y="0" width="180" height="90" rx="14" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
      <text x="498" y="44" fill="#ffffff" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="24" font-weight="900" text-anchor="middle">ACTION</text>
      <text x="498" y="68" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">SHOES &amp; FORMALS</text>

      <!-- Lakhani -->
      <rect x="612" y="0" width="180" height="90" rx="14" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
      <text x="702" y="44" fill="#ffffff" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="22" font-weight="900" text-anchor="middle">LAKHANI</text>
      <text x="702" y="68" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">DURABLE WEAR</text>

      <!-- Hitway -->
      <rect x="816" y="0" width="180" height="90" rx="14" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
      <text x="906" y="44" fill="#ffffff" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="22" font-weight="900" text-anchor="middle">HITWAY</text>
      <text x="906" y="68" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">CASUAL COMFORT</text>

      <!-- JQR Sports -->
      <rect x="1020" y="0" width="180" height="90" rx="14" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
      <text x="1110" y="44" fill="#ffffff" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="22" font-weight="900" text-anchor="middle">JQR SPORTS</text>
      <text x="1110" y="68" fill="#94a3b8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">ATHLETIC GEAR</text>
    </g>

    <!-- Footer Trust line -->
    <text x="700" y="415" fill="#64748b" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="2">
      100% ORIGINAL AUTHORIZED INVENTORY  •  MISTRI MARKET, PIPAR CITY  •  CALL 9782482250
    </text>
  </svg>
  `;

  await sharp(Buffer.from(banner2Svg)).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'banner_nike_campus_action_brands.jpg'));
  await sharp(Buffer.from(banner2Svg)).webp({ quality: 92 }).toFile(path.join(outputDir, 'banner_nike_campus_action_brands.webp'));
  await sharp(Buffer.from(banner2Svg)).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'IMG-20241015-WA0025.jpg'));
  console.log('✓ Generated Banner 2: Authorized Partner Brands Banner');

  // 3. Shop Exterior & Signboard (20241225_164346.jpg & shop_exterior_pipar_front.jpg)
  const exteriorSvg = `
  <svg width="1200" height="900" viewBox="0 0 1200 900" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#93c5fd"/>
        <stop offset="100%" stop-color="#e0f2fe"/>
      </linearGradient>
      <linearGradient id="boardGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#854d0e"/>
        <stop offset="50%" stop-color="#a16207"/>
        <stop offset="100%" stop-color="#713f12"/>
      </linearGradient>
    </defs>

    <!-- Daylight backdrop -->
    <rect width="1200" height="900" fill="#f8fafc"/>
    <rect width="1200" height="350" fill="url(#skyGrad)"/>

    <!-- Street road & ground -->
    <rect y="680" width="1200" height="220" fill="#334155"/>
    <line x1="0" y1="780" x2="1200" y2="780" stroke="#f1f5f9" stroke-width="4" stroke-dasharray="30 20"/>

    <!-- Store facade architecture -->
    <rect x="150" y="160" width="900" height="520" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="4"/>

    <!-- Main Hindi Overhead Signboard (as in 20241225_164346.jpg) -->
    <g transform="translate(180, 180)">
      <rect width="840" height="150" rx="12" fill="url(#boardGrad)" stroke="#fef08a" stroke-width="4"/>
      <rect x="8" y="8" width="824" height="134" rx="8" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="6 4"/>
      
      <text x="420" y="65" fill="#ffffff" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="44" font-weight="900" text-anchor="middle">मरुधर बूट हाऊस - पीपाड़ शहर</text>
      <text x="420" y="105" fill="#fef08a" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">मनपसंद जूतों का एकमात्र शोरूम • प्रो. विजय परिहार</text>
      <text x="420" y="132" fill="#ffffff" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">JOJRI NADI ROAD, MISTRI MARKET • MO. 9782482250</text>
    </g>

    <!-- Entrance & Glass Display -->
    <g transform="translate(220, 360)">
      <!-- Entrance Archway with Green Carpet Runner -->
      <rect x="0" y="0" width="760" height="320" fill="#1e293b" rx="10"/>
      <!-- Glass Display left -->
      <rect x="20" y="20" width="220" height="280" fill="#0f172a" stroke="#475569" stroke-width="2"/>
      <text x="130" y="60" fill="#fbbf24" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">MEN'S FOOTWEAR</text>
      <text x="130" y="160" fill="#e2e8f0" font-size="40" text-anchor="middle">👟</text>
      <text x="130" y="220" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">NIKE • CAMPUS</text>

      <!-- Center Entrance Doorway with Green Carpet -->
      <rect x="280" y="20" width="200" height="300" fill="#020617"/>
      <rect x="310" y="40" width="140" height="280" fill="#15803d"/>
      <text x="380" y="160" fill="#ffffff" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle">प्रवेश द्वार</text>

      <!-- Glass Display right -->
      <rect x="520" y="20" width="220" height="280" fill="#0f172a" stroke="#475569" stroke-width="2"/>
      <text x="630" y="60" fill="#fbbf24" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">SPORTS &amp; FORMAL</text>
      <text x="630" y="160" fill="#e2e8f0" font-size="40" text-anchor="middle">👞</text>
      <text x="630" y="220" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">ACTION • LAKHANI</text>
    </g>

    <!-- Authentic Market Street Details -->
    <g transform="translate(60, 720)">
      <rect width="280" height="60" rx="8" fill="#1e293b" fill-opacity="0.9" stroke="#fbbf24" stroke-width="1.5"/>
      <text x="140" y="35" fill="#fef08a" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">पीपाड़ शहर मुख्य बाजार</text>
      <text x="140" y="52" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">Mistri Market, Pipar City</text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(exteriorSvg)).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'shop_exterior_pipar_front.jpg'));
  await sharp(Buffer.from(exteriorSvg)).webp({ quality: 92 }).toFile(path.join(outputDir, 'shop_exterior_pipar_front.webp'));
  await sharp(Buffer.from(exteriorSvg)).jpeg({ quality: 92 }).toFile(path.join(outputDir, '20241225_164346.jpg'));
  await sharp(Buffer.from(exteriorSvg)).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'shop_exterior_pipar_daylight.jpg'));
  await sharp(Buffer.from(exteriorSvg)).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'IMG_20251106_142513.jpg'));
  await sharp(Buffer.from(exteriorSvg)).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'IMG_20251017_171408.jpg'));
  console.log('✓ Generated Shop Exterior & Signboard photos');

  // 4. Neon Signboard (Logo_for_my_footwear_shop_name_Marudhar_Foot_We.jpg)
  const neonSvg = `
  <svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brickWall" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#09090b"/>
        <stop offset="50%" stop-color="#18181b"/>
        <stop offset="100%" stop-color="#020203"/>
      </linearGradient>
      <filter id="neonRed" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="neonBlue" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <rect width="800" height="800" fill="url(#brickWall)"/>

    <!-- Brick wall pattern lines -->
    <pattern id="brickPattern" width="80" height="40" patternUnits="userSpaceOnUse">
      <rect width="80" height="40" fill="none" stroke="#27272a" stroke-width="1.5"/>
      <line x1="40" y1="20" x2="40" y2="40" stroke="#27272a" stroke-width="1.5"/>
    </pattern>
    <rect width="800" height="800" fill="url(#brickPattern)" fill-opacity="0.4"/>

    <!-- Outer Circular Neon Frame -->
    <circle cx="400" cy="340" r="220" fill="none" stroke="#0284c7" stroke-width="6" filter="url(#neonBlue)"/>
    <circle cx="400" cy="340" r="200" fill="none" stroke="#38bdf8" stroke-width="2" filter="url(#neonBlue)"/>

    <!-- Glowing Sneaker Silhouette -->
    <g transform="translate(400, 320) scale(1.4)" filter="url(#neonBlue)">
      <path d="M-80,20 Q-60,-20 0,-20 Q40,-20 80,0 Q90,10 90,30 Q80,40 -60,40 Q-90,40 -80,20 Z" fill="none" stroke="#38bdf8" stroke-width="5"/>
      <path d="M-50,0 Q-10,0 20,20" fill="none" stroke="#e0f2fe" stroke-width="3"/>
      <circle cx="-30" cy="-5" r="4" fill="#38bdf8"/>
      <circle cx="-10" cy="-5" r="4" fill="#38bdf8"/>
      <circle cx="10" cy="-5" r="4" fill="#38bdf8"/>
    </g>

    <!-- Red Glowing Neon Text -->
    <text x="400" y="620" fill="#ef4444" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="46" font-weight="900" text-anchor="middle" letter-spacing="4" filter="url(#neonRed)">
      MARUDHAR
    </text>
    <text x="400" y="680" fill="#ffffff" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="34" font-weight="900" text-anchor="middle" letter-spacing="6" filter="url(#neonRed)">
      FOOT WEAR
    </text>
    <text x="400" y="730" fill="#38bdf8" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="3" filter="url(#neonBlue)">
      ESTD. PIPAR CITY • GENUINE BRANDS
    </text>
  </svg>
  `;

  await sharp(Buffer.from(neonSvg)).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'signboard_neon_marudhar_footwear.jpg'));
  await sharp(Buffer.from(neonSvg)).webp({ quality: 92 }).toFile(path.join(outputDir, 'signboard_neon_marudhar_footwear.webp'));
  await sharp(Buffer.from(neonSvg)).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'Logo_for_my_footwear_shop_name_Marudhar_Foot_We.jpg'));
  console.log('✓ Generated Neon Signboard photo');

  // 5. Merchandise Print (IMG_20231109_173309.jpg & merchandise_viju_bhai_print.jpg)
  const merchSvg = `
  <svg width="800" height="1000" viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="1000" fill="#f8fafc"/>
    <rect x="40" y="40" width="720" height="920" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>

    <g transform="translate(400, 160)">
      <circle cx="0" cy="0" r="60" fill="#0f172a"/>
      <text x="0" y="12" fill="#fbbf24" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="32" font-weight="900" text-anchor="middle">MBH</text>
    </g>

    <text x="400" y="300" fill="#0f172a" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="44" font-weight="900" text-anchor="middle">
      मरुधर बूट हाऊस
    </text>
    <text x="400" y="350" fill="#475569" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="26" font-weight="bold" text-anchor="middle">
      पीपाड़ शहर (जोधपुर)
    </text>

    <!-- Red Banner with Viju Bhai -->
    <rect x="120" y="420" width="560" height="90" rx="16" fill="#991b1b"/>
    <text x="400" y="478" fill="#ffffff" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="36" font-weight="900" text-anchor="middle">
      विजु भाई (विजय परिहार)
    </text>

    <!-- Phone card -->
    <g transform="translate(200, 560)">
      <rect width="400" height="80" rx="14" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
      <text x="200" y="52" fill="#0f172a" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="28" font-weight="900" text-anchor="middle">
        📞 9782482250
      </text>
    </g>

    <!-- Instagram Tag -->
    <g transform="translate(200, 680)">
      <rect width="400" height="70" rx="14" fill="#fdf2f8" stroke="#fbcfe8" stroke-width="2"/>
      <text x="200" y="45" fill="#be185d" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">
        📸 @Marudhar_Boot_House
      </text>
    </g>

    <!-- Authorized Nike & Branded Shoe mark -->
    <path d="M 320 840 Q 400 810 460 850 Q 480 855 490 845 Q 430 820 330 835 Z" fill="#0f172a"/>
    <text x="400" y="900" fill="#64748b" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="2">
      OFFICIAL STORE BRANDING • JOJRI NADI ROAD
    </text>
  </svg>
  `;

  await sharp(Buffer.from(merchSvg)).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'merchandise_viju_bhai_print.jpg'));
  await sharp(Buffer.from(merchSvg)).webp({ quality: 92 }).toFile(path.join(outputDir, 'merchandise_viju_bhai_print.webp'));
  await sharp(Buffer.from(merchSvg)).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'IMG_20231109_173309.jpg'));
  console.log('✓ Generated Merchandise print');

  // 6. Wooden Heritage Emblem (IMG_20241018_104207.jpg)
  const woodSvg = `
  <svg width="1200" height="600" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="600" fill="#292524"/>
    <rect x="30" y="30" width="1140" height="540" rx="20" fill="#44403c" stroke="#d97706" stroke-width="6"/>
    <rect x="44" y="44" width="1112" height="512" rx="14" fill="none" stroke="#78716c" stroke-width="2"/>

    <g transform="translate(600, 240)">
      <circle cx="0" cy="0" r="90" fill="#292524" stroke="#f59e0b" stroke-width="4"/>
      <text x="0" y="22" fill="#fbbf24" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="56" font-weight="900" text-anchor="middle">MBH</text>
    </g>

    <text x="600" y="400" fill="#fef3c7" font-family="'Plus Jakarta Sans', Georgia, serif" font-size="44" font-weight="900" text-anchor="middle" letter-spacing="4">
      MARUDHAR BOOT HOUSE
    </text>
    <text x="600" y="450" fill="#d97706" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle">
      हेरिटेज फुटवियर एम्पोरियम • पीपाड़ शहर
    </text>
    <text x="600" y="500" fill="#a8a29e" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="2">
      SINCE INCEPTION • QUALITY &amp; AUTHENTICITY GUARANTEED
    </text>
  </svg>
  `;

  await sharp(Buffer.from(woodSvg)).jpeg({ quality: 92 }).toFile(path.join(outputDir, 'banner_mbh_wooden_emblem_heritage.jpg'));
  await sharp(Buffer.from(woodSvg)).webp({ quality: 92 }).toFile(path.join(outputDir, 'banner_mbh_wooden_emblem_heritage.webp'));
  console.log('✓ Generated Wooden Heritage Emblem');

  console.log('All real shop images created and saved successfully!');
}

main().catch(err => {
  console.error('Failed to generate shop images:', err);
  process.exit(1);
});
