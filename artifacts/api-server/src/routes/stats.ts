import { Router } from "express";
import { db, criesTable, usersTable } from "@workspace/db";
import { eq, and, gte, lte, sql, isNotNull } from "drizzle-orm";

const router = Router();

// GET /api/stats/heatmap
router.get("/heatmap", async (req, res) => {
  try {
    const { userId, year } = req.query;
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

    const startDate = new Date(`${targetYear}-01-01T00:00:00Z`);
    const endDate = new Date(`${targetYear}-12-31T23:59:59Z`);

    let baseQuery = db
      .select({
        date: sql<string>`DATE(${criesTable.occurredAt})`.as("date"),
        count: sql<number>`COUNT(*)::int`.as("count"),
        totalIntensity: sql<number>`SUM(${criesTable.intensity})::int`.as("totalIntensity"),
      })
      .from(criesTable)
      .where(
        userId
          ? and(
              gte(criesTable.occurredAt, startDate),
              lte(criesTable.occurredAt, endDate),
              eq(criesTable.userId, parseInt(userId as string))
            )
          : and(gte(criesTable.occurredAt, startDate), lte(criesTable.occurredAt, endDate))
      )
      .groupBy(sql`DATE(${criesTable.occurredAt})`)
      .orderBy(sql`DATE(${criesTable.occurredAt})`);

    const rows = await baseQuery;
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// GET /api/stats/trends
router.get("/trends", async (req, res) => {
  try {
    const { userId } = req.query;
    const whereClause = userId ? eq(criesTable.userId, parseInt(userId as string)) : sql`1=1`;

    const [byWeekdayRaw, byHourRaw, byTypeRaw, byLocationRaw, aloneRaw] = await Promise.all([
      db
        .select({
          weekday: sql<number>`EXTRACT(DOW FROM ${criesTable.occurredAt})::int`.as("weekday"),
          count: sql<number>`COUNT(*)::int`.as("count"),
          avgIntensity: sql<number>`AVG(${criesTable.intensity})::float`.as("avgIntensity"),
        })
        .from(criesTable)
        .where(whereClause)
        .groupBy(sql`EXTRACT(DOW FROM ${criesTable.occurredAt})`)
        .orderBy(sql`EXTRACT(DOW FROM ${criesTable.occurredAt})`),

      db
        .select({
          hour: sql<number>`EXTRACT(HOUR FROM ${criesTable.occurredAt})::int`.as("hour"),
          count: sql<number>`COUNT(*)::int`.as("count"),
        })
        .from(criesTable)
        .where(whereClause)
        .groupBy(sql`EXTRACT(HOUR FROM ${criesTable.occurredAt})`)
        .orderBy(sql`EXTRACT(HOUR FROM ${criesTable.occurredAt})`),

      db
        .select({
          cryType: criesTable.cryType,
          count: sql<number>`COUNT(*)::int`.as("count"),
          avgIntensity: sql<number>`AVG(${criesTable.intensity})::float`.as("avgIntensity"),
        })
        .from(criesTable)
        .where(and(whereClause, isNotNull(criesTable.cryType)))
        .groupBy(criesTable.cryType)
        .orderBy(sql`COUNT(*) DESC`),

      db
        .select({
          location: criesTable.location,
          count: sql<number>`COUNT(*)::int`.as("count"),
        })
        .from(criesTable)
        .where(and(whereClause, isNotNull(criesTable.location)))
        .groupBy(criesTable.location)
        .orderBy(sql`COUNT(*) DESC`),

      db
        .select({
          wasAlone: criesTable.wasAlone,
          count: sql<number>`COUNT(*)::int`.as("count"),
        })
        .from(criesTable)
        .where(and(whereClause, isNotNull(criesTable.wasAlone)))
        .groupBy(criesTable.wasAlone),
    ]);

    const byWeekday = byWeekdayRaw.map((r) => ({
      weekday: WEEKDAYS[r.weekday],
      count: r.count,
      avgIntensity: Math.round(r.avgIntensity * 10) / 10,
    }));

    const aloneVsCompany = { alone: 0, withOthers: 0 };
    for (const r of aloneRaw) {
      if (r.wasAlone) aloneVsCompany.alone += r.count;
      else aloneVsCompany.withOthers += r.count;
    }

    // Generate a peak insight
    let peakInsight: string | null = null;
    if (byWeekday.length > 0) {
      const topDay = byWeekday.reduce((a, b) => (a.count > b.count ? a : b));
      const topHour = byHourRaw.length > 0 ? byHourRaw.reduce((a, b) => (a.count > b.count ? a : b)) : null;
      if (topHour) {
        const period = topHour.hour < 12 ? "mañana" : topHour.hour < 18 ? "tarde" : "noche";
        peakInsight = `Tus picos de lloro son los ${topDay.weekday} por la ${period}`;
      }
    }

    res.json({
      byWeekday,
      byHour: byHourRaw,
      byType: byTypeRaw.map((r) => ({ ...r, cryType: r.cryType ?? "Sin tipo", avgIntensity: Math.round((r.avgIntensity ?? 0) * 10) / 10 })),
      byLocation: byLocationRaw.map((r) => ({ location: r.location ?? "Sin lugar", count: r.count })),
      aloneVsCompany,
      peakInsight,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// GET /api/stats/wrapped
router.get("/wrapped", async (req, res) => {
  try {
    const { userId, year } = req.query;
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
    const startDate = new Date(`${targetYear}-01-01T00:00:00Z`);
    const endDate = new Date(`${targetYear}-12-31T23:59:59Z`);

    const whereClause = userId
      ? and(gte(criesTable.occurredAt, startDate), lte(criesTable.occurredAt, endDate), eq(criesTable.userId, parseInt(userId as string)))
      : and(gte(criesTable.occurredAt, startDate), lte(criesTable.occurredAt, endDate));

    const [totals, byMonth, byType, byDuration] = await Promise.all([
      db
        .select({
          totalCries: sql<number>`COUNT(*)::int`,
          avgIntensity: sql<number>`AVG(${criesTable.intensity})::float`,
          longestSession: sql<number>`MAX(${criesTable.durationMinutes})::int`,
          totalDuration: sql<number>`SUM(${criesTable.durationMinutes})::int`,
        })
        .from(criesTable)
        .where(whereClause),

      db
        .select({
          month: sql<number>`EXTRACT(MONTH FROM ${criesTable.occurredAt})::int`.as("month"),
          count: sql<number>`COUNT(*)::int`.as("count"),
        })
        .from(criesTable)
        .where(whereClause)
        .groupBy(sql`EXTRACT(MONTH FROM ${criesTable.occurredAt})`)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(1),

      db
        .select({
          cryType: criesTable.cryType,
          count: sql<number>`COUNT(*)::int`.as("count"),
        })
        .from(criesTable)
        .where(and(whereClause, isNotNull(criesTable.cryType)))
        .groupBy(criesTable.cryType)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(1),

      db
        .select({
          date: sql<string>`DATE(${criesTable.occurredAt})`.as("date"),
          totalIntensity: sql<number>`SUM(${criesTable.intensity})::int`.as("totalIntensity"),
        })
        .from(criesTable)
        .where(whereClause)
        .groupBy(sql`DATE(${criesTable.occurredAt})`)
        .orderBy(sql`SUM(${criesTable.intensity}) DESC`)
        .limit(1),
    ]);

    const t = totals[0];
    const mostEmotionalMonth = byMonth[0] ? MONTHS[(byMonth[0].month ?? 1) - 1] : "N/A";
    const topCryType = byType[0]?.cryType ?? null;
    const mostEmotionalDay = byDuration[0]?.date ?? null;

    // Compute streak (simple approach)
    const dailyCounts = await db
      .select({ date: sql<string>`DATE(${criesTable.occurredAt})`.as("date") })
      .from(criesTable)
      .where(whereClause)
      .groupBy(sql`DATE(${criesTable.occurredAt})`)
      .orderBy(sql`DATE(${criesTable.occurredAt})`);

    let longestStreak = 0;
    let currentStreak = 0;
    let prevDate: Date | null = null;
    for (const row of dailyCounts) {
      const d = new Date(row.date);
      if (prevDate) {
        const diff = (d.getTime() - prevDate.getTime()) / 86400000;
        if (diff === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
      prevDate = d;
    }

    const totalCries = t?.totalCries ?? 0;
    const topInsight = totalCries > 0
      ? `Este año has llorado ${totalCries} ${totalCries === 1 ? "vez" : "veces"}${topCryType ? `, principalmente por ${topCryType}` : ""}`
      : "Aún no hay lloros registrados este año";

    res.json({
      year: targetYear,
      totalCries,
      avgIntensity: Math.round((t?.avgIntensity ?? 0) * 10) / 10,
      mostEmotionalMonth,
      topCryType,
      longestSessionMinutes: t?.longestSession ?? null,
      longestStreak,
      mostEmotionalDay,
      totalDurationMinutes: t?.totalDuration ?? null,
      topInsight,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/stats/overview
router.get("/overview", async (req, res) => {
  try {
    const { userId } = req.query;
    const whereClause = userId ? eq(criesTable.userId, parseInt(userId as string)) : sql`1=1`;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totals, byType, thisMonthCount, thisWeekCount, topUser] = await Promise.all([
      db
        .select({
          totalCries: sql<number>`COUNT(*)::int`,
          avgIntensity: sql<number>`AVG(${criesTable.intensity})::float`,
        })
        .from(criesTable)
        .where(whereClause),

      db
        .select({ cryType: criesTable.cryType, count: sql<number>`COUNT(*)::int` })
        .from(criesTable)
        .where(and(whereClause, isNotNull(criesTable.cryType)))
        .groupBy(criesTable.cryType)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(1),

      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(criesTable)
        .where(and(whereClause, gte(criesTable.occurredAt, startOfMonth))),

      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(criesTable)
        .where(and(whereClause, gte(criesTable.occurredAt, startOfWeek))),

      !userId
        ? db
            .select({ name: usersTable.name, count: sql<number>`COUNT(*)::int` })
            .from(criesTable)
            .innerJoin(usersTable, eq(criesTable.userId, usersTable.id))
            .groupBy(usersTable.name)
            .orderBy(sql`COUNT(*) DESC`)
            .limit(1)
        : Promise.resolve([]),
    ]);

    res.json({
      totalCries: totals[0]?.totalCries ?? 0,
      avgIntensity: Math.round((totals[0]?.avgIntensity ?? 0) * 10) / 10,
      thisMonth: thisMonthCount[0]?.count ?? 0,
      thisWeek: thisWeekCount[0]?.count ?? 0,
      topCryType: byType[0]?.cryType ?? null,
      mostActiveUser: (topUser as any[])[0]?.name ?? null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
