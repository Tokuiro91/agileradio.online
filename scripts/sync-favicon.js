const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const pngToIco = require("png-to-ico").default;

const publicDir = path.join(__dirname, "../public");
const svgPath = path.join(publicDir, "favicon.svg");
const pngPath = path.join(publicDir, "favicon.png");
const icoPath = path.join(publicDir, "favicon.ico");
const iconsDir = path.join(publicDir, "icons");

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

const sizes = [
    { name: "icon-192.png", size: 192, bg: "#0a0a0a" },
    { name: "icon-512.png", size: 512, bg: "#0a0a0a" },
    { name: "icon-512-maskable.png", size: 512, bg: "#0a0a0a", pad: 0.15 },
    { name: "apple-touch-icon-180.png", size: 180, bg: "#0a0a0a" },
    { name: "apple-touch-icon-152.png", size: 152, bg: "#0a0a0a" },
    { name: "apple-touch-icon-120.png", size: 120, bg: "#0a0a0a" },
    { name: "apple-touch-icon-76.png", size: 76, bg: "#0a0a0a" },
];

async function generate() {
    console.log("Reading favicon.svg...");
    const svgBuffer = fs.readFileSync(svgPath);

    // 1. Generate favicon.png (main source for ICO and others)
    console.log("Generating favicon.png (512x512)...");
    await sharp(svgBuffer)
        .resize(512, 512)
        .png()
        .toFile(pngPath);

    // 2. Generate favicon.ico
    console.log("Generating favicon.ico...");
    const icoBuffer = await pngToIco(pngPath);
    fs.writeFileSync(icoPath, icoBuffer);

    // 3. Generate PWA and Apple icons
    for (const { name, size, bg, pad = 0 } of sizes) {
        const inner = Math.round(size * (1 - pad * 2));
        const offset = Math.round(size * pad);

        await sharp(svgBuffer)
            .resize(inner, inner, { fit: "contain", background: "transparent" })
            .extend({
                top: offset, bottom: offset, left: offset, right: offset,
                background: bg,
            })
            .png()
            .toFile(path.join(iconsDir, name));

        console.log(`✓ ${name} (${size}x${size})`);
    }

    console.log("Done! All favicon formats and PWA icons updated from SVG.");
}

generate().catch(console.error);
