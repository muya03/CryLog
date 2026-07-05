import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, criesTable, usersTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { CreateCryBody, UpdateCryBody } from "@workspace/api-zod";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.clerkUserId = userId;
  next();
}

async function getDbUser(clerkId: string) {
  const users = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
  return users[0] ?? null;
}

// GET /api/cries
router.get("/", async (req, res): Promise<void> => {
  try {
    const { userId, limit, offset } = req.query;
    const lim = limit ? parseInt(limit as string) : 50;
    const off = offset ? parseInt(offset as string) : 0;

    const cols = {
      id: criesTable.id,
      userId: criesTable.userId,
      userName: usersTable.name,
      intensity: criesTable.intensity,
      occurredAt: criesTable.occurredAt,
      durationMinutes: criesTable.durationMinutes,
      reason: criesTable.reason,
      location: criesTable.location,
      wasAlone: criesTable.wasAlone,
      cryType: criesTable.cryType,
      trigger: criesTable.trigger,
      notes: criesTable.notes,
      createdAt: criesTable.createdAt,
    };

    const rows = userId
      ? await db.select(cols).from(criesTable).innerJoin(usersTable, eq(criesTable.userId, usersTable.id))
          .where(eq(criesTable.userId, parseInt(userId as string)))
          .orderBy(desc(criesTable.occurredAt)).limit(lim).offset(off)
      : await db.select(cols).from(criesTable).innerJoin(usersTable, eq(criesTable.userId, usersTable.id))
          .orderBy(desc(criesTable.occurredAt)).limit(lim).offset(off);

    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/cries
router.post("/", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const parsed = CreateCryBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const dbUser = await getDbUser(req.clerkUserId);
    if (!dbUser) { res.status(404).json({ error: "User not found. Please sync profile first." }); return; }

    const { intensity, occurredAt, durationMinutes, reason, location, wasAlone, cryType, trigger, notes } = parsed.data;

    const inserted = await db.insert(criesTable).values({
      userId: dbUser.id,
      intensity,
      occurredAt: new Date(occurredAt),
      durationMinutes: durationMinutes ?? null,
      reason: reason ?? null,
      location: location ?? null,
      wasAlone: wasAlone ?? null,
      cryType: cryType ?? null,
      trigger: trigger ?? null,
      notes: notes ?? null,
    }).returning();

    res.status(201).json({ ...inserted[0], userName: dbUser.name });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/cries/:id
router.get("/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const rows = await db.select({
      id: criesTable.id, userId: criesTable.userId, userName: usersTable.name,
      intensity: criesTable.intensity, occurredAt: criesTable.occurredAt,
      durationMinutes: criesTable.durationMinutes, reason: criesTable.reason,
      location: criesTable.location, wasAlone: criesTable.wasAlone,
      cryType: criesTable.cryType, trigger: criesTable.trigger,
      notes: criesTable.notes, createdAt: criesTable.createdAt,
    }).from(criesTable).innerJoin(usersTable, eq(criesTable.userId, usersTable.id))
      .where(eq(criesTable.id, id)).limit(1);

    if (rows.length === 0) { res.status(404).json({ error: "Cry not found" }); return; }
    res.json(rows[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/cries/:id
router.patch("/:id", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const parsed = UpdateCryBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const dbUser = await getDbUser(req.clerkUserId);
    if (!dbUser) { res.status(404).json({ error: "User not found" }); return; }

    const existing = await db.select().from(criesTable)
      .where(and(eq(criesTable.id, id), eq(criesTable.userId, dbUser.id))).limit(1);
    if (existing.length === 0) { res.status(404).json({ error: "Cry not found or not yours" }); return; }

    const updateData: Partial<typeof criesTable.$inferInsert> = {};
    const d = parsed.data;
    if (d.intensity !== undefined && d.intensity !== null) updateData.intensity = d.intensity;
    if (d.occurredAt !== undefined && d.occurredAt !== null) updateData.occurredAt = new Date(d.occurredAt);
    if (d.durationMinutes !== undefined) updateData.durationMinutes = d.durationMinutes;
    if (d.reason !== undefined) updateData.reason = d.reason;
    if (d.location !== undefined) updateData.location = d.location;
    if (d.wasAlone !== undefined) updateData.wasAlone = d.wasAlone;
    if (d.cryType !== undefined) updateData.cryType = d.cryType;
    if (d.trigger !== undefined) updateData.trigger = d.trigger;
    if (d.notes !== undefined) updateData.notes = d.notes;

    const updated = await db.update(criesTable).set(updateData).where(eq(criesTable.id, id)).returning();
    res.json({ ...updated[0], userName: dbUser.name });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/cries/:id
router.delete("/:id", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const dbUser = await getDbUser(req.clerkUserId);
    if (!dbUser) { res.status(404).json({ error: "User not found" }); return; }

    await db.delete(criesTable).where(and(eq(criesTable.id, id), eq(criesTable.userId, dbUser.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
