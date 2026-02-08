import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

const OUTPUT_DIR = path.resolve(process.cwd(), "client/public/images/overlays");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function createBoldSVG(color: string, width: number, height: number): Buffer {
  const textColor = color === "white" ? "#FFFFFF" : "#000000";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <text x="50%" y="55%" text-anchor="middle" dominant-baseline="central"
      font-family="Inter Black, Inter, sans-serif" font-weight="900" font-size="180"
      letter-spacing="-4" fill="${textColor}">DISTRICT21</text>
  </svg>`;
  return Buffer.from(svg);
}

function createTaglineSVG(color: string, width: number, height: number): Buffer {
  const textColor = color === "white" ? "#FFFFFF" : "#000000";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <text x="50%" y="38%" text-anchor="middle" dominant-baseline="central"
      font-family="Inter Black, Inter, sans-serif" font-weight="900" font-size="180"
      letter-spacing="-4" fill="${textColor}">DISTRICT21</text>
    <text x="50%" y="72%" text-anchor="middle" dominant-baseline="central"
      font-family="Inter, sans-serif" font-weight="400" font-size="52"
      letter-spacing="12" fill="${textColor}">THE UNIFORM OF NOW</text>
  </svg>`;
  return Buffer.from(svg);
}

function createWordmarkSVG(color: string, width: number, height: number): Buffer {
  const textColor = color === "white" ? "#FFFFFF" : "#000000";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <text x="50%" y="55%" text-anchor="middle" dominant-baseline="central"
      font-family="Inter Black, Inter, sans-serif" font-weight="900" font-size="140"
      letter-spacing="-3" fill="${textColor}">DISTRICT21</text>
  </svg>`;
  return Buffer.from(svg);
}

function createIconSVG(color: string, width: number, height: number): Buffer {
  const textColor = color === "white" ? "#FFFFFF" : "#000000";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
      font-family="Inter Black, Inter, sans-serif" font-weight="900" font-size="120"
      letter-spacing="-2" fill="${textColor}">D21</text>
  </svg>`;
  return Buffer.from(svg);
}

export async function generateOverlays(): Promise<void> {
  await ensureDir(OUTPUT_DIR);

  const configs = [
    { name: "bold", generator: createBoldSVG, width: 1800, height: 300 },
    { name: "tagline", generator: createTaglineSVG, width: 1800, height: 500 },
    { name: "wordmark", generator: createWordmarkSVG, width: 1600, height: 280 },
    { name: "icon", generator: createIconSVG, width: 500, height: 300 },
  ];

  for (const config of configs) {
    for (const color of ["black", "white"]) {
      const svgBuffer = config.generator(color, config.width, config.height);
      const pngBuffer = await sharp(svgBuffer)
        .png()
        .toBuffer();

      const trimmed = await sharp(pngBuffer)
        .trim()
        .extend({ top: 20, bottom: 20, left: 40, right: 40, background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

      const filename = `${config.name}-${color}.png`;
      await fs.writeFile(path.join(OUTPUT_DIR, filename), trimmed);
      const meta = await sharp(trimmed).metadata();
      console.log(`Generated: ${filename} (${meta.width}x${meta.height})`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateOverlays()
    .then(() => console.log("All overlays generated"))
    .catch(console.error);
}
