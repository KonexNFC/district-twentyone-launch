import { type User, type InsertUser, type Lead, type InsertLead, type DropSettings, type InsertDropSettings, type ContactMessage, type InsertContactMessage, leads, dropSettings, users, contactMessages } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
