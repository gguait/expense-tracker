const sharp = require('sharp');
const fs = require('fs');

// Crear directorio public si no existe
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Crear un SVG simple con el emoji de dinero
const svgIcon = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#grad)"/>
  <text x="256" y="380" font-size="280" text-anchor="middle" fill="white">💰</text>
</svg>
`;

// Guardar SVG
fs.writeFileSync('public/icon.svg', svgIcon);
console.log('✅ SVG creado: public/icon.svg');

// Generar PNG de diferentes tamaños
const sizes = [192, 512];

async function generateIcons() {
  for (const size of sizes) {
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(`public/pwa-${size}x${size}.png`);
    console.log(`✅ Icono creado: public/pwa-${size}x${size}.png`);
  }

  // Crear favicon
  await sharp(Buffer.from(svgIcon))
    .resize(32, 32)
    .png()
    .toFile('public/favicon.ico');
  console.log('✅ Favicon creado: public/favicon.ico');

  // Crear apple-touch-icon
  await sharp(Buffer.from(svgIcon))
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('✅ Apple touch icon creado: public/apple-touch-icon.png');

  console.log('\n🎉 ¡Todos los iconos generados correctamente!');
}

generateIcons().catch(console.error);