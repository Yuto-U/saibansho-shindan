/**
 * ユーザー入力からXのユーザー名を抽出する。
 * 対応フォーマット:
 *   - username
 *   - @username
 *   - https://twitter.com/username
 *   - https://x.com/username
 *   - https://twitter.com/username/status/123...
 *   - twitter.com/username
 *   - x.com/username
 */
export function parseUsername(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  // URL pattern: extract username from path
  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/(@?[\w]+)/i
  );
  if (urlMatch) {
    return urlMatch[1].replace(/^@/, "");
  }

  // @username or plain username
  return trimmed.replace(/^@/, "");
}
