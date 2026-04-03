"use client";

// ============================================================
// Types
// ============================================================
export interface AccountAnalysis {
  tones: string[];
  subGenres: { name: string; pct: number }[];
  tweetComposition: { label: string; pct: number; color: string }[];
  mediaComposition: { label: string; pct: number; color: string }[];
  postsPerDay: number;
  postsPerDayExclRT: number;
  language: string;
  engagement: { stability: string; stabilityColor: string; growth: string; growthColor: string };
  postingHours: { label: string; pct: number; color: string }[];
  peakHour: string;
  analyzedPosts: number;
  analyzedDays: number;
}

// ============================================================
// Mock generator
// ============================================================
export function generateMockAnalysis(username: string): AccountAnalysis {
  const s = username.length + username.charCodeAt(0);
  return {
    tones: ["攻撃的な表現", "断定口調", "煽り・挑発", "差別的発言"].slice(0, 2 + (s % 3)),
    subGenres: [
      { name: "政治・時事", pct: 30 + (s % 20) },
      { name: "愚痴・不満", pct: 20 + (s % 15) },
    ],
    tweetComposition: [
      { label: "オリジナル", pct: 35 + (s % 15), color: "#3b82f6" },
      { label: "リプライ", pct: 20 + (s % 10), color: "#8b5cf6" },
      { label: "引用", pct: 10 + (s % 10), color: "#f59e0b" },
      { label: "RT", pct: 15 + (s % 15), color: "#ec4899" },
    ],
    mediaComposition: [
      { label: "テキスト", pct: 50 + (s % 15), color: "#6366f1" },
      { label: "画像", pct: 15 + (s % 10), color: "#ef4444" },
      { label: "動画", pct: 3 + (s % 5), color: "#22c55e" },
      { label: "リンク", pct: 15 + (s % 15), color: "#a855f7" },
    ],
    postsPerDay: parseFloat((2 + (s % 8) + (s % 10) / 10).toFixed(1)),
    postsPerDayExclRT: parseFloat((1 + (s % 5) + (s % 10) / 10).toFixed(1)),
    language: "日本語",
    engagement: {
      stability: s % 3 === 0 ? "高い" : s % 3 === 1 ? "普通" : "不安定",
      stabilityColor: s % 3 === 0 ? "text-emerald-600" : s % 3 === 1 ? "text-amber-600" : "text-red-500",
      growth: s % 2 === 0 ? "成長中" : "横ばい",
      growthColor: s % 2 === 0 ? "text-emerald-600" : "text-amber-600",
    },
    postingHours: [
      { label: "早朝 5-9時", pct: 5 + (s % 10), color: "#f59e0b" },
      { label: "昼 10-16時", pct: 25 + (s % 15), color: "#3b82f6" },
      { label: "夜 17-23時", pct: 35 + (s % 15), color: "#6366f1" },
      { label: "深夜 0-4時", pct: 10 + (s % 10), color: "#1e293b" },
    ],
    peakHour: `${20 + (s % 4)}時台`,
    analyzedPosts: 80 + (s * 3) % 120,
    analyzedDays: 20 + (s % 15),
  };
}

// ============================================================
// Composition bar
// ============================================================
function CompositionBar({ items }: { items: { label: string; pct: number; color: string }[] }) {
  const total = items.reduce((a, b) => a + b.pct, 0);
  return (
    <div>
      <div className="flex h-6 overflow-hidden rounded-lg">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-center text-[9px] font-bold text-white transition-all"
            style={{ width: `${(item.pct / total) * 100}%`, backgroundColor: item.color }}
          >
            {(item.pct / total) * 100 > 12 && `${((item.pct / total) * 100).toFixed(1)}%`}
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {items.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-text-sub">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label} {((item.pct / total) * 100).toFixed(1)}%
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Horizontal bar
// ============================================================
function HorizontalBar({ items, peakHour }: { items: { label: string; pct: number; color: string }[]; peakHour: string }) {
  const maxPct = Math.max(...items.map((i) => i.pct));
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold text-text-sub">投稿時間帯</span>
        <span className="text-xs text-text-muted">
          最多: <span className="font-bold text-foreground">{peakHour}</span>
        </span>
      </div>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-[10px] sm:w-24 sm:text-[11px] font-medium text-text-sub">{item.label}</span>
            <div className="flex-1">
              <div className="h-4 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="animate-fill-bar h-full rounded-full"
                  style={{ width: `${(item.pct / maxPct) * 100}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
            <span className="w-8 text-right text-[11px] font-bold text-text-sub">{item.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Component
// ============================================================
export function AccountAnalysisCard({ analysis }: { analysis: AccountAnalysis }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">アカウント解析</h3>
        <span className="text-[11px] text-text-muted">
          {analysis.analyzedPosts}件 / {analysis.analyzedDays}日間
        </span>
      </div>

      {/* Tones */}
      <div className="mt-5">
        <p className="text-xs font-semibold text-text-sub">発信トーン</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {analysis.tones.map((tone) => (
            <span key={tone} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-bold text-red-600">
              {tone}
            </span>
          ))}
        </div>
      </div>

      {/* Sub genres */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-text-sub">サブジャンル</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {analysis.subGenres.map((g) => (
            <span key={g.name} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold text-violet-700">
              {g.name} <span className="text-violet-400">{g.pct}%</span>
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="my-5 h-px bg-border" />

      {/* Tweet composition */}
      <div>
        <p className="mb-2.5 text-xs font-semibold text-text-sub">ツイート構成</p>
        <CompositionBar items={analysis.tweetComposition} />
      </div>

      {/* Media composition */}
      <div className="mt-5">
        <p className="mb-2.5 text-xs font-semibold text-text-sub">メディア構成</p>
        <CompositionBar items={analysis.mediaComposition} />
      </div>

      {/* Divider */}
      <div className="my-5 h-px bg-border" />

      {/* Frequency + Language row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-[11px] font-medium text-text-muted">投稿頻度</p>
          <p className="mt-1 text-xl font-extrabold">
            {analysis.postsPerDay}
            <span className="ml-0.5 text-xs font-medium text-text-muted">件/日</span>
          </p>
          <p className="mt-0.5 text-[10px] text-text-muted">
            RT・リプ除く: <span className="font-bold">{analysis.postsPerDayExclRT}</span> 件/日
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-[11px] font-medium text-text-muted">言語</p>
          <p className="mt-1 text-xl font-extrabold">{analysis.language}</p>
        </div>
      </div>

      {/* Engagement */}
      <div className="mt-3 rounded-xl border border-border bg-surface p-4">
        <p className="text-[11px] font-medium text-text-muted">エンゲージメント</p>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-sub">安定度</span>
            <span className={`text-sm font-bold ${analysis.engagement.stabilityColor}`}>
              {analysis.engagement.stability}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-sub">成長度</span>
            <span className={`text-sm font-bold ${analysis.engagement.growthColor}`}>
              {analysis.engagement.growth}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-5 h-px bg-border" />

      {/* Posting hours */}
      <HorizontalBar items={analysis.postingHours} peakHour={analysis.peakHour} />
    </div>
  );
}
