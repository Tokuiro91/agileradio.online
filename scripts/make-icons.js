const puppeteer = require('puppeteer');
const pngToIco = require('png-to-ico');
const fs = require('fs');

(async () => {
    console.log("Launching browser to render icons...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // We will render "BØDEN" stacked as BØ over DEN
    const html = `
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Tektur:wght@500&display=swap" rel="stylesheet">
        <style>
            body { margin: 0; background: #0a0a0a; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
            h1 { font-family: 'Tektur', sans-serif; color: #99CCCC; font-weight: 500; margin: 0; text-align: center; line-height: 0.9; }
        </style>
    </head>
    <body>
        <h1 id="text">BØ<br>DEN</h1>
    </body>
    </html>
    `;

    await page.goto('data:text/html,' + encodeURIComponent(html), { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');

    const sizes = [
        { name: 'public/icons/icon-512.png', size: 512, font: 200 },
        { name: 'public/icons/icon-512-maskable.png', size: 512, font: 200 },
        { name: 'public/icons/icon-192.png', size: 192, font: 75 },
        { name: 'public/icons/apple-touch-icon-180.png', size: 180, font: 70 },
        { name: 'public/icons/apple-touch-icon-152.png', size: 152, font: 60 },
        { name: 'public/icons/apple-touch-icon-120.png', size: 120, font: 48 },
        { name: 'public/icons/apple-touch-icon-76.png', size: 76, font: 30 },
        { name: 'public/favicon.png', size: 512, font: 200 },
        { name: 'public/favicon-temp.png', size: 256, font: 100 }, // for ico
    ];

    for (let s of sizes) {
        await page.setViewport({ width: s.size, height: s.size, deviceScaleFactor: 1 });
        await page.evaluate((fs) => {
            document.getElementById('text').style.fontSize = fs + 'px';
        }, s.font);
        await page.screenshot({ path: s.name });
        console.log("Generated: " + s.name);
    }

    await browser.close();

    // convert 256x256 png to .ico (which contains multiple sizes like 16,32,48 automatically)
    console.log("Converting to favicon.ico...");
    let pngToIcoFn = pngToIco;
    if (typeof pngToIcoFn !== 'function') {
        pngToIcoFn = pngToIco.default || pngToIco.pngToIco;
    }
    const buf = await pngToIcoFn('public/favicon-temp.png');
    // Save to the Next.js app/ directory where favicon.ico usually lives (we saw it there)
    fs.writeFileSync('app/favicon.ico', buf);
    // Also save a fallback to public/ just in case
    fs.writeFileSync('public/favicon.ico', buf);

    fs.unlinkSync('public/favicon-temp.png');

    console.log("Successfully generated all icons and favicon.ico!");
})().catch(err => {
    console.error(err);
    process.exit(1);
});
