// ============================================================
// Shared types — server (API route) ↔ client (DiagnoseClient)
// Icons are NOT included here; the client hydrates them after fetch.
// ============================================================

export type Level = "S" | "A" | "B" | "C" | "D" | "E";
export type Severity = "high" | "medium" | "low";

export type CategoryName =
  | "名誉毀損"
  | "侮辱"
  | "脅迫"
  | "プライバシー侵害";

/** Five-axis emotion profile (0-100) */
export interface EmotionProfile {
  anger: number;     // 怒り
  contempt: number;  // 侮蔑
  mockery: number;   // 嘲笑
  threat: number;    // 脅威
  sadness: number;   // 悲哀
}

export type DominantEmotion = keyof EmotionProfile;

export interface ClassifiedTweet {
  tweet_id: string;
  text: string;
  created_at: string; // ISO
  category: CategoryName | "該当なし";
  severity: Severity | "none";
  applicable_law: string; // e.g. "刑法230条"
  tags: string[];
  reasoning: string;
  metrics: { likes: number; rt: number; reply: number };
  /** Dominant emotion of this tweet (premium) */
  emotion?: DominantEmotion;
  /** SHA-256 of `${tweet_id}|${created_at}|${text}` for tamper-evidence */
  hash?: string;
  /** ISO timestamp when this evidence was captured by the system */
  capturedAt?: string;
}

export interface DiagnosisData {
  username: string;
  level: Level;
  score: number;
  totalPosts: number;
  problemPosts: number;
  categories: { name: CategoryName; count: number }[];
  topPosts: {
    text: string;
    category: string;
    severity: Severity;
    date: string;
  }[];
  accountCreated: string;
  replyRatio: number;
  mentionedUsers: { handle: string; count: number }[];
  hostileKeywords: { word: string; count: number }[];
  monthlyProblemPosts: { month: string; count: number }[];
  /** Full evidence list — every classified tweet with severity/category/law.
   *  Used by the premium (post-payment) view. */
  evidence: ClassifiedTweet[];
  /** Premium: Claude-generated narrative summary of the entire account */
  aiSummary?: string;
  /** Premium: aggregated emotion profile across all problem tweets */
  emotionProfile?: EmotionProfile;
  /** Premium: 7×24 grid of post counts (rows=days [Sun..Sat], cols=hours) */
  timeHeatmap?: number[][];
  /** "x-api+claude" | "mock" — for the UI to show data source */
  source: "x-api+claude" | "mock";
  /** ISO timestamp of analysis */
  analyzedAt: string;
}

export interface DiagnosisResponse {
  ok: boolean;
  data?: DiagnosisData;
  error?: string;
}
