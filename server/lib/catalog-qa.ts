import type { CatalogDesign } from "./shopify-catalog";

export interface QAWarning {
  level: "warn" | "error";
  design: string;
  color?: string;
  message: string;
}

export function runCatalogQA(catalog: CatalogDesign[]): QAWarning[] {
  const warnings: QAWarning[] = [];

  const handleCounts = new Map<string, number>();
  for (const design of catalog) {
    handleCounts.set(design.handle, (handleCounts.get(design.handle) || 0) + 1);
  }
  const handleEntries = Array.from(handleCounts.entries());
  for (const [handle, count] of handleEntries) {
    if (count > 1) {
      warnings.push({
        level: "error",
        design: handle,
        message: `Duplicate handle found ${count} times`,
      });
    }
  }

  for (const design of catalog) {
    if (design.colors.length === 0) {
      warnings.push({
        level: "error",
        design: design.handle,
        message: "Design has no color variants",
      });
      continue;
    }

    const hasBlack = design.colors.some(c => c.color === "black");
    const hasWhite = design.colors.some(c => c.color === "white");
    if (!hasBlack) {
      warnings.push({
        level: "warn",
        design: design.handle,
        message: "Missing black color variant",
      });
    }
    if (!hasWhite) {
      warnings.push({
        level: "warn",
        design: design.handle,
        message: "Missing white color variant",
      });
    }

    for (const colorVariant of design.colors) {
      if (colorVariant.images.length < 2) {
        warnings.push({
          level: "warn",
          design: design.handle,
          color: colorVariant.color,
          message: `Only ${colorVariant.images.length} image(s) for ${colorVariant.color} variant (recommend >=2)`,
        });
      }

      for (const img of colorVariant.images) {
        const check = ((img.alt || "") + " " + (img.src || "")).toLowerCase();
        if (/(blank|flat|template|unbranded)/.test(check)) {
          warnings.push({
            level: "error",
            design: design.handle,
            color: colorVariant.color,
            message: `Blank/template image detected: ${img.src.split("/").pop()}`,
          });
        }
      }

      if (colorVariant.sizes.length === 0) {
        warnings.push({
          level: "warn",
          design: design.handle,
          color: colorVariant.color,
          message: `No sizes available for ${colorVariant.color} variant`,
        });
      }

      const allUnavailable = colorVariant.sizes.every(s => !s.available);
      if (colorVariant.sizes.length > 0 && allUnavailable) {
        warnings.push({
          level: "warn",
          design: design.handle,
          color: colorVariant.color,
          message: `All sizes out of stock for ${colorVariant.color} variant`,
        });
      }
    }
  }

  return warnings;
}

export function logQAReport(catalog: CatalogDesign[]): void {
  const warnings = runCatalogQA(catalog);

  if (warnings.length === 0) {
    console.log("[catalog-qa] All checks passed — no issues found");
    return;
  }

  console.log(`[catalog-qa] ${warnings.length} issue(s) found:`);
  for (const w of warnings) {
    const colorTag = w.color ? ` [${w.color}]` : "";
    const prefix = w.level === "error" ? "ERROR" : "WARN";
    console.log(`  [${prefix}] ${w.design}${colorTag}: ${w.message}`);
  }
}
