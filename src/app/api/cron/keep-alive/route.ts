// ============================================================
// GET /api/cron/keep-alive
//
// Supabase Free plan は一定期間 DB アクセスが無いとプロジェクトを
// 自動停止する。停止すると全ての DB 呼び出しが `TypeError: fetch failed`
// になり、リード記録も診断キャッシュも「エラーを出さずに」失われる
// (2026-08-13 に発覚。少なくとも 8/11 から3日以上気付けなかった)。
//
// Vercel Cron から毎日叩くことで
//   ① 軽いクエリ1本で「アクティブなプロジェクト」の状態を維持する
//   ② 万一落ちていたら即座にログとアラートで気付ける
// の2つを担保する。
//
// 認証: CRON_SECRET を設定している場合は Bearer 一致を必須にする
//       (Vercel Cron は自動で Authorization ヘッダを付ける)。
//       未設定でも動く — 疎通状態しか返さないため実害は無く、
//       設定漏れで keep-alive が止まる方が危険なので fail-open にする。
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseHealth } from "@/lib/leads";
import { notifyText } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const health = await getSupabaseHealth();
  const checkedAt = new Date().toISOString();

  if (!health.reachable) {
    console.error(
      `[cron/keep-alive] Supabase unreachable (configured=${health.configured}): ${health.errorMessage}`,
    );
    // Webhook 未設定なら no-op
    await notifyText(
      `:rotating_light: *開示請求診断: DB に接続できません*\n` +
        `\`${health.errorMessage ?? "unknown error"}\`\n` +
        `リード記録と診断キャッシュが失われ続けます。Supabase の停止/上限を確認してください。`,
    ).catch(() => {});
    return NextResponse.json({ ok: false, checkedAt, ...health }, { status: 503 });
  }

  console.log(`[cron/keep-alive] Supabase reachable at ${checkedAt}`);
  return NextResponse.json({ ok: true, checkedAt });
}
