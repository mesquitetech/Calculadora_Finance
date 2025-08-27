import {
  leasingQuotations,
  userSettings,
  InsertLeasingQuotation,
  LeasingQuotation,
  InsertUserSettings,
  UserSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface simplificada para operaciones de almacenamiento de leasing
export interface IStorage {
  // Operaciones de cotizaciones de leasing
  getLeasingQuotation(id: number): Promise<LeasingQuotation | undefined>;
  getLeasingQuotationByFolio(folio: string): Promise<LeasingQuotation | undefined>;
  createLeasingQuotation(quotation: InsertLeasingQuotation): Promise<LeasingQuotation>;
  updateLeasingQuotation(id: number, quotationData: Partial<InsertLeasingQuotation>): Promise<LeasingQuotation>;
  deleteLeasingQuotation(id: number): Promise<void>;
  getAllLeasingQuotations(): Promise<LeasingQuotation[]>;

  // Operaciones de configuración de usuario
  getUserSettings(sessionId: string): Promise<UserSettings | undefined>;
  createOrUpdateUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
}

// Implementación de almacenamiento en memoria (para desarrollo/testing)
export class MemStorage implements IStorage {
  private leasingQuotations: Map<number, LeasingQuotation> = new Map();
  private userSettings: Map<number, UserSettings> = new Map();

  private quotationId: number = 1;
  private userSettingsId: number = 1;

  // Métodos de cotizaciones de leasing
  async getLeasingQuotation(id: number): Promise<LeasingQuotation | undefined> {
    return this.leasingQuotations.get(id);
  }

  async getLeasingQuotationByFolio(folio: string): Promise<LeasingQuotation | undefined> {
    return Array.from(this.leasingQuotations.values()).find(quotation => quotation.folio === folio);
  }

  async createLeasingQuotation(insertQuotation: InsertLeasingQuotation): Promise<LeasingQuotation> {
    const id = this.quotationId++;
    const now = new Date();
    const quotation: LeasingQuotation = {
      ...insertQuotation,
      id,
      createdAt: now,
      updatedAt: now,
      // Campos opcionales con valores por defecto
      firstYearInsurance: insertQuotation.firstYearInsurance || "0.00",
      openingCommission: insertQuotation.openingCommission || "0.00",
      adminExpenses: insertQuotation.adminExpenses || "0.00",
      clientMonthlyPayment: null,
      lessorMonthlyPayment: null,
      grossMonthlyMargin: null,
      totalProfit: null,
      profitMarginPercentage: null,
    };
    this.leasingQuotations.set(id, quotation);
    return quotation;
  }

  async updateLeasingQuotation(id: number, quotationData: Partial<InsertLeasingQuotation>): Promise<LeasingQuotation> {
    const quotation = this.leasingQuotations.get(id);
    if (!quotation) {
      throw new Error(`Leasing quotation with id ${id} not found`);
    }
    const updatedQuotation = { 
      ...quotation, 
      ...quotationData, 
      updatedAt: new Date() 
    };
    this.leasingQuotations.set(id, updatedQuotation as LeasingQuotation);
    return updatedQuotation as LeasingQuotation;
  }

  async deleteLeasingQuotation(id: number): Promise<void> {
    this.leasingQuotations.delete(id);
  }

  async getAllLeasingQuotations(): Promise<LeasingQuotation[]> {
    return Array.from(this.leasingQuotations.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Métodos de configuración de usuario
  async getUserSettings(sessionId: string): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values()).find(settings => settings.sessionId === sessionId);
  }

  async createOrUpdateUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const existing = await this.getUserSettings(insertSettings.sessionId);
    const now = new Date();

    if (existing) {
      const updated: UserSettings = {
        ...existing,
        ...insertSettings,
        updatedAt: now
      };
      this.userSettings.set(existing.id, updated);
      return updated;
    } else {
      const id = this.userSettingsId++;
      const settings: UserSettings = {
        ...insertSettings,
        id,
        createdAt: now,
        updatedAt: now
      };
      this.userSettings.set(id, settings);
      return settings;
    }
  }
}

// Implementación de almacenamiento en base de datos (para producción)
export class DatabaseStorage implements IStorage {
  // Métodos de cotizaciones de leasing
  async getLeasingQuotation(id: number): Promise<LeasingQuotation | undefined> {
    return await db.query.leasingQuotations.findFirst({ where: eq(leasingQuotations.id, id) });
  }

  async getLeasingQuotationByFolio(folio: string): Promise<LeasingQuotation | undefined> {
    return await db.query.leasingQuotations.findFirst({ where: eq(leasingQuotations.folio, folio) });
  }

  async createLeasingQuotation(insertQuotation: InsertLeasingQuotation): Promise<LeasingQuotation> {
    const [quotation] = await db.insert(leasingQuotations).values(insertQuotation).returning();
    return quotation;
  }

  async updateLeasingQuotation(id: number, quotationData: Partial<InsertLeasingQuotation>): Promise<LeasingQuotation> {
    const [updated] = await db.update(leasingQuotations)
      .set({ ...quotationData, updatedAt: new Date() })
      .where(eq(leasingQuotations.id, id))
      .returning();
    return updated;
  }

  async deleteLeasingQuotation(id: number): Promise<void> {
    await db.delete(leasingQuotations).where(eq(leasingQuotations.id, id));
  }

  async getAllLeasingQuotations(): Promise<LeasingQuotation[]> {
    return await db.query.leasingQuotations.findMany({
      orderBy: (leasingQuotations, { desc }) => [desc(leasingQuotations.createdAt)],
    });
  }

  // Métodos de configuración de usuario
  async getUserSettings(sessionId: string): Promise<UserSettings | undefined> {
    return await db.query.userSettings.findFirst({ where: eq(userSettings.sessionId, sessionId) });
  }

  async createOrUpdateUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const existing = await this.getUserSettings(insertSettings.sessionId);

    if (existing) {
      const [updated] = await db.update(userSettings)
        .set({ ...insertSettings, updatedAt: new Date() })
        .where(eq(userSettings.sessionId, insertSettings.sessionId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userSettings).values(insertSettings).returning();
      return created;
    }
  }
}

// Crear y exportar una instancia única de almacenamiento para que la aplicación use
export const storage: IStorage = new MemStorage(); // Cambiar a DatabaseStorage para producción