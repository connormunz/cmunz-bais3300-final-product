import { Router, type IRouter } from "express";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { db, medicationLogsTable } from "@workspace/db";
import {
  LogTodayBody,
  GetLogHistoryQueryParams,
} from "@workspace/api-zod";

const LocalDateQueryParams = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD")
    .refine((val: string) => !isNaN(Date.parse(val + "T00:00:00Z")), {
      message: "date must be a valid calendar date",
    })
    .optional(),
});

const router: IRouter = Router();

function getUtcTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDateNDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

type LogRow = typeof medicationLogsTable.$inferSelect;

function serializeLog(log: LogRow) {
  return {
    id: log.id,
    date: log.date,
    status: log.status,
    loggedAt: log.loggedAt,
    createdAt: log.createdAt,
  };
}

router.get("/logs/today", async (req, res): Promise<void> => {
  const qp = LocalDateQueryParams.safeParse(req.query);
  if (!qp.success) {
    res.status(400).json({ error: qp.error.flatten().fieldErrors });
    return;
  }
  const today = qp.data.date ?? getUtcTodayDate();

  const [log] = await db
    .select()
    .from(medicationLogsTable)
    .where(eq(medicationLogsTable.date, today));

  res.json({ log: log ? serializeLog(log) : null });
});

router.post("/logs/today", async (req, res): Promise<void> => {
  const parsed = LogTodayBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status, override } = parsed.data;

  const clientDate = parsed.data.date;
  const targetDate =
    clientDate instanceof Date
      ? clientDate.toISOString().slice(0, 10)
      : typeof clientDate === "string"
        ? clientDate
        : getUtcTodayDate();

  const now = new Date();

  const [existing] = await db
    .select()
    .from(medicationLogsTable)
    .where(eq(medicationLogsTable.date, targetDate));

  if (existing && !override) {
    res.status(409).json({
      error: "Already logged today. Set override to true to change status.",
      existingLog: serializeLog(existing),
    });
    return;
  }

  let log: LogRow;
  if (existing) {
    const [updated] = await db
      .update(medicationLogsTable)
      .set({ status, loggedAt: now })
      .where(eq(medicationLogsTable.id, existing.id))
      .returning();
    log = updated;
  } else {
    const [inserted] = await db
      .insert(medicationLogsTable)
      .values({ date: targetDate, status, loggedAt: now })
      .returning();
    log = inserted;
  }

  res.json(serializeLog(log));
});

router.get("/logs/history", async (req, res): Promise<void> => {
  const queryParams = GetLogHistoryQueryParams.safeParse(req.query);
  if (!queryParams.success) {
    res.status(400).json({ error: queryParams.error.message });
    return;
  }

  const { limit, offset } = queryParams.data;

  const [logs, countResult] = await Promise.all([
    db
      .select()
      .from(medicationLogsTable)
      .orderBy(desc(medicationLogsTable.date))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(medicationLogsTable),
  ]);

  res.json({
    logs: logs.map(serializeLog),
    total: countResult[0]?.count ?? 0,
    limit,
    offset,
  });
});

router.get("/logs/summary", async (req, res): Promise<void> => {
  const thirtyDaysAgo = getDateNDaysAgo(29);
  const today = getUtcTodayDate();

  const allLogs = await db
    .select({
      date: medicationLogsTable.date,
      status: medicationLogsTable.status,
    })
    .from(medicationLogsTable)
    .orderBy(desc(medicationLogsTable.date));

  const logMap = new Map(allLogs.map((l) => [l.date, l.status]));

  const last30Logs = await db
    .select({
      date: medicationLogsTable.date,
      status: medicationLogsTable.status,
    })
    .from(medicationLogsTable)
    .where(
      and(
        gte(medicationLogsTable.date, thirtyDaysAgo),
        lte(medicationLogsTable.date, today),
      ),
    );

  const loggedDaysLast30 = last30Logs.length;
  const takenDaysLast30 = last30Logs.filter((l) => l.status === "taken").length;
  const adherenceRateLast30 = Math.round((loggedDaysLast30 / 30) * 100);

  let currentStreak = 0;
  const checkDate = new Date();
  checkDate.setUTCHours(0, 0, 0, 0);
  while (true) {
    const dateStr = checkDate.toISOString().slice(0, 10);
    if (logMap.has(dateStr)) {
      currentStreak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    } else {
      break;
    }
  }

  let longestStreak = 0;
  let runningStreak = 0;
  const sortedDates = [...logMap.keys()].sort();
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      runningStreak = 1;
    } else {
      const prev = new Date(sortedDates[i - 1] + "T00:00:00Z");
      const curr = new Date(sortedDates[i] + "T00:00:00Z");
      const diffDays =
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      runningStreak = diffDays === 1 ? runningStreak + 1 : 1;
    }
    if (runningStreak > longestStreak) longestStreak = runningStreak;
  }

  res.json({
    currentStreak,
    longestStreak,
    loggedDaysLast30,
    takenDaysLast30,
    adherenceRateLast30,
  });
});

export default router;
