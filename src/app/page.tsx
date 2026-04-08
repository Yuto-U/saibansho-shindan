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
      {/* ===== Background ===== */}
      <div className="pointer-events-none fixed inset-0">
        <div className="bg-mesh-blue absolute inset-0" />
        <div className="bg-grid-subtle absolute inset-0" />
        <div className="animate-float-slow absolute top-[8%] left-[5%] h-[250px] w-[250px] sm:h-[420px] sm:w-[420px] rounded-full bg-gradient-to-br from-blue-500/[0.07] via-indigo-400/[0.05] to-transparent blur-[60px] sm:blur-[80px]" />
        <div className="animate-float-reverse absolute top-[15%] right-[5%] h-[200px] w-[200px] sm:h-[350px] sm:w-[350px] rounded-full bg-gradient-to-bl from-violet-500/[0.06] via-blue-400/[0.04] to-transparent blur-[60px] sm:blur-[80px]" />
        <div className="animate-float-slow absolute bottom-[5%] left-[30%] h-[180px] w-[180px] sm:h-[280px] sm:w-[280px] rounded-full bg-gradient-to-tr from-cyan-400/[0.05] via-blue-300/[0.03] to-transparent blur-[50px] sm:blur-[70px] [animation-delay:4s]" />
      </div>

      {/* ===== Header ===== */}
      <header className="animate-fade-in relative z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-5" style={{ animationDelay: "0.1s", opacity: 0 }}>
        <div className="flex items-center gap-2">
          <Image src="/logo_icon.png" alt="ロゴ" width={24} height={24} className="sm:w-7 sm:h-7" />
          <span className="text-sm font-extrabold tracking-tight sm:text-base">
            開示請求<span className="text-gradient-blue">診断</span>
          </span>
        </div>
        <a
          href="/about"
          className="rounded-full border border-border px-3 py-1 text-[10px] font-medium text-text-sub sm:px-4 sm:py-1.5 sm:text-xs"
        >
          サービスについて
        </a>
      </header>

      {/* ===== Main ===== */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-16 sm:px-5 sm:pb-24">
        <div className="w-full max-w-lg text-center">
          {/* Icon */}
          <div
            className="animate-scale-in mx-auto mb-4 flex justify-center sm:mb-6"
            style={{ animationDelay: "0.15s", opacity: 0 }}
          >
            <Image src="/logo_icon.png" alt="開示請求診断" width={56} height={56} className="animate-icon-pulse drop-shadow-md sm:w-[72px] sm:h-[72px]" />
          </div>

          {/* Title */}
          <h1
            className="animate-slide-up text-2xl font-extrabold leading-tight tracking-tight sm:text-[2.5rem]"
            style={{ animationDelay: "0.25s", opacity: 0 }}
          >
            開示請求診断
          </h1>

          {/* Subtitle */}
          <p
            className="animate-slide-up mt-2 text-sm text-text-sub sm:mt-3 sm:text-lg"
            style={{ animationDelay: "0.35s", opacity: 0 }}
          >
            Xアカウントの誹謗中傷を<strong className="text-foreground">独自エンジンで分析</strong>
          </p>

          {/* ===== Input form ===== */}
          <form
            onSubmit={handleSubmit}
            className="animate-slide-up mt-6 sm:mt-10"
            style={{ animationDelay: "0.45s", opacity: 0 }}
          >
            <div className="flex items-center rounded-xl sm:rounded-2xl border-2 border-border bg-white/80 p-1.5 sm:p-2 shadow-lg shadow-black/[0.04] backdrop-blur-sm transition-all focus-within:border-blue-400/50 focus-within:shadow-xl focus-within:shadow-blue-500/[0.08]">
              <span className="pl-3 text-base font-bold text-text-muted/50 sm:pl-4 sm:text-xl">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ユーザー名 / URL"
                className="flex-1 min-w-0 bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-text-muted/40 sm:py-3 sm:text-lg"
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !username.replace(/^@/, "").trim()}
                className="flex shrink-0 items-center gap-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-violet-400 to-indigo-400 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-400/30 sm:gap-2 sm:px-7 sm:py-3 sm:text-sm disabled:opacity-30 disabled:shadow-none active:scale-[0.97]"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                ) : (
                  <>
                    実行
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Description */}
          <p
            className="animate-fade-in mt-3 text-[11px] text-text-muted sm:mt-5 sm:text-sm"
            style={{ animationDelay: "0.6s", opacity: 0 }}
          >
            レベル（S〜E）、スコア（0-100）を即座に診断
          </p>

          {/* ===== Feature pills ===== */}
          <div
            className="animate-fade-in mt-5 flex items-center justify-center gap-1.5 sm:mt-8 sm:gap-2"
            style={{ animationDelay: "0.7s", opacity: 0 }}
          >
            {[
              { icon: Zap, label: "無料", color: "text-amber-600 bg-amber-50 border-amber-200/50" },
              { icon: Shield, label: "弁護士監修", color: "text-blue-600 bg-blue-50 border-blue-200/50" },
              { icon: Scale, label: "X API連携", color: "text-emerald-600 bg-emerald-50 border-emerald-200/50" },
            ].map((pill) => (
              <span
                key={pill.label}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:gap-1.5 sm:px-3.5 sm:py-1.5 sm:text-xs ${pill.color}`}
              >
                <pill.icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {pill.label}
              </span>
            ))}
          </div>

          {/* ===== Disclosure request benefits ===== */}
          <div
            className="animate-fade-in mt-10 sm:mt-14"
            style={{ animationDelay: "1.0s", opacity: 0 }}
          >
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gradient-blue sm:text-xs">
              匿名の誹謗中傷は、もう逃げられない
            </p>
            <p className="mt-1.5 text-center text-xs text-text-muted sm:mt-2 sm:text-sm">
              開示請求であなたができること
            </p>

            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:mt-5 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
              {[
                { emoji: "👤", title: "相手の身元を特定", desc: "匿名でも氏名・住所が判明" },
                { emoji: "💰", title: "慰謝料を請求", desc: "30〜100万円の損害賠償" },
                { emoji: "⚖️", title: "刑事責任を追及", desc: "侮辱罪は懲役刑の対象に" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex min-w-[140px] shrink-0 flex-col items-center rounded-xl border border-border bg-white/60 p-3 text-center backdrop-blur-sm sm:min-w-0 sm:p-4"
                >
                  <span className="text-lg sm:text-xl">{item.emoji}</span>
                  <p className="mt-1.5 text-[11px] font-bold sm:mt-2 sm:text-xs">{item.title}</p>
                  <p className="mt-0.5 text-[9px] text-text-muted sm:text-[10px]">{item.desc}</p>
                </div>
              ))}
            </div>

            <p className="mt-3 text-center text-[9px] text-text-muted sm:mt-4 sm:text-[10px]">
              2022年の侮辱罪厳罰化・2024年の開示請求簡略化により、
              誹謗中傷の法的対処がかつてないほど容易になっています。
            </p>
          </div>

          {/* ===== Level meter preview ===== */}
          <div
            className="animate-fade-in mx-auto mt-8 max-w-xs sm:mt-12 sm:max-w-sm"
            style={{ animationDelay: "1.1s", opacity: 0 }}
          >
            <div className="rounded-xl sm:rounded-2xl border border-border bg-white/60 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-5 sm:py-4">
              <div className="flex items-center justify-between text-[10px] font-semibold text-text-muted sm:text-[11px]">
                <span>開示請求レベル</span>
                <span className="flex items-center gap-1">
                  E
                  <span className="mx-1 inline-block h-px w-2.5 bg-text-muted/30 sm:w-3" />
                  S
                </span>
              </div>
              <div className="mt-2 flex items-center gap-0.5 sm:mt-2.5 sm:gap-1">
                {["E", "D", "C", "B", "A", "S"].map((lv, i) => (
                  <div key={lv} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="h-1.5 w-full rounded-full sm:h-2"
                      style={{
                        background: ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444", "#dc2626"][i],
                        opacity: 0.7 + i * 0.06,
                      }}
                    />
                    <span className="text-[8px] font-bold text-text-muted/70 sm:text-[10px]">{lv}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== Footer ===== */}
      <footer className="animate-fade-in relative z-10 px-4 py-4 text-center sm:px-6 sm:py-5" style={{ animationDelay: "1.2s", opacity: 0 }}>
        <p className="text-[10px] text-text-muted sm:text-[11px]">
          本サービスは法的助言を提供するものではありません。
          <a href="/about" className="ml-1 underline decoration-text-muted/30 underline-offset-2 hover:text-text-sub">
            詳しく見る
          </a>
        </p>
      </footer>
    </div>
  );
}
