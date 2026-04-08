import {
  Brain,
  Camera,
  MessageSquareWarning,
  Mail,
  FileCheck,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "独自スコアリング",
    description: "投稿を独自エンジンで解析し、名誉毀損・侮辱・脅迫の可能性を判定。",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: MessageSquareWarning,
    title: "投稿 & リプライ分析",
    description: "公開投稿・リプライの問題発言を網羅的に洗い出し。",
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    icon: Mail,
    title: "DM分析",
    description: "自分のXアカウントを連携して、受信DMの脅迫・中傷を抽出。",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
  {
    icon: Camera,
    title: "証拠の自動保全",
    description: "問題投稿が消される前にスクショを自動保存。",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: FileCheck,
    title: "開示請求テンプレ",
    description: "弁護士監修の書式テンプレートと記入ガイドを提供。",
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    icon: Shield,
    title: "弁護士マッチング",
    description: "証拠レポートをもとに、誹謗中傷に強い弁護士へ即相談。",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gradient-blue">
            Features
          </span>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            できること
          </h2>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-hover group flex min-h-[130px] sm:min-h-[150px] flex-col rounded-2xl border border-border bg-white p-4 sm:p-5"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${feature.bg}`}>
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <h3 className="mt-3 text-sm font-bold">{feature.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
