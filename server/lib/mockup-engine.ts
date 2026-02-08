import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { SILHOUETTES, TEE_VARIATIONS, HOODIE_SWEAT_VARIATIONS, type Placement } from "@shared/schema";

const PUBLIC_DIR = path.resolve(process.cwd(), "client/public");
const PRODUCTS_DIR = path.join(PUBLIC_DIR, "images/products");
const GENERATED_DIR = path.join(PUBLIC_DIR, "generated");
const BRAND_ASSETS_DIR = path.join(PUBLIC_DIR, "uploads/brand-assets");
const OVERLAYS_DIR = path.join(PUBLIC_DIR, "images/overlays");

const EXPORT_SIZES = [1600, 1024, 640] as const;

const DEFAULT_PLACEMENTS: Record<string, Record<string, Placement>> = {
  tee: {
    bold: { x: 0.15, y: 0.28, width: 0.7, height: 0.08, opacity: 0.92 },
    tagline: { x: 0.15, y: 0.26, width: 0.7, height: 0.14, opacity: 0.92 },
    icon: { x: 0.18, y: 0.3, width: 0.14, height: 0.06, opacity: 0.92 },
  },
  hoodie: {
    wordmark: { x: 0.18, y: 0.34, width: 0.64, height: 0.07, opacity: 0.92 },
    icon: { x: 0.22, y: 0.36, width: 0.12, height: 0.05, opacity: 0.92 },
  },
  sweatshirt: {
    wordmark: { x: 0.18, y: 0.32, width: 0.64, height: 0.07, opacity: 0.92 },
    icon: { x: 0.22, y: 0.34, width: 0.12, height: 0.05, opacity: 0.92 },
  },
};

function getVariationsForType(type: string): readonly string[] {
  if (type === "tee") return TEE_VARIATIONS;
  return HOODIE_SWEAT_VARIATIONS;
}

function getAssetTypeForVariation(variation: string): string {
  if (variation === "bold") return "bold";
  if (variation === "wordmark") return "wordmark";
  if (variation === "tagline") return "tagline";
  return "icon";
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function getOutputFilename(silhouette: string, color: string, variation: string, size: number, format: "webp" | "jpg"): string {
  const ext = format === "webp" ? "webp" : "jpg";
  return `d21-${silhouette}-${color}-${variation}-${size}.${ext}`;
}

function getAltText(silhouette: typeof SILHOUETTES[number], color: string, variation: string): string {
  const placementDesc = variation === "bold" ? "centre chest wordmark"
    : variation === "tagline" ? "centre chest wordmark with tagline"
    : variation === "wordmark" ? "centre chest wordmark"
    : "left chest icon";
  return `DISTRICT21 ${silhouette.name} ${silhouette.fit} — ${color} — ${placementDesc}`;
}

async function getOverlayAsset(assetType: string, color: string): Promise<Buffer | null> {
  const overlayColor = color === "black" ? "white" : "black";

  const uploadedDir = BRAND_ASSETS_DIR;
  try {
    await fs.access(uploadedDir);
    const files = await fs.readdir(uploadedDir);
    const match = files.find(f => f.startsWith(`${assetType}-`));
    if (match) {
      const buf = await fs.readFile(path.join(uploadedDir, match));
      return sharp(buf).ensureAlpha().toBuffer();
    }
  } catch {}

  const overlayPath = path.join(OVERLAYS_DIR, `${assetType}-${overlayColor}.png`);
  try {
    const buf = await fs.readFile(overlayPath);
    return sharp(buf).ensureAlpha().toBuffer();
  } catch {}

  return getDefaultOverlay(assetType, color);
}

async function getDefaultOverlay(assetType: string, color: string): Promise<Buffer | null> {
  const overlayColor = color === "black" ? "white" : "black";
  const overlayPath = path.join(OVERLAYS_DIR, `${assetType}-${overlayColor}.png`);
  try {
    const buf = await fs.readFile(overlayPath);
    return sharp(buf).ensureAlpha().toBuffer();
  } catch {}

  const logoFiles: Record<string, string> = {
    wordmark: path.join(PUBLIC_DIR, "images/logo-wordmark.jpeg"),
    icon: path.join(PUBLIC_DIR, "images/logo-icon.jpeg"),
    tagline: path.join(PUBLIC_DIR, "images/logo-hero.jpeg"),
  };

  const filePath = logoFiles[assetType];
  if (!filePath) return null;

  try {
    const buf = await fs.readFile(filePath);
    let pipeline = sharp(buf);
    if (color === "black") {
      pipeline = pipeline.negate({ alpha: false });
    }
    return pipeline.toBuffer();
  } catch {
    return null;
  }
}

async function compositeOverlay(
  basePath: string,
  overlayBuffer: Buffer,
  placement: Placement,
  targetWidth: number,
  targetHeight: number,
): Promise<Buffer> {
  const overlayMeta = await sharp(overlayBuffer).metadata();
  if (!overlayMeta.width || !overlayMeta.height) throw new Error("Invalid overlay");

  const overlayW = Math.round(targetWidth * placement.width);
  const overlayH = Math.round(targetHeight * placement.height);
  const overlayX = Math.round(targetWidth * placement.x);
  const overlayY = Math.round(targetHeight * placement.y);

  const resizedOverlay = await sharp(overlayBuffer)
    .resize(overlayW, overlayH, { fit: "inside", withoutEnlargement: false })
    .ensureAlpha()
    .toBuffer();

  const overlayFinal = await sharp(resizedOverlay).metadata();
  const finalW = overlayFinal.width || overlayW;
  const finalH = overlayFinal.height || overlayH;

  const centeredX = overlayX + Math.round((overlayW - finalW) / 2);
  const centeredY = overlayY + Math.round((overlayH - finalH) / 2);

  const safeX = Math.max(0, Math.min(centeredX, targetWidth - finalW));
  const safeY = Math.max(0, Math.min(centeredY, targetHeight - finalH));

  const base = sharp(basePath).resize(targetWidth, targetHeight, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } });

  const opacityOverlay = await sharp(resizedOverlay)
    .composite([{
      input: Buffer.from([0, 0, 0, Math.round(255 * placement.opacity)]),
      raw: { width: 1, height: 1, channels: 4 },
      tile: true,
      blend: "dest-in",
    }])
    .toBuffer();

  return base
    .composite([{
      input: opacityOverlay,
      left: safeX,
      top: safeY,
      blend: "over",
    }])
    .toBuffer();
}

export interface MockupResult {
  silhouette: string;
  color: string;
  variation: string;
  filePath1600: string;
  filePath1024: string;
  filePath640: string;
  filePathJpg: string;
  altText: string;
}

export async function generateMockup(
  silhouetteId: string,
  color: string,
  variation: string,
  customPlacement?: Placement,
): Promise<MockupResult> {
  await ensureDir(GENERATED_DIR);

  const silhouette = SILHOUETTES.find(s => s.id === silhouetteId);
  if (!silhouette) throw new Error(`Unknown silhouette: ${silhouetteId}`);

  const basePath = path.join(PRODUCTS_DIR, `${silhouetteId}-${color}.jpg`);
  try {
    await fs.access(basePath);
  } catch {
    throw new Error(`Base image not found: ${basePath}`);
  }

  const assetType = getAssetTypeForVariation(variation);
  const overlayBuffer = await getOverlayAsset(assetType, color);
  if (!overlayBuffer) throw new Error(`Overlay asset not found for type: ${assetType}`);

  const placement = customPlacement || DEFAULT_PLACEMENTS[silhouette.type]?.[variation];
  if (!placement) throw new Error(`No placement for ${silhouette.type}/${variation}`);

  const baseMeta = await sharp(basePath).metadata();
  const baseW = baseMeta.width || 600;
  const baseH = baseMeta.height || 750;

  const composited = await compositeOverlay(basePath, overlayBuffer, placement, baseW, baseH);

  const result: MockupResult = {
    silhouette: silhouetteId,
    color,
    variation,
    filePath1600: "",
    filePath1024: "",
    filePath640: "",
    filePathJpg: "",
    altText: getAltText(silhouette, color, variation),
  };

  for (const size of EXPORT_SIZES) {
    const height = size;
    const width = Math.round((baseW / baseH) * height);

    const webpName = getOutputFilename(silhouetteId, color, variation, size, "webp");
    const webpPath = path.join(GENERATED_DIR, webpName);

    await sharp(composited)
      .resize(width, height, { fit: "inside" })
      .webp({ quality: 85 })
      .toFile(webpPath);

    if (size === 1600) result.filePath1600 = `/generated/${webpName}`;
    if (size === 1024) result.filePath1024 = `/generated/${webpName}`;
    if (size === 640) result.filePath640 = `/generated/${webpName}`;
  }

  const jpgName = getOutputFilename(silhouetteId, color, variation, 1600, "jpg");
  const jpgPath = path.join(GENERATED_DIR, jpgName);
  await sharp(composited)
    .resize(Math.round((baseW / baseH) * 1600), 1600, { fit: "inside" })
    .jpeg({ quality: 90 })
    .toFile(jpgPath);
  result.filePathJpg = `/generated/${jpgName}`;

  return result;
}

export async function generateAllMockups(
  customPlacements?: Record<string, Record<string, Placement>>,
): Promise<MockupResult[]> {
  const results: MockupResult[] = [];

  for (const silhouette of SILHOUETTES) {
    const variations = getVariationsForType(silhouette.type);
    for (const color of ["black", "white"] as const) {
      for (const variation of variations) {
        try {
          const customPlacement = customPlacements?.[silhouette.id]?.[variation];
          const result = await generateMockup(silhouette.id, color, variation, customPlacement);
          results.push(result);
        } catch (err) {
          console.error(`Failed to generate mockup for ${silhouette.id}-${color}-${variation}:`, err);
        }
      }
    }
  }

  return results;
}

export function generateCSV(results: MockupResult[]): string {
  const header = "sku,silhouette,color,variation,file_1600,file_1024,file_640,file_jpg,alt_text\n";
  const rows = results.map((r, i) => {
    const sku = `D21-${r.silhouette.toUpperCase()}-${r.color.toUpperCase()}-${r.variation.toUpperCase()}-${String(i + 1).padStart(3, "0")}`;
    return `"${sku}","${r.silhouette}","${r.color}","${r.variation}","${r.filePath1600}","${r.filePath1024}","${r.filePath640}","${r.filePathJpg}","${r.altText}"`;
  }).join("\n");
  return header + rows;
}

export { GENERATED_DIR, BRAND_ASSETS_DIR, DEFAULT_PLACEMENTS, getVariationsForType };
