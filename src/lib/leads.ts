// ============================================================
// Lead capture — Supabase-backed, for the B2B model
//
// ビジネス背景:
//   このツールはユーザーから直接課金できない（非弁回避）。
//   代わりに「どの X アカウントが調べられたか」「誰が LINE に
//   登録したか」をリスト化し、提携弁護士事務所に提供する。
//
// Table schema (run in Supabase SQL editor):
//
//   create table if not exists leads (
//     id            bigserial primary key,
//     kind          text not null check (kind in ('diagnose','line_click','line_registered','x_oauth')),
//     query_username text,                -- 診断対象の X username
//     session_id    text,                 -- ブラウザ cookie で採番
//     line_user_id  text,                 -- 将来 LINE Login 導入時
//     x_user_id     text,                 -- 将来 X OAuth 導入時
//     user_agent    text,
//     ip            text,
//     referrer      text,
//     created_at    timestamptz not null default now()
//   );
//   create index if not exists leads_kind_idx      on leads(kind);
//   create index if not exists leads_created_at_idx on leads(created_at desc);
//   create index if not exists leads_session_idx   on leads(session_id);
//
// ============================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type LeadKind = "diagnose" | "line_click" | "line_registered" | "x_oauth";

export interface Attribution {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  landingPath?: string | null;
}

export interface LeadInput extends Attribution {
  kind: LeadKind;
  queryUsername?: string | null;
  sessionId?: string | null;
  lineUserId?: string | null;
  xUserId?: string | null;
  xUsername?: string | null;
  userAgent?: string | null;
  ip?: string | null;
  referrer?: string | null;
}

export interface LeadRow {
  id: number;
  kind: LeadKind;
  query_username: string | null;
  session_id: string | null;
  line_user_id: string | null;
  x_user_id: string | null;
  x_username: string | null;
  user_agent: string | null;
  ip: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  landing_path: string | null;
  created_at: string;
}

// In-memory fallback — used when Supabase env vars are not configured.
// Purely for dev / local smoke-testing; resets on server restart.
const memStore: LeadRow[] = [];
let memSeq = 1;

let supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  supabase = createClient(url, key, { auth: { persistSession: false } });
  return supabase;
}

export async function recordLead(input: LeadInput): Promise<void> {
  // query_username は case-insensitive で集計したいので、保存時に小文字化して統一する。
  // 表示用のオリジナルケースは diagnose_cache.profile.username 側で保持される。
  const normalizedQueryUsername =
    input.queryUsername ? input.queryUsername.toLowerCase() : null;

  const row = {
    kind: input.kind,
    query_username: normalizedQueryUsername,
    session_id: input.sessionId ?? null,
    line_user_id: input.lineUserId ?? null,
    x_user_id: input.xUserId ?? null,
    x_username: input.xUsername ?? null,
    user_agent: input.userAgent ?? null,
    ip: input.ip ?? null,
    referrer: input.referrer ?? null,
    utm_source: input.utmSource ?? null,
    utm_medium: input.utmMedium ?? null,
    utm_campaign: input.utmCampaign ?? null,
    utm_content: input.utmContent ?? null,
    utm_term: input.utmTerm ?? null,
    landing_path: input.landingPath ?? null,
  };

  const sb = getSupabase();
  if (!sb) {
    memStore.push({
      id: memSeq++,
      ...row,
      created_at: new Date().toISOString(),
    });
    return;
  }
  const { error } = await sb.from("leads").insert(row);
  if (error) {
    // Do not throw — lead tracking must never break the user-facing flow.
    console.warn("[leads] insert failed:", error.message);
  }
}

// ------------------------------------------------------------
// Search / filter API — used by /admin/leads
// ------------------------------------------------------------
export interface SearchLeadsOptions {
  kind?: LeadKind;
  username?: string | null;      // ILIKE match on query_username
  campaign?: string | null;      // exact match on utm_campaign
  from?: string | null;          // ISO date
  to?: string | null;            // ISO date
  limit?: number;
  offset?: number;
}

export interface SearchLeadsResult {
  rows: LeadRow[];
  total: number;
}

export async function searchLeads(
  opts: SearchLeadsOptions = {},
): Promise<SearchLeadsResult> {
  const limit = Math.min(opts.limit ?? 50, 500);
  const offset = Math.max(opts.offset ?? 0, 0);

  const sb = getSupabase();
  if (!sb) {
    let rows = [...memStore];
    if (opts.kind) rows = rows.filter((r) => r.kind === opts.kind);
    if (opts.username) {
      const needle = opts.username.toLowerCase();
      rows = rows.filter((r) => (r.query_username ?? "").toLowerCase().includes(needle));
    }
    if (opts.campaign) rows = rows.filter((r) => r.utm_campaign === opts.campaign);
    if (opts.from) rows = rows.filter((r) => r.created_at >= opts.from!);
    if (opts.to) rows = rows.filter((r) => r.created_at <= opts.to!);
    rows.sort((a, b) => b.id - a.id);
    return {
      rows: rows.slice(offset, offset + limit),
      total: rows.length,
    };
  }

  let q = sb
    .from("leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (opts.kind) q = q.eq("kind", opts.kind);
  if (opts.campaign) q = q.eq("utm_campaign", opts.campaign);
  if (opts.username) q = q.ilike("query_username", `%${opts.username}%`);
  if (opts.from) q = q.gte("created_at", opts.from);
  if (opts.to) q = q.lte("created_at", opts.to);

  const { data, error, count } = await q;
  if (error) {
    console.warn("[leads] search failed:", error.message);
    return { rows: [], total: 0 };
  }
  return { rows: (data ?? []) as LeadRow[], total: count ?? 0 };
}

export async function getLeadById(id: number): Promise<LeadRow | null> {
  const sb = getSupabase();
  if (!sb) {
    return memStore.find((r) => r.id === id) ?? null;
  }
  const { data, error } = await sb
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.warn("[leads] getById failed:", error.message);
    return null;
  }
  return (data ?? null) as LeadRow | null;
}

export async function getSessionTimeline(sessionId: string): Promise<LeadRow[]> {
  const sb = getSupabase();
  if (!sb) {
    return memStore
      .filter((r) => r.session_id === sessionId)
      .sort((a, b) => a.id - b.id);
  }
  const { data, error } = await sb
    .from("leads")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) {
    console.warn("[leads] session timeline failed:", error.message);
    return [];
  }
  return (data ?? []) as LeadRow[];
}

// ------------------------------------------------------------
// Daily time series
// ------------------------------------------------------------
export interface DailyPoint {
  date: string;       // yyyy-mm-dd (JST)
  diagnose: number;
  lineClick: number;
}

function formatYmdJst(d: Date): string {
  // Intl で確実に JST 日付文字列を作る
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${day}`;
}

/**
 * 日次の diagnose / line_click 件数。
 *
 * @param days  数値なら直近N日。"all" なら最古レコードから今日まで（KPIと整合する全期間表示）。
 *
 * JST 日付でバケットを切るため、since は UTC で1日広めに取得して境界の取りこぼしを防ぐ。
 */
export async function getDailySeries(days: number | "all" = 30): Promise<DailyPoint[]> {
  const now = new Date();
  const sb = getSupabase();

  // ----- 開始日の決定 -----
  let sinceMs: number;
  if (days === "all") {
    // 最古の diagnose/line_click レコードを取得して、そこから今日まで
    if (sb) {
      const { data: oldest } = await sb
        .from("leads")
        .select("created_at")
        .in("kind", ["diagnose", "line_click"])
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      sinceMs = oldest
        ? new Date((oldest as { created_at: string }).created_at).getTime()
        : now.getTime() - 29 * 24 * 60 * 60 * 1000;
    } else {
      const times = memStore.map((r) => new Date(r.created_at).getTime()).filter((n) => !Number.isNaN(n));
      sinceMs = times.length > 0 ? Math.min(...times) : now.getTime() - 29 * 24 * 60 * 60 * 1000;
    }
  } else {
    sinceMs = now.getTime() - (days - 1) * 24 * 60 * 60 * 1000;
  }

  // ----- バケット生成 (JST 日付ベース) -----
  // since と now を JST 日付として比較し、その間の全日のキーを作る。
  const buckets = new Map<string, DailyPoint>();
  const startKey = formatYmdJst(new Date(sinceMs));
  const endKey = formatYmdJst(now);
  // sinceMs から1日ずつ進めて endKey に到達するまで埋める
  let cursor = sinceMs;
  // セーフティ: 最大2年分まで (≒730 日)
  for (let i = 0; i < 730; i++) {
    const key = formatYmdJst(new Date(cursor));
    if (!buckets.has(key)) {
      buckets.set(key, { date: key, diagnose: 0, lineClick: 0 });
    }
    if (key >= endKey) break;
    cursor += 24 * 60 * 60 * 1000;
  }

  // ----- データ取得 -----
  // JST 境界をまたぐ取りこぼしを防ぐため、24時間広めに取得する。
  const fetchSinceIso = new Date(sinceMs - 24 * 60 * 60 * 1000).toISOString();

  if (!sb) {
    for (const r of memStore) {
      const key = formatYmdJst(new Date(r.created_at));
      const b = buckets.get(key);
      if (!b) continue;
      if (r.kind === "diagnose") b.diagnose += 1;
      else if (r.kind === "line_click") b.lineClick += 1;
    }
    return [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  const { data, error } = await sb
    .from("leads")
    .select("kind, created_at")
    .gte("created_at", fetchSinceIso)
    .in("kind", ["diagnose", "line_click"])
    .limit(50_000);
  if (error || !data) {
    console.warn("[leads] getDailySeries fetch failed:", error?.message);
    return [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  for (const r of data as { kind: LeadKind; created_at: string }[]) {
    const key = formatYmdJst(new Date(r.created_at));
    const b = buckets.get(key);
    if (!b) continue;
    if (r.kind === "diagnose") b.diagnose += 1;
    else if (r.kind === "line_click") b.lineClick += 1;
  }
  return [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export interface CampaignStat {
  campaign: string;
  source: string;
  diagnoses: number;
  lineClicks: number;
}

export async function getCampaignStats(limit = 8): Promise<CampaignStat[]> {
  const sb = getSupabase();
  if (!sb) {
    const map = new Map<string, CampaignStat>();
    for (const r of memStore) {
      const key = `${r.utm_campaign ?? "(direct)"}::${r.utm_source ?? "(direct)"}`;
      const entry = map.get(key) ?? {
        campaign: r.utm_campaign ?? "(direct)",
        source: r.utm_source ?? "(direct)",
        diagnoses: 0,
        lineClicks: 0,
      };
      if (r.kind === "diagnose") entry.diagnoses += 1;
      if (r.kind === "line_click") entry.lineClicks += 1;
      map.set(key, entry);
    }
    return [...map.values()]
      .sort((a, b) => b.diagnoses - a.diagnoses)
      .slice(0, limit);
  }
  // Aggregate client-side — enough for MVP volumes.
  const { data, error } = await sb
    .from("leads")
    .select("utm_campaign, utm_source, kind")
    .limit(10_000);
  if (error || !data) return [];
  const map = new Map<string, CampaignStat>();
  for (const r of data as { utm_campaign: string | null; utm_source: string | null; kind: LeadKind }[]) {
    const key = `${r.utm_campaign ?? "(direct)"}::${r.utm_source ?? "(direct)"}`;
    const entry = map.get(key) ?? {
      campaign: r.utm_campaign ?? "(direct)",
      source: r.utm_source ?? "(direct)",
      diagnoses: 0,
      lineClicks: 0,
    };
    if (r.kind === "diagnose") entry.diagnoses += 1;
    if (r.kind === "line_click") entry.lineClicks += 1;
    map.set(key, entry);
  }
  return [...map.values()]
    .sort((a, b) => b.diagnoses - a.diagnoses)
    .slice(0, limit);
}

// ------------------------------------------------------------
// Ranking — most-diagnosed accounts in a given window
// ------------------------------------------------------------
export type InsightsPeriod = "24h" | "7d" | "30d" | "all";

export interface DiagnoseRankRow {
  username: string;
  diagnoseCount: number;
  lineClickCount: number;
  uniqueSessions: number;
  firstAt: string;
  lastAt: string;
}

function periodSinceIso(period: InsightsPeriod): string | null {
  const now = Date.now();
  switch (period) {
    case "24h": return new Date(now - 24 * 60 * 60 * 1000).toISOString();
    case "7d":  return new Date(now - 7  * 24 * 60 * 60 * 1000).toISOString();
    case "30d": return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    case "all": return null;
  }
}

export async function getDiagnoseRanking(
  period: InsightsPeriod = "7d",
  limit = 50,
): Promise<DiagnoseRankRow[]> {
  const since = periodSinceIso(period);

  type RankRow = {
    query_username: string | null;
    kind: LeadKind;
    session_id: string | null;
    created_at: string;
  };

  let rows: RankRow[] = [];
  const sb = getSupabase();
  if (!sb) {
    rows = memStore
      .filter((r) => (since ? r.created_at >= since : true))
      .map((r) => ({
        query_username: r.query_username,
        kind: r.kind,
        session_id: r.session_id,
        created_at: r.created_at,
      }));
  } else {
    let q = sb
      .from("leads")
      .select("query_username, kind, session_id, created_at")
      .in("kind", ["diagnose", "line_click"])
      .not("query_username", "is", null)
      .limit(50_000);
    if (since) q = q.gte("created_at", since);
    const { data, error } = await q;
    if (error) {
      console.warn("[leads] ranking fetch failed:", error.message);
      return [];
    }
    rows = (data ?? []) as RankRow[];
  }

  const map = new Map<string, DiagnoseRankRow & { sessions: Set<string> }>();
  for (const r of rows) {
    const handle = r.query_username;
    if (!handle) continue;
    const key = handle.toLowerCase();
    let entry = map.get(key);
    if (!entry) {
      entry = {
        username: handle,
        diagnoseCount: 0,
        lineClickCount: 0,
        uniqueSessions: 0,
        firstAt: r.created_at,
        lastAt: r.created_at,
        sessions: new Set<string>(),
      };
      map.set(key, entry);
    }
    if (r.kind === "diagnose") entry.diagnoseCount += 1;
    else if (r.kind === "line_click") entry.lineClickCount += 1;
    if (r.session_id) entry.sessions.add(r.session_id);
    if (r.created_at < entry.firstAt) entry.firstAt = r.created_at;
    if (r.created_at > entry.lastAt) entry.lastAt = r.created_at;
  }

  return [...map.values()]
    .map(({ sessions, ...rest }) => ({ ...rest, uniqueSessions: sessions.size }))
    .filter((r) => r.diagnoseCount > 0)
    .sort((a, b) => {
      if (b.diagnoseCount !== a.diagnoseCount) return b.diagnoseCount - a.diagnoseCount;
      return b.lastAt.localeCompare(a.lastAt);
    })
    .slice(0, limit);
}

/** Daily diagnose / line_click time series scoped to a period. */
export async function getInsightsTrend(
  period: InsightsPeriod,
): Promise<DailyPoint[]> {
  // "all" は最古レコードから今日までの動的範囲で集計する。
  // 固定の90日だと「全期間」と謳いながら範囲外のデータが落ちるため。
  if (period === "all") return getDailySeries("all");
  const days = period === "24h" ? 1 : period === "7d" ? 7 : 30;
  return getDailySeries(days);
}

export interface ListLeadsOptions {
  kind?: LeadKind;
  limit?: number;
  offset?: number;
}

export async function listLeads(opts: ListLeadsOptions = {}): Promise<LeadRow[]> {
  const limit = Math.min(opts.limit ?? 200, 1000);
  const offset = opts.offset ?? 0;

  const sb = getSupabase();
  if (!sb) {
    let rows = [...memStore];
    if (opts.kind) rows = rows.filter((r) => r.kind === opts.kind);
    rows.sort((a, b) => b.id - a.id);
    return rows.slice(offset, offset + limit);
  }

  let q = sb
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (opts.kind) q = q.eq("kind", opts.kind);

  const { data, error } = await q;
  if (error) {
    console.warn("[leads] list failed:", error.message);
    return [];
  }
  return (data ?? []) as LeadRow[];
}

export interface LeadStats {
  totalDiagnose: number;
  totalLineClick: number;
  totalLineRegistered: number;
  totalXOauth: number;
  uniqueUsernames: number;
  last24hDiagnose: number;
}

export async function getLeadStats(): Promise<LeadStats> {
  const sb = getSupabase();
  if (!sb) {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const diag = memStore.filter((r) => r.kind === "diagnose");
    return {
      totalDiagnose: diag.length,
      totalLineClick: memStore.filter((r) => r.kind === "line_click").length,
      totalLineRegistered: memStore.filter((r) => r.kind === "line_registered").length,
      totalXOauth: memStore.filter((r) => r.kind === "x_oauth").length,
      uniqueUsernames: new Set(diag.map((r) => r.query_username).filter(Boolean)).size,
      last24hDiagnose: diag.filter((r) => new Date(r.created_at).getTime() > since).length,
    };
  }

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [diagC, lineClickC, lineRegC, xOauthC, last24C, uniqueRpc] = await Promise.all([
    sb.from("leads").select("id", { count: "exact", head: true }).eq("kind", "diagnose"),
    sb.from("leads").select("id", { count: "exact", head: true }).eq("kind", "line_click"),
    sb.from("leads").select("id", { count: "exact", head: true }).eq("kind", "line_registered"),
    sb.from("leads").select("id", { count: "exact", head: true }).eq("kind", "x_oauth"),
    sb
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("kind", "diagnose")
      .gte("created_at", dayAgo),
    // Postgres 側で count(distinct ...) する。schema.sql に同名 function を定義済み。
    // function 未デプロイ環境では rpc がエラーを返すので、その時のみ
    // フォールバック (50000件まで取得して Set 化) に降りる。
    sb.rpc("get_unique_diagnose_username_count"),
  ]);

  let uniqueUsernames = 0;
  if (!uniqueRpc.error && typeof uniqueRpc.data === "number") {
    uniqueUsernames = uniqueRpc.data;
  } else if (!uniqueRpc.error && typeof uniqueRpc.data === "string") {
    // bigint は driver によって string で返ることがあるため両対応
    uniqueUsernames = Number(uniqueRpc.data) || 0;
  } else {
    // フォールバック: function 未デプロイ環境 (旧 schema) でも動かす
    console.warn(
      "[leads] get_unique_diagnose_username_count rpc failed, falling back to client-side dedup:",
      uniqueRpc.error?.message,
    );
    const fallback = await sb
      .from("leads")
      .select("query_username")
      .eq("kind", "diagnose")
      .not("query_username", "is", null)
      .limit(50_000);
    const set = new Set(
      ((fallback.data ?? []) as { query_username: string | null }[])
        .map((r) => r.query_username)
        .filter((x): x is string => Boolean(x)),
    );
    uniqueUsernames = set.size;
  }

  return {
    totalDiagnose: diagC.count ?? 0,
    totalLineClick: lineClickC.count ?? 0,
    totalLineRegistered: lineRegC.count ?? 0,
    totalXOauth: xOauthC.count ?? 0,
    uniqueUsernames,
    last24hDiagnose: last24C.count ?? 0,
  };
}

// ------------------------------------------------------------
// Supabase health check — used by /admin to surface config issues
// ------------------------------------------------------------
export interface SupabaseHealth {
  configured: boolean;
  reachable: boolean;
  errorMessage: string | null;
}

export async function getSupabaseHealth(): Promise<SupabaseHealth> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return {
      configured: false,
      reachable: false,
      errorMessage: !url
        ? "NEXT_PUBLIC_SUPABASE_URL is missing"
        : "SUPABASE_SERVICE_ROLE_KEY is missing",
    };
  }

  const sb = getSupabase();
  if (!sb) {
    return {
      configured: false,
      reachable: false,
      errorMessage: "Supabase client failed to initialize",
    };
  }

  try {
    const { error } = await sb
      .from("leads")
      .select("id", { count: "exact", head: true })
      .limit(1);
    if (error) {
      return { configured: true, reachable: false, errorMessage: error.message };
    }
    return { configured: true, reachable: true, errorMessage: null };
  } catch (err) {
    return {
      configured: true,
      reachable: false,
      errorMessage: err instanceof Error ? err.message : "unknown error",
    };
  }
}

// ------------------------------------------------------------
// LINE display-name lookup (batch) — joins admin tables w/ pending links
// ------------------------------------------------------------
export interface LineLinkRow {
  line_user_id: string;
  pending_username: string;
  display_name: string | null;
  created_at: string;
}

export async function getLinePendingLinks(limit = 100): Promise<LineLinkRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("line_pending_links")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("[leads] line_pending_links list failed:", error.message);
    return [];
  }
  return (data ?? []) as LineLinkRow[];
}

// ------------------------------------------------------------
// X profile snapshot lookup — pulls cached profile data from
// diagnose_cache so admin pages can show avatar / followers without
// hitting the X API again.
// ------------------------------------------------------------
export interface XProfileSnapshot {
  username: string;
  displayName: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  followers: number | null;
  following: number | null;
  totalTweets: number | null;
  isVerified: boolean;
  verifiedType: string | null;
  accountCreatedIso: string | null;
}

export async function getProfileSnapshots(
  usernames: string[],
): Promise<Map<string, XProfileSnapshot>> {
  const map = new Map<string, XProfileSnapshot>();
  const unique = Array.from(new Set(usernames.filter((u) => u && u.length > 0)));
  if (unique.length === 0) return map;

  const sb = getSupabase();
  if (!sb) return map;

  const { data, error } = await sb
    .from("diagnose_cache")
    .select("username, data")
    .in("username", unique);

  if (error) {
    console.warn("[leads] profile snapshot fetch failed:", error.message);
    return map;
  }

  for (const row of (data ?? []) as { username: string; data: unknown }[]) {
    const profile = (row.data as { profile?: Record<string, unknown> })?.profile;
    if (!profile) continue;
    map.set(row.username, {
      username: String(profile.username ?? row.username),
      displayName: (profile.displayName as string | undefined) ?? null,
      profileImageUrl: (profile.profileImageUrl as string | undefined) ?? null,
      bio: (profile.bio as string | undefined) ?? null,
      followers: typeof profile.followers === "number" ? profile.followers : null,
      following: typeof profile.following === "number" ? profile.following : null,
      totalTweets: typeof profile.totalTweets === "number" ? profile.totalTweets : null,
      isVerified: Boolean(profile.isVerified),
      verifiedType: (profile.verifiedType as string | undefined) ?? null,
      accountCreatedIso: (profile.accountCreatedIso as string | undefined) ?? null,
    });
  }

  return map;
}

// ------------------------------------------------------------
// Diagnoser list — for a given target X username, list every X
// account that authenticated on /premium for that target.
// ------------------------------------------------------------
export interface DiagnoserRow {
  xUserId: string | null;
  xUsername: string | null;
  isSelfDiagnose: boolean;
  count: number;
  firstAt: string;
  lastAt: string;
}

export async function getDiagnosersFor(targetUsername: string): Promise<DiagnoserRow[]> {
  if (!targetUsername) return [];

  const sb = getSupabase();
  let rows: Pick<LeadRow, "x_user_id" | "x_username" | "created_at">[] = [];

  if (!sb) {
    rows = memStore
      .filter(
        (r) =>
          r.kind === "x_oauth" &&
          (r.query_username ?? "").toLowerCase() === targetUsername.toLowerCase(),
      )
      .map((r) => ({
        x_user_id: r.x_user_id,
        x_username: r.x_username,
        created_at: r.created_at,
      }));
  } else {
    const { data, error } = await sb
      .from("leads")
      .select("x_user_id, x_username, created_at")
      .eq("kind", "x_oauth")
      .ilike("query_username", targetUsername)
      .limit(500);
    if (error) {
      console.warn("[leads] getDiagnosersFor failed:", error.message);
      return [];
    }
    rows = (data ?? []) as typeof rows;
  }

  const targetLower = targetUsername.toLowerCase();
  const map = new Map<string, DiagnoserRow>();
  for (const r of rows) {
    const key = r.x_user_id ?? `handle:${r.x_username ?? "?"}`;
    let entry = map.get(key);
    if (!entry) {
      entry = {
        xUserId: r.x_user_id,
        xUsername: r.x_username,
        isSelfDiagnose: (r.x_username ?? "").toLowerCase() === targetLower,
        count: 0,
        firstAt: r.created_at,
        lastAt: r.created_at,
      };
      map.set(key, entry);
    }
    entry.count += 1;
    if (r.created_at < entry.firstAt) entry.firstAt = r.created_at;
    if (r.created_at > entry.lastAt) entry.lastAt = r.created_at;
  }

  return [...map.values()].sort((a, b) => {
    if (a.isSelfDiagnose !== b.isSelfDiagnose) return a.isSelfDiagnose ? -1 : 1;
    return b.lastAt.localeCompare(a.lastAt);
  });
}

// ------------------------------------------------------------
// Request helpers — extract client fingerprint from a NextRequest
// ------------------------------------------------------------
import type { NextRequest } from "next/server";

/** Cookie name used to persist campaign attribution across the session. */
export const ATTRIBUTION_COOKIE = "kaiji_attr";

export interface ClientInfo extends Attribution {
  ip: string | null;
  userAgent: string | null;
  referrer: string | null;
  sessionId: string | null;
}

export function extractClientInfo(req: NextRequest): ClientInfo {
  const h = req.headers;
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    null;

  // Attribution cookie is a URL-encoded query string: "utm_source=x&utm_campaign=tk_0411..."
  let attr: Attribution = {};
  const attrRaw = req.cookies.get(ATTRIBUTION_COOKIE)?.value;
  if (attrRaw) {
    try {
      const p = new URLSearchParams(attrRaw);
      attr = {
        utmSource: p.get("utm_source"),
        utmMedium: p.get("utm_medium"),
        utmCampaign: p.get("utm_campaign"),
        utmContent: p.get("utm_content"),
        utmTerm: p.get("utm_term"),
        landingPath: p.get("landing_path"),
      };
    } catch {
      // Malformed cookie — ignore.
    }
  }

  return {
    ip,
    userAgent: h.get("user-agent"),
    referrer: h.get("referer"),
    sessionId: req.cookies.get("kaiji_sid")?.value ?? null,
    ...attr,
  };
}
