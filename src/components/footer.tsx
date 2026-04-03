import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo_icon.png" alt="ロゴ" width={22} height={22} />
            <span className="text-sm font-bold">裁判所行き診断</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs text-text-muted">
            <a href="#" className="hover:text-foreground">利用規約</a>
            <a href="#" className="hover:text-foreground">プライバシーポリシー</a>
            <a href="#" className="hover:text-foreground">特定商取引法</a>
            <a href="#" className="hover:text-foreground">お問い合わせ</a>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-surface px-4 py-3">
          <p className="text-[10px] leading-relaxed text-text-muted">
            <strong className="text-text-sub">免責事項：</strong>
            本サービスは法的助言を提供するものではなく、投稿内容の整理・分類ツールです。法的措置の可否については弁護士にご相談ください。弁護士監修のもと運営しています。
          </p>
        </div>

        <p className="mt-4 text-center text-[10px] text-text-muted">
          &copy; 2026 裁判所行き診断 All rights reserved.
        </p>
      </div>
    </footer>
  );
}
