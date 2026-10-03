import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { deviceRegistryRecords } from "@/db/schema";
import { safeId } from "./api";
import { registrationToSmartDeviceObject, type NormalizedDeviceRegistration } from "./device-connect";

export async function registerDevice(registration: NormalizedDeviceRegistration, registrantSubject: string) {
  const db = await getDb();
  const id = safeId("dev");
  const now = new Date().toISOString();
  await db.insert(deviceRegistryRecords).values({
    id,
    registrantSubject,
    schemaVersion: 1,
    recordKind: "instance",
    manufacturer: registration.manufacturer,
    model: registration.model,
    variant: registration.variant,
    category: registration.category,
    capabilityIdsJson: JSON.stringify(registration.capabilityIds),
    externalIdentifiersJson: JSON.stringify(registration.externalIdentifiers),
    connectionJson: JSON.stringify(registration.connection),
    trustState: "registered",
    meshReadiness: registration.meshReadiness,
    createdAt: now,
    updatedAt: now,
  });
  return registrationToSmartDeviceObject(id, registration);
}

export async function listRegisteredDevices(registrantSubject: string, limit = 30) {
  const db = await getDb();
  const rows = await db.select().from(deviceRegistryRecords).where(eq(deviceRegistryRecords.registrantSubject, registrantSubject)).orderBy(desc(deviceRegistryRecords.updatedAt)).limit(Math.min(Math.max(limit, 1), 50));
  return rows.map((row) => registrationToSmartDeviceObject(row.id, {
    schemaVersion: 1,
    manufacturer: row.manufacturer,
    model: row.model,
    variant: row.variant,
    category: row.category,
    capabilityIds: JSON.parse(row.capabilityIdsJson),
    externalIdentifiers: JSON.parse(row.externalIdentifiersJson),
    connection: JSON.parse(row.connectionJson),
    trustState: "registered",
    claimState: "unclaimed",
    meshReadiness: row.meshReadiness,
  }));
}
