import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "無料",
    price: "0",
    unit: "円",
    description: "まずは気軽に試す",
    features: [
      "開示請求レベル判定（S〜E）",
      "リスクスコア（0-100）",
      "問題投稿の件数 & 上位3件表示",
      "該当カテゴリ内訳（名誉毀損・侮辱等）",
      "アカウント基本情報表示",
      "投稿傾向の簡易分析",
      "診断結果のXシェア",
    ],
    cta: "無料で診断する",
    highlight: false,
  },
  {
    name: "スタンダード",
    price: "500",
    unit: "円/月",
    description: "本気で対処したい方に",
    features: [
      "無料の全機能",
      "問題投稿の全件表示",
      "法令カテゴリ分類",
      "判例との類似度",
      "証拠スクショ保存",
      "DM分析",
      "開示請求テンプレ",
      "弁護士への相談",
    ],
    cta: "始める",
    highlight: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-16 sm:py-20 bg-surface">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gradient-blue">
            Pricing
          </span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            料金プラン
          </h2>
          <p className="mt-2 text-sm text-text-sub">
            無料で始めて、必要になったらアップグレード。
          </p>
        </div>

        <div className="mt-10 grid items-stretch gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-4 sm:p-6 ${
                plan.highlight
                  ? "border-violet-300/40 bg-white shadow-lg shadow-violet-400/5"
                  : "border-border bg-white"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 px-3 py-0.5 text-[10px] font-bold text-white">
                    <Sparkles className="h-2.5 w-2.5" />
                    おすすめ
                  </span>
                </div>
              )}

              <p className="text-sm font-bold">{plan.name}</p>
              <p className="mt-0.5 text-xs text-text-muted">{plan.description}</p>

              <div className="mt-4 flex items-baseline gap-0.5">
                <span className="text-3xl font-extrabold">{plan.price}</span>
                <span className="text-sm text-text-muted">{plan.unit}</span>
              </div>

              <a
                href="#diagnose"
                className={`mt-5 block rounded-xl py-2.5 text-center text-sm font-bold transition-all ${
                  plan.highlight
                    ? "bg-gradient-to-r from-violet-400 to-indigo-400 text-white hover:from-violet-500 hover:to-indigo-500"
                    : "border border-border bg-surface text-foreground hover:bg-surface-2"
                }`}
              >
                {plan.cta}
              </a>

              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${plan.highlight ? "text-violet-500" : "text-text-muted"}`} />
                    <span className="text-text-sub">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
