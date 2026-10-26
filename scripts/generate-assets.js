import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');

// 1. Generate standard pwa-512x512.png from public/icon.svg
const iconSvg = fs.readFileSync(path.join(publicDir, 'icon.svg'));

async function generateAssets() {
  console.log('Generating PWA and OpenGraph image assets...');

  // 192x192 PNG
  await sharp(iconSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 512x512 PNG
  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // apple-touch-icon.png (180x180)
  await sharp(iconSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // favicon.ico (as a 48x48 PNG renamed or packaged, browsers handle PNG format with .ico or 32x32)
  await sharp(iconSvg)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Created favicon.ico');

  // Maskable icon: 512x512 with safe-zone margin (15% all around)
  const maskableSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <rect width="512" height="512" fill="#1C3317"/>
    <!-- Nested icon within 75% safe area -->
    <g transform="translate(64, 64) scale(0.75)">
      <!-- Soil horizon layers -->
      <path d="M0 360 C120 340 200 370 320 350 C420 330 480 345 512 340 L512 512 L0 512 Z" fill="#3D2817" opacity="0.95"/>
      <path d="M0 420 C140 400 240 430 360 410 C440 395 490 410 512 405 L512 512 L0 512 Z" fill="#24160B"/>
      
      <!-- Root network -->
      <path d="M256 260 L256 340 M256 340 L210 390 M256 340 L302 390 M210 390 L170 430 M302 390 L342 430" stroke="#84CC16" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
      <circle cx="210" cy="390" r="7" fill="#FACC15"/>
      <circle cx="302" cy="390" r="7" fill="#FACC15"/>
      <circle cx="170" cy="430" r="6" fill="#FACC15"/>
      <circle cx="342" cy="430" r="6" fill="#FACC15"/>
      
      <!-- Scanner ring -->
      <circle cx="256" cy="220" r="95" stroke="#E6D5B8" stroke-width="6" stroke-dasharray="12 8" opacity="0.6"/>
      <circle cx="256" cy="220" r="80" fill="#2D4A22" stroke="#4ADE80" stroke-width="4"/>
      
      <!-- Leaf -->
      <path d="M256 160 C290 180 305 210 300 240 C280 260 250 255 240 240 C235 220 245 190 256 160 Z" fill="#4ADE80"/>
      <path d="M256 160 C230 185 220 215 225 242 C240 258 265 250 256 160 Z" fill="#22C55E"/>
      <path d="M256 175 L256 250" stroke="#14532D" stroke-width="3" stroke-linecap="round"/>
      
      <!-- Crosshairs -->
      <path d="M190 220 L210 220 M302 220 L322 220 M256 154 L256 174 M256 266 L256 286" stroke="#FACC15" stroke-width="4" stroke-linecap="round"/>
    </g>
  </svg>`;

  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // OpenGraph Image (1200x630)
  const ogSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#142611" />
        <stop offset="50%" stop-color="#1E3A1A" />
        <stop offset="100%" stop-color="#0B1809" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#F59E0B" />
        <stop offset="100%" stop-color="#FCD34D" />
      </linearGradient>
      <linearGradient id="soilLayer1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#4A2F1B" />
        <stop offset="100%" stop-color="#3D2817" />
      </linearGradient>
      <linearGradient id="soilLayer2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#2D1B0F" />
        <stop offset="100%" stop-color="#1F1108" />
      </linearGradient>
    </defs>

    <!-- Deep green background -->
    <rect width="1200" height="630" fill="url(#bgGrad)" />

    <!-- Subtle topographic line contours -->
    <path d="M-100 200 C300 150 600 280 1300 180" stroke="#2D4A22" stroke-width="2" fill="none" opacity="0.4"/>
    <path d="M-100 280 C250 240 700 340 1300 260" stroke="#2D4A22" stroke-width="2" fill="none" opacity="0.3"/>
    <path d="M-100 360 C400 320 800 420 1300 340" stroke="#2D4A22" stroke-width="2" fill="none" opacity="0.25"/>

    <!-- Bottom Soil Layers -->
    <path d="M0 480 Q300 450 600 480 T1200 470 L1200 630 L0 630 Z" fill="url(#soilLayer1)" opacity="0.9" />
    <path d="M0 550 Q400 520 800 550 T1200 540 L1200 630 L0 630 Z" fill="url(#soilLayer2)" />

    <!-- Left Content Box -->
    <g transform="translate(90, 80)">
      <!-- Kenya Badge -->
      <rect x="0" y="0" width="170" height="34" rx="17" fill="#2D4A22" stroke="#4ADE80" stroke-width="1.5" />
      <text x="85" y="22" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#86EFAC" text-anchor="middle" letter-spacing="1.5">KENYA EDITION</text>

      <!-- App Title -->
      <g transform="translate(0, 80)">
        <text x="0" y="0" font-family="Arial, sans-serif" font-size="68" font-weight="900" fill="#FFFFFF" letter-spacing="-1">
          Shamba<tspan fill="#4ADE80">Soil</tspan>
        </text>
      </g>

      <!-- Tagline -->
      <text x="0" y="145" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#FCD34D" letter-spacing="-0.5">
        Your Soil. Your Crop. Your Decision.
      </text>

      <!-- Subtitle description -->
      <text x="0" y="195" font-family="Arial, sans-serif" font-size="19" fill="#E2E8F0" opacity="0.9">
        Mobile-first agricultural intelligence for smallholders &amp; farmers across Kenya.
      </text>
      <text x="0" y="225" font-family="Arial, sans-serif" font-size="19" fill="#CBD5E1" opacity="0.8">
        Visual soil assessment, KALRO &amp; FAO agronomic guidance, and county-specific crops.
      </text>

      <!-- Feature Badges -->
      <g transform="translate(0, 275)">
        <!-- Pill 1 -->
        <rect x="0" y="0" width="160" height="38" rx="10" fill="#1C3317" stroke="#375230" stroke-width="1.5"/>
        <text x="80" y="24" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#A7F3D0" text-anchor="middle">🌱 47 Counties</text>

        <!-- Pill 2 -->
        <rect x="175" y="0" width="180" height="38" rx="10" fill="#1C3317" stroke="#375230" stroke-width="1.5"/>
        <text x="265" y="24" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#A7F3D0" text-anchor="middle">📸 Visual Soil AI</text>

        <!-- Pill 3 -->
        <rect x="370" y="0" width="185" height="38" rx="10" fill="#1C3317" stroke="#375230" stroke-width="1.5"/>
        <text x="462" y="24" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#A7F3D0" text-anchor="middle">🧪 Lab Test Sync</text>

        <!-- Pill 4 -->
        <rect x="570" y="0" width="185" height="38" rx="10" fill="#1C3317" stroke="#375230" stroke-width="1.5"/>
        <text x="662" y="24" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#FDE68A" text-anchor="middle">⚡ Works Offline</text>
      </g>
    </g>

    <!-- Right Side Stylized App Emblem -->
    <g transform="translate(860, 100)">
      <circle cx="160" cy="160" r="140" fill="#182E14" stroke="#2D4A22" stroke-width="4"/>
      <circle cx="160" cy="160" r="110" stroke="#4ADE80" stroke-width="3" stroke-dasharray="14 8" opacity="0.7"/>

      <!-- Stylized sprout & roots -->
      <path d="M160 80 C195 105 210 140 205 175 C185 195 150 190 140 175 C135 150 148 115 160 80 Z" fill="#4ADE80"/>
      <path d="M160 80 C130 110 120 145 125 178 C145 195 170 188 160 80 Z" fill="#22C55E"/>
      <path d="M160 100 L160 210" stroke="#14532D" stroke-width="4" stroke-linecap="round"/>

      <!-- Roots -->
      <path d="M160 210 L160 250 M160 230 L120 270 M160 230 L200 270 M120 270 L90 295 M200 270 L230 295" stroke="#84CC16" stroke-width="5" stroke-linecap="round"/>
      <circle cx="120" cy="270" r="6" fill="#FACC15"/>
      <circle cx="200" cy="270" r="6" fill="#FACC15"/>
      <circle cx="90" cy="295" r="5" fill="#FACC15"/>
      <circle cx="230" cy="295" r="5" fill="#FACC15"/>

      <!-- Crosshairs -->
      <path d="M90 160 L110 160 M210 160 L230 160 M160 90 L160 110 M160 210 L160 230" stroke="#FACC15" stroke-width="3.5" stroke-linecap="round"/>
    </g>
  </svg>`;

  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('Created og-image.png');

  console.log('All image assets successfully generated!');
}

generateAssets().catch(err => {
  console.error('Asset generation failed:', err);
  process.exit(1);
});
