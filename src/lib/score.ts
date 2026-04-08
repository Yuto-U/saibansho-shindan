// ============================================================
// Score & level computation from classified tweets
// ============================================================

import { createHash } from "crypto";
import type { XTweet, XUser } from "./x-api";
import type { ClassifiedTweet, DiagnosisData, Level, CategoryName, EmotionProfile } from "./diagnose-types";

const SEVERITY_WEIGHT: Record<string, number> = {
  high: 10,
  medium: 5,
  low: 2,
  none: 0,
};

function levelFromScore(score: number): Level {
  if (score >= 85) return "S";
  if (score >= 70) return "A";
  if (score >= 55) return "B";
  if (score >= 40) return "C";
  if (score >= 25) return "D";
  return "E";
}

const HOSTILE_KEYWORDS = [
  "死ね",
  "○ね",
  "キモい",
  "消えろ",
  "ゴミ",
  "ブス",
  "クズ",
  "馬鹿",
  "うざい",
  "クソ",
];

function buildHeatmap(tweets: XTweet[]): number[][] {
  // 7 days (Sun..Sat) × 24 hours
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const t of tweets) {
    const d = new Date(t.created_at);
    if (Number.isNaN(d.getTime())) continue;
    grid[d.getDay()][d.getHours()] += 1;
  }
  return grid;
}

function aggregateEmotion(classified: ClassifiedTweet[]): EmotionProfile {
  const counts: EmotionProfile = { anger: 0, contempt: 0, mockery: 0, threat: 0, sadness: 0 };
  let total = 0;
  for (const c of classified) {
    if (c.severity === "none" || !c.emotion) continue;
    counts[c.emotion] += 1;
    total += 1;
  }
  if (total === 0) return counts;
  // Normalize to 0-100
  const k: (keyof EmotionProfile)[] = ["anger", "contempt", "mockery", "threat", "sadness"];
  for (const key of k) {
    counts[key] = Math.round((counts[key] / total) * 100);
  }
  return counts;
}

function attachHashes(classified: ClassifiedTweet[]): ClassifiedTweet[] {
  const capturedAt = new Date().toISOString();
  return classified.map((c) => ({
    ...c,
    hash: createHash("sha256").update(`${c.tweet_id}|${c.created_at}|${c.text}`).digest("hex"),
    capturedAt,
  }));
}

export function buildDiagnosis(
  user: XUser,
  tweets: XTweet[],
  classified: ClassifiedTweet[],
): DiagnosisData {
  // Score: sum of severity weights, normalized to 0-100
  const rawScore = classified.reduce((acc, c) => acc + (SEVERITY_WEIGHT[c.severity] ?? 0), 0);
  // Cap: 100 problem points max
  const score = Math.min(100, Math.round((rawScore / Math.max(50, classified.length * 2)) * 100));
  const level = levelFromScore(score);

  // Category aggregation
  const categoryNames: CategoryName[] = ["名誉毀損", "侮辱", "脅迫", "プライバシー侵害"];
  const categories = categoryNames.map((name) => ({
    name,
    count: classified.filter((c) => c.category === name).length,
  }));

  // Top problem posts (high/medium severity, sorted)
  const problem = classified.filter((c) => c.severity !== "none");
  const topPosts = problem
    .sort((a, b) => (SEVERITY_WEIGHT[b.severity] ?? 0) - (SEVERITY_WEIGHT[a.severity] ?? 0))
    .slice(0, 3)
    .map((c) => ({
      text: c.text,
      category: c.category === "該当なし" ? "その他" : c.category,
      severity: c.severity === "none" ? "low" : c.severity,
      date: new Date(c.created_at).toLocaleDateString("ja-JP"),
    }));

  // Reply ratio (replies / total)
  const replyCount = tweets.filter((t) => t.in_reply_to_user_id).length;
  const replyRatio = tweets.length > 0 ? Math.round((replyCount / tweets.length) * 1000) / 10 : 0;

  // Mention frequency
  const mentionMap = new Map<string, number>();
  tweets.forEach((t) => {
    t.entities?.mentions?.forEach((m) => {
      mentionMap.set(m.username, (mentionMap.get(m.username) ?? 0) + 1);
    });
  });
  const mentionedUsers = Array.from(mentionMap.entries())
    .map(([handle, count]) => ({ handle, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Hostile keyword extraction (simple substring match)
  const hostileKeywords = HOSTILE_KEYWORDS.map((word) => {
    const count = tweets.reduce(
      (acc, t) => acc + (t.text.includes(word) ? 1 : 0),
      0,
    );
    return { word, count };
  })
    .filter((k) => k.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Monthly problem post counts (last 3 months)
  const now = new Date();
  const monthly: { month: string; count: number }[] = [];
  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getMonth() + 1}月`;
    const count = problem.filter((c) => {
      const cd = new Date(c.created_at);
      return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
    }).length;
    monthly.push({ month: ym, count });
  }

  return {
    username: user.username,
    level,
    score,
    totalPosts: tweets.length,
    problemPosts: problem.length,
    categories,
    topPosts: topPosts as DiagnosisData["topPosts"],
    accountCreated: new Date(user.created_at).toLocaleDateString("ja-JP"),
    replyRatio,
    mentionedUsers,
    hostileKeywords,
    monthlyProblemPosts: monthly,
    evidence: attachHashes(classified.filter((c) => c.severity !== "none")),
    emotionProfile: aggregateEmotion(classified),
    timeHeatmap: buildHeatmap(tweets),
    source: "x-api+claude",
    analyzedAt: new Date().toISOString(),
  };
}
