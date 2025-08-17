import type { ClassifyResult, Context, SmsMsg } from "@/lib/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function getThread(phone: string): Promise<SmsMsg[]> {
  const res = await fetch(
    `${BACKEND_URL}/threads/${encodeURIComponent(phone)}`
  );
  if (!res.ok) return [];
  return res.json();
}

export async function classify(
  thread: string[],
  context: Context
): Promise<ClassifyResult> {
  const res = await fetch(`${BACKEND_URL}/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thread, context }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
