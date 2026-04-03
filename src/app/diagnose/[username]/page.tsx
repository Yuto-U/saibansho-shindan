import { DiagnoseClient } from "./client";

export default async function DiagnosePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <DiagnoseClient username={username} />;
}
