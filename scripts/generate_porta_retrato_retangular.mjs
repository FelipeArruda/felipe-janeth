import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUTPUT_DIR = path.join(PUBLIC_DIR, 'enquadradas');

const FRAME_W = 1800;
const FRAME_H = 2400;

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
    :root { --paper:#fffdf9; --line:rgba(140,118,87,.36); --line-soft:rgba(140,118,87,.24); --gold:#a68352; }
    * { box-sizing:border-box; }
    html, body { margin:0; padding:0; background:#fff; }
    #capture { width:${FRAME_W}px; height:${FRAME_H}px; background:#fff; display:flex; align-items:center; justify-content:center; padding:42px; }
    .frame { position:relative; width:100%; height:100%; border:2px solid var(--line); border-radius:20px; background:radial-gradient(rgba(109,84,53,.038) .55px, transparent .75px), linear-gradient(160deg, rgba(255,255,255,.95), rgba(245,236,223,.58)), var(--paper); background-size:4px 4px,100% 100%,100% 100%; box-shadow:0 18px 34px rgba(47,32,17,.12); overflow:hidden; }
    .frame::before { content:''; position:absolute; inset:16px; border:1px solid var(--line-soft); border-radius:14px; pointer-events:none; }
    .inner {
      position:absolute;
      inset:28px;
      border:1px solid rgba(140,118,87,.28);
      border-radius:12px;
      padding:34px;
      display:flex;
      flex-direction:column;
    }
    .header { text-align:center; margin-top:16px; }
    .eyebrow { margin:0; font:600 16px/1.2 "Arial",sans-serif; letter-spacing:.24em; text-transform:uppercase; color:#8c7a62; }
    .divider { margin:12px auto 0; display:flex; align-items:center; justify-content:center; gap:10px; color:var(--gold); }
    .divider span { display:block; width:190px; height:1px; background:linear-gradient(to right, rgba(166,131,82,0), rgba(166,131,82,.75), rgba(166,131,82,0)); }
    .divider i { margin:0; font-style:normal; font-size:12px; letter-spacing:.2em; }
    .photo {
      margin-top:24px;
      flex:1;
      min-height:0;
      border:1px solid rgba(140,118,87,.28);
      border-radius:22px;
      overflow:hidden;
      background:#f5f2ed;
    }
    .photo img { width:100%; height:100%; display:block; object-fit:cover; }
    .footer { margin-top:14px; border-top:1px solid rgba(133,106,74,.28); padding-top:10px; text-align:center; color:#74614a; text-transform:uppercase; }
    .footer strong { display:block; font:600 15px/1.2 "Arial",sans-serif; letter-spacing:.2em; }
    .footer span { display:block; margin-top:4px; font:600 12px/1.2 "Arial",sans-serif; letter-spacing:.16em; }
  </style>
</head>
<body>
  <main id="capture">
    <article class="frame">
      <div class="inner">
        <header class="header">
          <p class="eyebrow">Momento Especial</p>
          <div class="divider"><span></span><i>•••</i><span></span></div>
        </header>
        <section class="photo"><img src="${imageUrl}" alt="Foto" /></section>
        <footer class="footer"><strong>Janeth &amp; Felipe</strong><span>24 Abril 2026</span></footer>
      </div>
    </article>
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
  const page = await browser.newPage({ viewport: { width: FRAME_W, height: FRAME_H }, deviceScaleFactor: 1 });

  for (const photoName of photos) {
    const ext = path.extname(photoName).toLowerCase();
    const mime = MIME_BY_EXT[ext] || 'image/jpeg';
    const photoBuffer = await fs.readFile(path.join(PUBLIC_DIR, photoName));
    const photoUrl = `data:${mime};base64,${photoBuffer.toString('base64')}`;

    const outputName = `${photoName.replace(/\.[^.]+$/, '')}-porta-retrato-retangular.png`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    await page.setContent(htmlFor(photoUrl), { waitUntil: 'load' });
    await page.waitForTimeout(120);

    const target = await page.$('#capture');
    if (!target) throw new Error('Elemento #capture nao encontrado');

    await target.screenshot({ path: outputPath, type: 'png' });
    console.log(`OK ${photoName} -> ${outputName}`);
  }

  await browser.close();
  console.log(`Concluido: ${photos.length} novas imagens retangulares`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
