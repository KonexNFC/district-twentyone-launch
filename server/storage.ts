import { type User, type InsertUser, type Lead, type InsertLead, type DropSettings, type InsertDropSettings, type ContactMessage, type InsertContactMessage, type BrandAsset, type InsertBrandAsset, type MockupPreset, type InsertMockupPreset, type Mockup, type InsertMockup, leads, dropSettings, users, contactMessages, brandAssets, mockupPresets, mockups } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createLead(lead: InsertLead): Promise<Lead>;
  getLeadByEmail(email: string): Promise<Lead | undefined>;
  getAllLeads(): Promise<Lead[]>;
  getDropSettings(): Promise<DropSettings | undefined>;
  upsertDropSettings(settings: Partial<InsertDropSettings>): Promise<DropSettings>;
  createContactMessage(msg: InsertContactMessage): Promise<ContactMessage>;
  getAllBrandAssets(): Promise<BrandAsset[]>;
  getBrandAssetsByType(type: string): Promise<BrandAsset[]>;
  createBrandAsset(asset: InsertBrandAsset): Promise<BrandAsset>;
  deleteBrandAsset(id: number): Promise<void>;
  getAllMockupPresets(): Promise<MockupPreset[]>;
  getMockupPresetsBySilhouette(silhouette: string): Promise<MockupPreset[]>;
  upsertMockupPreset(preset: InsertMockupPreset): Promise<MockupPreset>;
  deleteMockupPreset(id: number): Promise<void>;
  getAllMockups(): Promise<Mockup[]>;
  getMockupsBySilhouette(silhouette: string): Promise<Mockup[]>;
  getMockup(id: number): Promise<Mockup | undefined>;
  createMockup(mockup: InsertMockup): Promise<Mockup>;
  deleteMockup(id: number): Promise<void>;
  deleteAllMockups(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [result] = await db.insert(leads).values(lead).returning();
    return result;
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.email, email));
    return lead;
  }

  async getAllLeads(): Promise<Lead[]> {
    return db.select().from(leads).orderBy(leads.createdAt);
  }

  async getDropSettings(): Promise<DropSettings | undefined> {
    const [settings] = await db.select().from(dropSettings);
    return settings;
  }

  async upsertDropSettings(settings: Partial<InsertDropSettings>): Promise<DropSettings> {
    const existing = await this.getDropSettings();
    if (existing) {
      const [updated] = await db
        .update(dropSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(dropSettings.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(dropSettings)
      .values({
        dropDate: settings.dropDate ?? null,
        isLive: settings.isLive ?? false,
        shopifyUrl: settings.shopifyUrl ?? null,
      })
      .returning();
    return created;
  }

  async createContactMessage(msg: InsertContactMessage): Promise<ContactMessage> {
    const [result] = await db.insert(contactMessages).values(msg).returning();
    return result;
  }

  async getAllBrandAssets(): Promise<BrandAsset[]> {
    return db.select().from(brandAssets).orderBy(brandAssets.createdAt);
  }

  async getBrandAssetsByType(type: string): Promise<BrandAsset[]> {
    return db.select().from(brandAssets).where(eq(brandAssets.type, type));
  }

  async createBrandAsset(asset: InsertBrandAsset): Promise<BrandAsset> {
    const [result] = await db.insert(brandAssets).values(asset).returning();
    return result;
  }

  async deleteBrandAsset(id: number): Promise<void> {
    await db.delete(brandAssets).where(eq(brandAssets.id, id));
  }

  async getAllMockupPresets(): Promise<MockupPreset[]> {
    return db.select().from(mockupPresets);
  }

  async getMockupPresetsBySilhouette(silhouette: string): Promise<MockupPreset[]> {
    return db.select().from(mockupPresets).where(eq(mockupPresets.silhouette, silhouette));
  }

  async upsertMockupPreset(preset: InsertMockupPreset): Promise<MockupPreset> {
    const [existing] = await db.select().from(mockupPresets).where(
      and(eq(mockupPresets.silhouette, preset.silhouette), eq(mockupPresets.variation, preset.variation))
    );
    if (existing) {
      const [updated] = await db
        .update(mockupPresets)
        .set(preset)
        .where(eq(mockupPresets.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(mockupPresets).values(preset).returning();
    return created;
  }

  async deleteMockupPreset(id: number): Promise<void> {
    await db.delete(mockupPresets).where(eq(mockupPresets.id, id));
  }

  async getAllMockups(): Promise<Mockup[]> {
    return db.select().from(mockups).orderBy(mockups.silhouette);
  }

  async getMockupsBySilhouette(silhouette: string): Promise<Mockup[]> {
    return db.select().from(mockups).where(eq(mockups.silhouette, silhouette));
  }

  async getMockup(id: number): Promise<Mockup | undefined> {
    const [result] = await db.select().from(mockups).where(eq(mockups.id, id));
    return result;
  }

  async createMockup(mockup: InsertMockup): Promise<Mockup> {
    const [result] = await db.insert(mockups).values(mockup).returning();
    return result;
  }

  async deleteMockup(id: number): Promise<void> {
    await db.delete(mockups).where(eq(mockups.id, id));
  }

  async deleteAllMockups(): Promise<void> {
    await db.delete(mockups);
  }
}

export const storage = new DatabaseStorage();
