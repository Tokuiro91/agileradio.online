// scripts/generate-icons.js
// Run once: node scripts/generate-icons.js
// Resizes favicon.png into all required PWA icon sizes

const sharp = require("sharp")
const path = require("path")
const fs = require("fs")

const src = path.join(__dirname, "../public/favicon.png")
const dest = path.join(__dirname, "../public/icons")

if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })

const sizes = [
    { name: "icon-192.png", size: 192, bg: "#0a0a0a" },
    { name: "icon-512.png", size: 512, bg: "#0a0a0a" },
    { name: "icon-512-maskable.png", size: 512, bg: "#0a0a0a", pad: 0.15 },  // safe area for maskable
    { name: "apple-touch-icon-180.png", size: 180, bg: "#0a0a0a" },
    { name: "apple-touch-icon-152.png", size: 152, bg: "#0a0a0a" },
    { name: "apple-touch-icon-120.png", size: 120, bg: "#0a0a0a" },
    { name: "apple-touch-icon-76.png", size: 76, bg: "#0a0a0a" },
]

async function run() {
    for (const { name, size, bg, pad = 0 } of sizes) {
        const inner = Math.round(size * (1 - pad * 2))
        const offset = Math.round(size * pad)

        await sharp(src)
            .resize(inner, inner, { fit: "contain", background: bg })
            .flatten({ background: bg })
            .extend({
                top: offset, bottom: offset, left: offset, right: offset,
                background: bg,
            })
            .png()
            .toFile(path.join(dest, name))

        console.log(`✓ ${name} (${size}×${size})`)
    }
    console.log("Done! All icons generated in public/icons/")
}

run().catch(console.error)
