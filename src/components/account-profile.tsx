"use client";

import { useState } from "react";
import Image from "next/image";
import { User, CheckCircle, ExternalLink } from "lucide-react";

// ============================================================
// Types
// ============================================================
export interface AccountProfile {
  username: string;
  displayName: string;
  bio: string;
  url: string;
  isVerified: boolean;
  isActive: boolean;
  accountType: string;
  followers: number;
  following: number;
  posts: number;
  likes: number;
  media: number;
  listed: number;
  followersChange: number;
  trackingSince: string;
}

// ============================================================
// Mock generator
// ============================================================
export function generateMockProfile(username: string): AccountProfile {
  const s = username.length + username.charCodeAt(0);
  return {
    username,
    displayName: `${username}のアカウント`,
    bio: "このアカウントの投稿内容をAIが分析しています。実際のプロフィール情報はX API連携後に表示されます。",
    url: "",
    isVerified: s % 3 === 0,
    isActive: true,
    accountType: "個人",
    followers: Math.max(100, (s * 347) % 50000),
    following: Math.max(50, (s * 123) % 3000),
    posts: Math.max(200, (s * 231) % 40000),
    likes: Math.max(500, (s * 467) % 60000),
    media: Math.max(10, (s * 89) % 3000),
    listed: Math.max(1, (s * 43) % 500),
    followersChange: ((s * 11) % 400) - 200,
    trackingSince: "2026/03/15",
  };
}

// ============================================================
// Avatar
// ============================================================
function ProfileAvatar({ username, size = 64 }: { username: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100" style={{ width: size, height: size }}>
        <User className="text-blue-400" style={{ width: size * 0.45, height: size * 0.45 }} />
      </div>
    );
  }
  return (
    <Image
      src={`https://unavatar.io/x/${username}`}
      alt={`@${username}`}
      width={size}
      height={size}
      className="rounded-full object-cover ring-2 ring-white shadow-lg"
      onError={() => setErr(true)}
      unoptimized
    />
  );
}

// ============================================================
// Stat cell
// ============================================================
function StatCell({ value, label, color = "text-blue-600", change }: { value: number; label: string; color?: string; change?: number }) {
  return (
    <div className="rounded-xl border border-border bg-white p-3.5">
      <p className={`text-xl font-extrabold leading-tight ${color}`}>
        {value.toLocaleString()}
        {change !== undefined && change !== 0 && (
          <span className={`ml-1 text-xs font-bold ${change > 0 ? "text-emerald-500" : "text-red-400"}`}>
            {change > 0 ? "+" : ""}{change}
          </span>
        )}
      </p>
      <p className="mt-0.5 text-[11px] font-medium text-text-muted">{label}</p>
    </div>
  );
}

// ============================================================
// Component
// ============================================================
export function AccountProfileCard({ profile }: { profile: AccountProfile }) {
  return (
    <>
      {/* Profile card */}
      <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
        <div className="flex gap-4">
          <ProfileAvatar username={profile.username} size={64} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-base font-extrabold">{profile.displayName}</p>
              {profile.isVerified && (
                <CheckCircle className="h-4 w-4 shrink-0 text-blue-500" />
              )}
            </div>
            <p className="text-sm text-text-muted">@{profile.username}</p>
            <p className="mt-2 text-xs leading-relaxed text-text-sub line-clamp-2">
              {profile.bio}
            </p>
            {profile.url && (
              <a href={profile.url} className="mt-1 inline-flex items-center gap-1 text-xs text-blue-500 hover:underline">
                <ExternalLink className="h-3 w-3" />
                {profile.url.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {profile.isActive && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              アクティブ
            </span>
          )}
          <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[10px] font-semibold text-text-sub">
            {profile.accountType}
          </span>
          {profile.isVerified && (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
              Blue認証
            </span>
          )}
          <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[10px] font-semibold text-text-sub">
            追跡開始 {profile.trackingSince}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2">
        <StatCell value={profile.followers} label="フォロワー" color="text-blue-600" change={profile.followersChange} />
        <StatCell value={profile.following} label="フォロー中" color="text-slate-700" />
        <StatCell value={profile.posts} label="投稿" color="text-indigo-600" />
        <StatCell value={profile.likes} label="いいね" color="text-rose-500" />
        <StatCell value={profile.media} label="メディア" color="text-violet-600" />
        <StatCell value={profile.listed} label="リスト" color="text-cyan-600" />
      </div>
    </>
  );
}
