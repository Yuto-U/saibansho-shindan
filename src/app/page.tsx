"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Gavel, ArrowRight, Loader2, Scale, Shield, Zap } from "lucide-react";
import { parseUsername } from "@/lib/parse-username";

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = parseUsername(username);
    if (!cleaned) return;
    setLoading(true);
    router.push(`/diagnose/${cleaned}`);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* ===== Animated background ===== */}
      <div className="pointer-events-none fixed inset-0">
        {/* Mesh gradient base */}
        <div className="bg-mesh-blue absolute inset-0" />
        {/* Grid */}
        <div className="bg-grid-subtle absolute inset-0" />
        {/* Floating orbs */}
        <div className="animate-float-slow absolute top-[8%] left-[12%] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500/[0.07] via-indigo-400/[0.05] to-transparent blur-[80px]" />
        <div className="animate-float-reverse absolute top-[15%] right-[8%] h-[350px] w-[350px] rounded-full bg-gradient-to-bl from-violet-500/[0.06] via-blue-400/[0.04] to-transparent blur-[80px]" />
        <div className="animate-float-slow absolute bottom-[5%] left-[35%] h-[280px] w-[280px] rounded-full bg-gradient-to-tr from-cyan-400/[0.05] via-blue-300/[0.03] to-transparent blur-[70px] [animation-delay:4s]" />
        {/* Noise */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      </div>

      {/* ===== Header ===== */}
      <header className="animate-fade-in relative z-10 flex items-center justify-between px-6 py-5" style={{ animationDelay: "0.1s", opacity: 0 }}>
        <div className="flex items-center gap-2.5">
          <Image src="/logo_icon.png" alt="ロゴ" width={28} height={28} />
          <span className="text-base font-extrabold tracking-tight">
            裁判所行き<span className="text-gradient-blue">診断</span>
          </span>
        </div>
        <a
          href="/about"
          className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-text-sub transition-all hover:border-text-muted hover:text-foreground hover:shadow-sm"
        >
          サービスについて
        </a>
      </header>

      {/* ===== Main ===== */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-24">
        <div className="w-full max-w-lg text-center">
          {/* Icon — centered */}
          <div
            className="animate-scale-in mx-auto mb-6 flex justify-center"
            style={{ animationDelay: "0.15s", opacity: 0 }}
          >
            <Image src="/logo_icon.png" alt="裁判所行き診断" width={72} height={72} className="animate-icon-pulse drop-shadow-md" />
          </div>

          {/* Title */}
          <h1
            className="animate-slide-up text-3xl font-extrabold leading-tight tracking-tight sm:text-[2.5rem]"
            style={{ animationDelay: "0.25s", opacity: 0 }}
          >
            裁判所行き診断
          </h1>

          {/* Subtitle */}
          <p
            className="animate-slide-up mt-3 text-base text-text-sub sm:text-lg"
            style={{ animationDelay: "0.35s", opacity: 0 }}
          >
            Xアカウントの誹謗中傷を<strong className="text-foreground">AIで分析</strong>
          </p>

          {/* ===== Input form ===== */}
          <form
            onSubmit={handleSubmit}
            className="animate-slide-up mt-10"
            style={{ animationDelay: "0.45s", opacity: 0 }}
          >
            <div className="flex items-center rounded-2xl border-2 border-border bg-white/80 p-2 shadow-xl shadow-black/[0.04] backdrop-blur-sm transition-all focus-within:border-blue-400/50 focus-within:shadow-2xl focus-within:shadow-blue-500/[0.08]">
              <span className="pl-4 text-xl font-bold text-text-muted/50">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ユーザー名 または URL を入力"
                className="flex-1 bg-transparent px-2 py-3 text-lg outline-none placeholder:text-text-muted/40"
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !username.replace(/^@/, "").trim()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-400 to-indigo-400 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-violet-400/30 transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-30 disabled:shadow-none active:scale-[0.97]"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    実行
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Description */}
          <p
            className="animate-fade-in mt-5 text-sm text-text-muted"
            style={{ animationDelay: "0.6s", opacity: 0 }}
          >
            裁判所行きレベル（S〜E）、リスクスコア（0-100）を即座に診断
          </p>

          {/* ===== Feature pills ===== */}
          <div
            className="animate-fade-in mt-8 flex flex-wrap items-center justify-center gap-2"
            style={{ animationDelay: "0.7s", opacity: 0 }}
          >
            {[
              { icon: Zap, label: "無料・登録不要", color: "text-amber-600 bg-amber-50 border-amber-200/50" },
              { icon: Shield, label: "弁護士監修", color: "text-blue-600 bg-blue-50 border-blue-200/50" },
              { icon: Scale, label: "X API公式連携", color: "text-emerald-600 bg-emerald-50 border-emerald-200/50" },
            ].map((pill) => (
              <span
                key={pill.label}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${pill.color}`}
              >
                <pill.icon className="h-3 w-3" />
                {pill.label}
              </span>
            ))}
          </div>

          {/* ===== Disclosure request benefits ===== */}
          <div
            className="animate-fade-in mt-14"
            style={{ animationDelay: "1.0s", opacity: 0 }}
          >
            <p className="text-center text-xs font-bold uppercase tracking-widest text-gradient-blue">
              匿名の誹謗中傷は、もう逃げられない
            </p>
            <p className="mt-2 text-center text-sm text-text-muted">
              開示請求であなたができること
            </p>

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                {
                  emoji: "👤",
                  title: "相手の身元を特定",
                  desc: "匿名でも氏名・住所が判明",
                },
                {
                  emoji: "💰",
                  title: "慰謝料を請求",
                  desc: "30〜100万円の損害賠償",
                },
                {
                  emoji: "⚖️",
                  title: "刑事責任を追及",
                  desc: "侮辱罪は懲役刑の対象に",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-white/60 p-4 text-center backdrop-blur-sm"
                >
                  <span className="text-xl">{item.emoji}</span>
                  <p className="mt-2 text-xs font-bold">{item.title}</p>
                  <p className="mt-0.5 text-[10px] text-text-muted">{item.desc}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-center text-[10px] text-text-muted">
              2022年の侮辱罪厳罰化・2024年の開示請求簡略化により、
              <br className="hidden sm:block" />
              誹謗中傷の法的対処がかつてないほど容易になっています。
            </p>
          </div>

          {/* ===== Level meter preview ===== */}
          <div
            className="animate-fade-in mx-auto mt-12 max-w-sm"
            style={{ animationDelay: "1.1s", opacity: 0 }}
          >
            <div className="rounded-2xl border border-border bg-white/60 px-5 py-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted">
                <span>裁判所行きレベル</span>
                <span className="flex items-center gap-1">
                  E
                  <span className="mx-1 inline-block h-px w-3 bg-text-muted/30" />
                  S
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-1">
                {["E", "D", "C", "B", "A", "S"].map((lv, i) => (
                  <div key={lv} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      className="h-2 w-full rounded-full"
                      style={{
                        background: [
                          "#22c55e", "#84cc16", "#eab308",
                          "#f97316", "#ef4444", "#dc2626",
                        ][i],
                        opacity: 0.7 + i * 0.06,
                      }}
                    />
                    <span className="text-[10px] font-bold text-text-muted/70">{lv}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== Footer ===== */}
      <footer className="animate-fade-in relative z-10 px-6 py-5 text-center" style={{ animationDelay: "1.2s", opacity: 0 }}>
        <p className="text-[11px] text-text-muted">
          本サービスは法的助言を提供するものではありません。
          <a href="/about" className="ml-1 underline decoration-text-muted/30 underline-offset-2 hover:text-text-sub hover:decoration-text-sub/50">
            詳しく見る
          </a>
        </p>
      </footer>
    </div>
  );
}
