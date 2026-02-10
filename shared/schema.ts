import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp"),
  source: text("source").notNull().default("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dropSettings = pgTable("drop_settings", {
  id: serial("id").primaryKey(),
  dropDate: timestamp("drop_date"),
  isLive: boolean("is_live").notNull().default(false),
  shopifyUrl: text("shopify_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDropSettingsSchema = createInsertSchema(dropSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertDropSettings = z.infer<typeof insertDropSettingsSchema>;
export type DropSettings = typeof dropSettings.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const brandAssets = pgTable("brand_assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  filePath: text("file_path").notNull(),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBrandAssetSchema = createInsertSchema(brandAssets).omit({
  id: true,
  createdAt: true,
});

export type InsertBrandAsset = z.infer<typeof insertBrandAssetSchema>;
export type BrandAsset = typeof brandAssets.$inferSelect;

export const placementSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  opacity: z.number().min(0).max(1).default(0.9),
});

export type Placement = z.infer<typeof placementSchema>;

export const mockupPresets = pgTable("mockup_presets", {
  id: serial("id").primaryKey(),
  silhouette: text("silhouette").notNull(),
  variation: text("variation").notNull(),
  placement: jsonb("placement").notNull(),
  assetType: text("asset_type").notNull(),
});

export const insertMockupPresetSchema = createInsertSchema(mockupPresets).omit({
  id: true,
});

export type InsertMockupPreset = z.infer<typeof insertMockupPresetSchema>;
export type MockupPreset = typeof mockupPresets.$inferSelect;

export const mockups = pgTable("mockups", {
  id: serial("id").primaryKey(),
  silhouette: text("silhouette").notNull(),
  color: text("color").notNull(),
  variation: text("variation").notNull(),
  presetId: integer("preset_id"),
  filePath1600: text("file_path_1600"),
  filePath1024: text("file_path_1024"),
  filePath640: text("file_path_640"),
  filePathJpg: text("file_path_jpg"),
  altText: text("alt_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMockupSchema = createInsertSchema(mockups).omit({
  id: true,
  createdAt: true,
});

export type InsertMockup = z.infer<typeof insertMockupSchema>;
export type Mockup = typeof mockups.$inferSelect;

export const SILHOUETTES = [
  { id: "freestyler", name: "Freestyler", type: "tee", fit: "oversized tee" },
  { id: "hypster", name: "Hypster", type: "tee", fit: "boxy tee" },
  { id: "blaker", name: "Blaker", type: "tee", fit: "classic tee" },
  { id: "blaster2", name: "Blaster 2.0", type: "tee", fit: "oversized tee" },
  { id: "gamechanger", name: "Gamechanger", type: "hoodie", fit: "heavyweight hood" },
  { id: "voicer", name: "Voicer", type: "hoodie", fit: "relaxed hood" },
  { id: "chaser", name: "Chaser", type: "hoodie", fit: "chaser hood" },
  { id: "ryler", name: "Ryler", type: "sweatshirt", fit: "classic sweatshirt" },
  { id: "thinker", name: "Thinker", type: "sweatshirt", fit: "premium sweatshirt" },
  { id: "hat", name: "Hat", type: "hat", fit: "structured cap" },
] as const;

export const TEE_VARIATIONS = ["bold", "tagline", "icon"] as const;
export const HOODIE_SWEAT_VARIATIONS = ["wordmark", "icon"] as const;
export const HAT_VARIATIONS = ["wordmark", "icon"] as const;
