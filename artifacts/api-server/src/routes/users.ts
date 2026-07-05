import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.clerkUserId = userId;
  next();
}

// GET /api/users/me
router.get("/me", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const clerkId = req.clerkUserId;
    const user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
    if (user.length === 0) { res.status(404).json({ error: "User not found. Please complete registration." }); return; }
    res.json(user[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/users/sync — upsert user from Clerk session
router.post("/sync", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const clerkId = req.clerkUserId;
    const { name, email } = req.body;
    if (!name || !email) { res.status(400).json({ error: "name and email required" }); return; }

    const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
    if (existing.length > 0) {
      const updated = await db.update(usersTable).set({ name, email }).where(eq(usersTable.clerkId, clerkId)).returning();
      res.json(updated[0]);
      return;
    }
    const created = await db.insert(usersTable).values({ clerkId, name, email }).returning();
    res.status(201).json(created[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users
router.get("/", async (req, res): Promise<void> => {
  try {
    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
    res.json(users);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/:userId
router.get("/:userId", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.userId);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid userId" }); return; }
    const user = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (user.length === 0) { res.status(404).json({ error: "User not found" }); return; }
    res.json(user[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
