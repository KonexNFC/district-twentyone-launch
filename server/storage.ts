import { type User, type InsertUser, type Lead, type InsertLead, type DropSettings, type InsertDropSettings, type ContactMessage, type InsertContactMessage, type BrandAsset, type InsertBrandAsset, type MockupPreset, type InsertMockupPreset, type Mockup, type InsertMockup, type MockupJob, type InsertMockupJob, leads, dropSettings, users, contactMessages, brandAssets, mockupPresets, mockups, mockupJobs } from "@shared/schema";
import { db } from "./db";
import { eq, and, asc, sql } from "drizzle-orm";

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
  updateMockupApproval(id: number, approved: boolean): Promise<Mockup>;
  bulkUpdateMockupApproval(ids: number[], approved: boolean): Promise<void>;
  createMockupJob(job: InsertMockupJob): Promise<MockupJob>;
  getMockupJob(id: number): Promise<MockupJob | undefined>;
  getAllMockupJobs(): Promise<MockupJob[]>;
  getJobsByBatchId(batchId: string): Promise<MockupJob[]>;
  getNextQueuedJob(): Promise<MockupJob | undefined>;
  updateJobStatus(id: number, status: string, error?: string | null): Promise<MockupJob>;
  incrementJobAttempts(id: number): Promise<MockupJob>;
  getJobStatusCounts(): Promise<Record<string, number>>;
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

  async updateMockupApproval(id: number, approved: boolean): Promise<Mockup> {
    const [result] = await db.update(mockups).set({ approved }).where(eq(mockups.id, id)).returning();
    return result;
  }

  async bulkUpdateMockupApproval(ids: number[], approved: boolean): Promise<void> {
    for (const id of ids) {
      await db.update(mockups).set({ approved }).where(eq(mockups.id, id));
    }
  }

  async createMockupJob(job: InsertMockupJob): Promise<MockupJob> {
    const [result] = await db.insert(mockupJobs).values(job).returning();
    return result;
  }

  async getMockupJob(id: number): Promise<MockupJob | undefined> {
    const [result] = await db.select().from(mockupJobs).where(eq(mockupJobs.id, id));
    return result;
  }

  async getAllMockupJobs(): Promise<MockupJob[]> {
    return db.select().from(mockupJobs).orderBy(mockupJobs.createdAt);
  }

  async getJobsByBatchId(batchId: string): Promise<MockupJob[]> {
    return db.select().from(mockupJobs).where(eq(mockupJobs.batchId, batchId)).orderBy(mockupJobs.createdAt);
  }

  async getNextQueuedJob(): Promise<MockupJob | undefined> {
    const [result] = await db.select().from(mockupJobs)
      .where(eq(mockupJobs.status, "queued"))
      .orderBy(asc(mockupJobs.createdAt))
      .limit(1);
    return result;
  }

  async updateJobStatus(id: number, status: string, error?: string | null): Promise<MockupJob> {
    const updates: any = { status };
    if (status === "processing") updates.startedAt = new Date();
    if (status === "completed" || status === "failed") updates.completedAt = new Date();
    if (error !== undefined) updates.error = error;
    const [result] = await db.update(mockupJobs).set(updates).where(eq(mockupJobs.id, id)).returning();
    return result;
  }

  async incrementJobAttempts(id: number): Promise<MockupJob> {
    const [result] = await db.update(mockupJobs)
      .set({ attempts: sql`${mockupJobs.attempts} + 1` })
      .where(eq(mockupJobs.id, id))
      .returning();
    return result;
  }

  async getJobStatusCounts(): Promise<Record<string, number>> {
    const rows = await db.select({
      status: mockupJobs.status,
      count: sql<number>`count(*)::int`,
    }).from(mockupJobs).groupBy(mockupJobs.status);
    const counts: Record<string, number> = { queued: 0, processing: 0, completed: 0, failed: 0 };
    for (const row of rows) {
      counts[row.status] = row.count;
    }
    return counts;
  }
}

export const storage = new DatabaseStorage();
