"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "匿名アカウントの相手を本当に特定できますか？",
    a: "2024年の法改正で開示請求が1回の裁判手続きで可能になりました。誹謗中傷が法律に抵触する場合、匿名でも発信者の特定は法的に可能です。",
  },
  {
    q: "判定はどれくらい正確？",
    a: "本サービスは法的判断ではなく、投稿内容を独自の解析エンジンで整理・分類するツールです。「名誉毀損の可能性がある表現が含まれています」という形で情報を整理し、最終判断は弁護士にお任せいただきます。",
  },
  {
    q: "弁護士法に違反していませんか？",
    a: "法的助言を提供するサービスではなく、証拠整理ツールです。法的判断やアドバイスは行わず、弁護士監修で運営しています。",
  },
  {
    q: "DM分析でプライバシーは大丈夫？",
    a: "DM本文はサーバーに保存しません。分析結果のみ保存し、アクセストークンは分析後に即時破棄します。",
  },
  {
    q: "無料でどこまで使えますか？",
    a: "問題投稿の件数・裁判所行きレベル・上位3件の表示まで無料です。全件表示や証拠保全は月額500円プランでご利用いただけます。",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gradient-blue">
            FAQ
          </span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            よくある質問
          </h2>
        </div>

        <div className="mt-10 space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-xl border transition-all ${
                  isOpen ? "border-primary/20 bg-primary-bg" : "border-border bg-white"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-4 py-3 sm:px-5 sm:py-4 text-left"
                >
                  <span className="pr-4 text-sm font-semibold">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-sm leading-relaxed text-text-sub">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
