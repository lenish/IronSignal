import { createClient, type Client, type InStatement } from "@libsql/client";
import type { NewsItem, DailySummary } from "./types";

let _client: Client | null = null;

function getClient(): Client {
  if (!_client) {
    const url = process.env.TURSO_DATABASE_URL ?? "file:ironsignal.db";
    _client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

let _schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!_schemaReady) {
    _schemaReady = getClient().batch(
      [
        `CREATE TABLE IF NOT EXISTS news (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          link TEXT NOT NULL,
          source TEXT NOT NULL,
          published_at TEXT NOT NULL,
          description TEXT,
          commodity TEXT DEFAULT 'general',
          relevance_score REAL DEFAULT 0.5,
          created_at TEXT DEFAULT (datetime('now'))
        )`,
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_news_link ON news(link)`,
        `CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at DESC)`,
        `CREATE INDEX IF NOT EXISTS idx_news_commodity ON news(commodity)`,
        `CREATE TABLE IF NOT EXISTS summaries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL UNIQUE,
          content TEXT NOT NULL,
          commodities TEXT DEFAULT '',
          created_at TEXT DEFAULT (datetime('now'))
        )`,
      ],
      "write"
    ).then(async () => {
      try {
        await getClient().execute(
          "ALTER TABLE news ADD COLUMN relevance_score REAL DEFAULT 0.5"
        );
      } catch {
      }
    });
  }
  return _schemaReady;
}

export async function insertNews(items: NewsItem[]): Promise<number> {
  await ensureSchema();
  const client = getClient();

  const stmts: InStatement[] = items.map((item) => ({
    sql: `INSERT OR IGNORE INTO news (id, title, link, source, published_at, description, commodity, relevance_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      item.id,
      item.title,
      item.link,
      item.source,
      item.publishedAt,
      item.description ?? null,
      item.commodity ?? "general",
      item.relevanceScore ?? 0.5,
    ],
  }));

  const batchSize = 20;
  let inserted = 0;
  for (let i = 0; i < stmts.length; i += batchSize) {
    const batch = stmts.slice(i, i + batchSize);
    const results = await client.batch(batch, "write");
    inserted += results.reduce((sum, r) => sum + Number(r.rowsAffected), 0);
  }
  return inserted;
}

export async function getNews(options: {
  commodity?: string;
  limit?: number;
  offset?: number;
  since?: string;
  minRelevance?: number;
}): Promise<NewsItem[]> {
  await ensureSchema();
  const { commodity, limit = 50, offset = 0, since, minRelevance = 0 } = options;

  const conditions: string[] = [];
  const args: (string | number)[] = [];

  const isAllView = !commodity || commodity === "all";

  if (!isAllView) {
    conditions.push("commodity = ?");
    args.push(commodity);
  }
  if (since) {
    conditions.push("published_at > ?");
    args.push(since);
  }
  if (minRelevance > 0) {
    conditions.push("relevance_score >= ?");
    args.push(minRelevance);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy = isAllView
    ? "ORDER BY published_at DESC"
    : "ORDER BY relevance_score DESC, published_at DESC";
  args.push(limit, offset);

  const result = await getClient().execute({
    sql: `SELECT id, title, link, source, published_at as publishedAt,
                 description, commodity, relevance_score as relevanceScore, created_at as createdAt
          FROM news ${where}
          ${orderBy}
          LIMIT ? OFFSET ?`,
    args,
  });

  return result.rows as unknown as NewsItem[];
}

export async function getNewsCount(commodity?: string): Promise<number> {
  await ensureSchema();

  if (commodity && commodity !== "all") {
    const result = await getClient().execute({
      sql: "SELECT COUNT(*) as count FROM news WHERE commodity = ?",
      args: [commodity],
    });
    return Number(result.rows[0].count);
  }

  const result = await getClient().execute(
    "SELECT COUNT(*) as count FROM news"
  );
  return Number(result.rows[0].count);
}

export async function insertSummary(
  date: string,
  content: string,
  commodities: string
): Promise<void> {
  await ensureSchema();
  await getClient().execute({
    sql: "INSERT OR REPLACE INTO summaries (date, content, commodities) VALUES (?, ?, ?)",
    args: [date, content, commodities],
  });
}

export async function getSummary(
  date: string
): Promise<DailySummary | null> {
  await ensureSchema();
  const result = await getClient().execute({
    sql: `SELECT id, date, content, commodities, created_at as createdAt
          FROM summaries WHERE date = ?`,
    args: [date],
  });
  return (result.rows[0] as unknown as DailySummary) ?? null;
}

export async function getRecentSummaries(
  limit = 7
): Promise<DailySummary[]> {
  await ensureSchema();
  const result = await getClient().execute({
    sql: `SELECT id, date, content, commodities, created_at as createdAt
          FROM summaries ORDER BY date DESC LIMIT ?`,
    args: [limit],
  });
  return result.rows as unknown as DailySummary[];
}

export async function getNewsByDateRange(
  startDate: string,
  endDate: string
): Promise<NewsItem[]> {
  await ensureSchema();
  const result = await getClient().execute({
    sql: `SELECT id, title, link, source, published_at as publishedAt,
                 description, commodity, relevance_score as relevanceScore, created_at as createdAt
          FROM news
          WHERE published_at >= ? AND published_at < ?
          ORDER BY published_at DESC`,
    args: [startDate, endDate],
  });
  return result.rows as unknown as NewsItem[];
}
