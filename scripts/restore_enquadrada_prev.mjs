import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUTPUT_DIR = path.join(PUBLIC_DIR, 'enquadradas');

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const htmlFor = (imageUrl) => `
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @page { size: A4; margin: 14mm; }
      :root {
        --paper: #f0e8de;
        --tag: #fffdf9;
        --ink: #2d2722;
        --ink-soft: #5f5449;
        --line: rgba(140, 118, 87, 0.36);
        --gold: #a68352;
      }
      * { box-sizing: border-box; }
      body { margin: 0; background: transparent; color: var(--ink); font-family: "Cormorant Garamond", "Times New Roman", serif; }
      .page { padding: 6px; }
      .print-sheet {
        width: 100%;
        min-height: calc(297mm - 28mm);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .tag-scene {
        position: relative;
        width: 95mm;
        min-height: 152mm;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: 0;
      }
      .gift-tag {
        position: relative;
        width: 86mm;
        min-height: 138mm;
        padding: 15mm 4mm 4mm;
        border: 1px solid var(--line);
        border-radius: 2.6mm;
        background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.95)), var(--tag);
        box-shadow: 0 10px 22px rgba(47, 32, 17, 0.16);
        overflow: hidden;
      }
      .gift-tag::before {
        content: '';
        position: absolute;
        inset: 2.3mm;
        border: 1px solid rgba(140, 118, 87, 0.24);
        border-radius: 1.8mm;
        pointer-events: none;
      }
      .tag-hole {
        position: absolute;
        left: 50%;
        top: 4mm;
        width: 5.2mm;
        height: 5.2mm;
        margin-left: -2.6mm;
        border-radius: 50%;
        background: #ece3d8;
        border: 1px solid #9e876a;
        box-shadow: inset 0 0 0 1px rgba(146, 123, 96, 0.2);
        z-index: 2;
      }
      .frame-inner {
        position: relative;
        min-height: 126mm;
        width: 100%;
        border: 1px solid rgba(140, 118, 87, 0.28);
        background: radial-gradient(rgba(109,84,53,.045) .55px, transparent .75px), linear-gradient(160deg, rgba(255,255,255,.82), rgba(245,236,223,.6)), var(--tag);
        background-size: 4px 4px, 100% 100%, 100% 100%;
        border-radius: 1.4mm;
        padding: 13mm 6mm 7mm;
        overflow: hidden;
      }
      .ornament { position: absolute; width: 10mm; height: 10mm; border: 1px solid rgba(166, 131, 82, 0.42); border-radius: 1px; pointer-events: none; }
      .ornament::before,.ornament::after { content: ""; position: absolute; border: 1px solid rgba(166, 131, 82, 0.42); width: 5.6mm; height: 5.6mm; transform: rotate(45deg); }
      .ornament::before { top: -3.7mm; left: 2.2mm; }
      .ornament::after { top: 2.2mm; left: -3.7mm; }
      .ornament-top-left { top: 2.6mm; left: 2.6mm; border-right: 0; border-bottom: 0; }
      .ornament-top-right { top: 2.6mm; right: 2.6mm; border-left: 0; border-bottom: 0; transform: scaleX(-1); }
      .ornament-bottom-left { bottom: 2.6mm; left: 2.6mm; border-right: 0; border-top: 0; transform: scaleY(-1); }
      .ornament-bottom-right { bottom: 2.6mm; right: 2.6mm; border-left: 0; border-top: 0; transform: scale(-1); }
      .divider { margin: 3.2mm auto 0; display: flex; align-items: center; justify-content: center; gap: 6px; color: var(--gold); }
      .divider span { display: block; width: 16mm; height: 1px; background: linear-gradient(to right, rgba(166,131,82,0), rgba(166,131,82,.75), rgba(166,131,82,0)); }
      .divider i { margin: 0; font-style: normal; font-size: 7px; letter-spacing: .2em; }
      .card-header { text-align: center; padding: 3mm 1mm 0; position: relative; z-index: 1; }
      .eyebrow { margin: 0; font: 600 7.8px/1.2 "Arial", sans-serif; letter-spacing: .24em; text-transform: uppercase; color: #8c7a62; }
      .photo-card { margin: 6.5mm 0 0; border: 1px solid rgba(140, 118, 87, 0.28); border-radius: 3mm; overflow: hidden; min-height: 97mm; position: relative; z-index: 1; background: #f5f2ed; }
      .photo-card img { display: block; width: 100%; height: 97mm; object-fit: cover; }
      footer { margin-top: 7mm; border-top: 1px solid rgba(133, 106, 74, 0.28); padding-top: 2.8mm; display: flex; flex-direction: column; align-items: center; gap: 1.2mm; font: 600 7.6px/1.2 "Arial", sans-serif; letter-spacing: .16em; text-transform: uppercase; color: #74614a; position: relative; z-index: 1; }
      footer strong { font-size: 8px; letter-spacing: .2em; }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="print-sheet">
        <article class="tag-scene">
          <div class="gift-tag" id="capture">
            <div class="tag-hole"></div>
            <div class="frame-inner">
              <div class="ornament ornament-top-left"></div>
              <div class="ornament ornament-top-right"></div>
              <div class="ornament ornament-bottom-left"></div>
              <div class="ornament ornament-bottom-right"></div>
              <header class="card-header">
                <p class="eyebrow">Momento Especial</p>
                <div class="divider"><span></span><i>•••</i><span></span></div>
              </header>
              <div class="photo-card"><img src="${imageUrl}" alt="Foto" /></div>
              <footer><strong>Janeth &amp; Felipe</strong><span>24 Abril 2026</span></footer>
            </div>
          </div>
        </article>
      </section>
    </main>
  </body>
</html>
`;

const run = async () => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const entries = await fs.readdir(PUBLIC_DIR, { withFileTypes: true });
  const photos = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => IMAGE_EXT.has(path.extname(name).toLowerCase()))
    .filter((name) => !name.includes('-enquadrada') && !name.includes('-impressao-10x15') && !name.includes('-impressao-15x10'));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1100, height: 1600 }, deviceScaleFactor: 3 });

  for (const photoName of photos) {
    const ext = path.extname(photoName).toLowerCase();
    const mime = MIME_BY_EXT[ext] || 'image/jpeg';
    const photoBuffer = await fs.readFile(path.join(PUBLIC_DIR, photoName));
    const photoUrl = `data:${mime};base64,${photoBuffer.toString('base64')}`;
    const outputName = `${photoName.replace(/\.[^.]+$/, '')}-enquadrada.png`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    await page.setContent(htmlFor(photoUrl), { waitUntil: 'load' });
    await page.waitForTimeout(150);

    const target = await page.$('#capture');
    if (!target) throw new Error('Elemento #capture nao encontrado');

    await target.screenshot({ path: outputPath, type: 'png', omitBackground: true });
    console.log(`OK ${photoName} -> ${outputName}`);
  }

  await browser.close();
  console.log(`Restaurado: ${photos.length} imagens -enquadrada`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
