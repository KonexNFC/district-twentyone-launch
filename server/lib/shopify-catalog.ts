interface ShopifyImage {
  src: string;
  alt: string | null;
  width: number;
  height: number;
}

interface ShopifyVariant {
  id: number;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  price: string;
  available: boolean;
  sku: string | null;
}

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  product_type: string;
  tags: string[];
  images: ShopifyImage[];
  variants: ShopifyVariant[];
  created_at: string;
  updated_at: string;
}

interface ShopifyResponse {
  products: ShopifyProduct[];
}

export interface CatalogImage {
  src: string;
  alt: string;
}

export interface CatalogSizeVariant {
  size: string;
  available: boolean;
  variantId: number;
}

export interface CatalogColorVariant {
  color: string;
  price: string;
  images: CatalogImage[];
  sizes: CatalogSizeVariant[];
  shopifyHandle: string;
  shopifyUrl: string;
}

export interface CatalogDesign {
  designId: string;
  title: string;
  handle: string;
  type: string;
  fit: string;
  colors: CatalogColorVariant[];
}

const SHOPIFY_URL = "https://district21.co/products.json";
const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedCatalog: CatalogDesign[] | null = null;
let cacheTimestamp = 0;

function normalizeTitle(title: string): string {
  return title
    .replace(/^district\s*21\s*/i, "")
    .replace(/\s*-\s*(black|white|gray|grey)\s*$/i, "")
    .replace(/\s*\((black|white|gray|grey)\)\s*$/i, "")
    .trim();
}

function extractColor(product: ShopifyProduct): string {
  const titleMatch = product.title.match(/[-–]\s*(black|white|gray|grey)\s*$/i)
    || product.title.match(/\((black|white|gray|grey)\)\s*$/i);
  if (titleMatch) {
    return titleMatch[1].toLowerCase();
  }

  for (const variant of product.variants) {
    for (const opt of [variant.option1, variant.option2, variant.option3]) {
      if (opt && /^(black|white|gray|grey)$/i.test(opt.trim())) {
        return opt.trim().toLowerCase();
      }
    }
  }

  const colorTag = product.tags.find(t =>
    /^(black|white|gray|grey)$/i.test(t.trim())
  );
  if (colorTag) return colorTag.trim().toLowerCase();

  return "black";
}

function inferType(title: string, productType: string): string {
  const lower = (title + " " + productType).toLowerCase();
  if (lower.includes("hoodie") || lower.includes("hood")) return "hoodie";
  if (lower.includes("sweatshirt") || lower.includes("sweater") || lower.includes("crew")) return "sweatshirt";
  if (lower.includes("hat") || lower.includes("cap")) return "hat";
  return "tee";
}

function inferFit(title: string, type: string): string {
  const lower = title.toLowerCase();
  if (type === "tee") {
    if (lower.includes("oversized") || lower.includes("freestyler")) return "oversized tee";
    if (lower.includes("boxy") || lower.includes("hypster")) return "boxy tee";
    return "classic tee";
  }
  if (type === "hoodie") {
    if (lower.includes("voicer")) return "relaxed hood";
    return "heavyweight hood";
  }
  if (type === "sweatshirt") return "classic sweatshirt";
  if (type === "hat") return "structured cap";
  return type;
}

function titleToHandle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const KNOWN_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "XXL", "XXXL", "One Size", "OS"];

function extractSizes(product: ShopifyProduct): CatalogSizeVariant[] {
  return product.variants.map(v => {
    const opts = [v.option1, v.option2, v.option3].filter(Boolean) as string[];
    const sizeOpt = opts.find(o => KNOWN_SIZES.includes(o.trim().toUpperCase()) || KNOWN_SIZES.includes(o.trim()));
    const size = sizeOpt?.trim() || opts[opts.length - 1] || v.title || "One Size";
    return {
      size,
      available: v.available,
      variantId: v.id,
    };
  });
}

async function fetchShopifyProducts(): Promise<ShopifyProduct[]> {
  const allProducts: ShopifyProduct[] = [];
  let page = 1;
  const limit = 250;

  while (true) {
    const url = `${SHOPIFY_URL}?limit=${limit}&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Shopify fetch failed: ${response.status} ${response.statusText}`);
    }
    const data: ShopifyResponse = await response.json();
    if (!data.products || data.products.length === 0) break;
    allProducts.push(...data.products);
    if (data.products.length < limit) break;
    page++;
  }

  return allProducts;
}

function normalizeProducts(products: ShopifyProduct[]): CatalogDesign[] {
  const designMap = new Map<string, {
    normalizedTitle: string;
    type: string;
    fit: string;
    colorMap: Map<string, { product: ShopifyProduct; imageCount: number; createdAt: string }>;
  }>();

  for (const product of products) {
    const normalizedTitle = normalizeTitle(product.title);
    const designKey = normalizedTitle.toLowerCase();
    const color = extractColor(product);

    if (!designMap.has(designKey)) {
      const type = inferType(normalizedTitle, product.product_type);
      designMap.set(designKey, {
        normalizedTitle,
        type,
        fit: inferFit(normalizedTitle, type),
        colorMap: new Map(),
      });
    }

    const design = designMap.get(designKey)!;
    const existing = design.colorMap.get(color);

    if (
      !existing ||
      product.images.length > existing.imageCount ||
      (product.images.length === existing.imageCount && product.created_at > existing.createdAt)
    ) {
      design.colorMap.set(color, {
        product,
        imageCount: product.images.length,
        createdAt: product.created_at,
      });
    }
  }

  const catalog: CatalogDesign[] = [];

  const designEntries = Array.from(designMap.entries());
  for (const [, design] of designEntries) {
    const colors: CatalogColorVariant[] = [];

    const sortOrder = ["black", "white", "gray", "grey"];
    const sortedColors = Array.from(design.colorMap.entries()).sort((a, b) => {
      const ai = sortOrder.indexOf(a[0]);
      const bi = sortOrder.indexOf(b[0]);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    for (const [color, entry] of sortedColors) {
      const { product } = entry;
      colors.push({
        color,
        price: product.variants[0]?.price || "0.00",
        images: product.images
          .filter((img: ShopifyImage) => {
            const check = ((img.alt || "") + " " + (img.src || "")).toLowerCase();
            return !/(blank|flat|template|unbranded)/.test(check);
          })
          .map((img: ShopifyImage) => ({
            src: img.src,
            alt: img.alt || `District21 ${design.normalizedTitle} - ${color}`,
          })),
        sizes: extractSizes(product),
        shopifyHandle: product.handle,
        shopifyUrl: `https://district21.co/products/${product.handle}`,
      });
    }

    if (colors.length > 0) {
      catalog.push({
        designId: titleToHandle(design.normalizedTitle),
        title: design.normalizedTitle,
        handle: titleToHandle(design.normalizedTitle),
        type: design.type,
        fit: design.fit,
        colors,
      });
    }
  }

  return catalog;
}

export async function getCatalog(): Promise<CatalogDesign[]> {
  const now = Date.now();
  if (cachedCatalog && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedCatalog;
  }

  try {
    const products = await fetchShopifyProducts();
    cachedCatalog = normalizeProducts(products);
    cacheTimestamp = Date.now();
    console.log(`[shopify-catalog] Fetched and normalized ${cachedCatalog.length} designs from ${products.length} Shopify products`);
    return cachedCatalog;
  } catch (err) {
    console.error("[shopify-catalog] Failed to fetch catalog:", err);
    if (cachedCatalog) {
      console.warn("[shopify-catalog] Returning stale cache");
      return cachedCatalog;
    }
    throw err;
  }
}

export function getCatalogByHandle(catalog: CatalogDesign[], handle: string): CatalogDesign | undefined {
  return catalog.find(d => d.handle === handle);
}

export function invalidateCache(): void {
  cachedCatalog = null;
  cacheTimestamp = 0;
}
