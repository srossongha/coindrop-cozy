import sharp from 'sharp'

const sourceIcon = 'public/logo-mark.png'
const bgDark = { r: 11, g: 18, b: 32, alpha: 1 } // #0b1220

async function generate() {
  console.log('Generating PWA icons from', sourceIcon)

  // 1. pwa-192x192.png (standard transparent / high quality)
  await sharp(sourceIcon)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('public/pwa-192x192.png')
  console.log('Generated public/pwa-192x192.png')

  // 2. pwa-512x512.png (standard transparent)
  await sharp(sourceIcon)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('public/pwa-512x512.png')
  console.log('Generated public/pwa-512x512.png')

  // 3. maskable-icon-512x512.png (with safe padding & dark background #0b1220)
  // Safe zone for maskable icon is the inner 80% circle (radius 40% of size)
  // We scale the inner graphic to ~370x370 inside 512x512 to ensure full safe area coverage
  const innerSize = 370
  const innerBuffer = await sharp(sourceIcon)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()

  const offset = Math.round((512 - innerSize) / 2)

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: bgDark,
    },
  })
    .composite([{ input: innerBuffer, top: offset, left: offset }])
    .png()
    .toFile('public/maskable-icon-512x512.png')
  console.log('Generated public/maskable-icon-512x512.png')

  // 4. apple-touch-icon.png (180x180, iOS native with #0b1220 background)
  // iOS Safari turns transparent pixels black, so solid background with ~140px icon looks best
  const appleInnerSize = 140
  const appleInnerBuffer = await sharp(sourceIcon)
    .resize(appleInnerSize, appleInnerSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer()

  const appleOffset = Math.round((180 - appleInnerSize) / 2)

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: bgDark,
    },
  })
    .composite([{ input: appleInnerBuffer, top: appleOffset, left: appleOffset }])
    .png()
    .toFile('public/apple-touch-icon.png')
  console.log('Generated public/apple-touch-icon.png')
}

generate().catch(err => {
  console.error('Error generating icons:', err)
  process.exit(1)
})
