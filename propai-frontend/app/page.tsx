"use client";
import { useEffect, useMemo, useState } from "react";

// ---------- Types ----------
export type Context = {
  tenant_name: string;
  unit: string;
  address: string;
  hotline?: string;
  portal_url?: string;
  property_name?: string;
};

type Message = { role: "user" | "assistant"; content: string };

type ClassifyResult = {
  category: "maintenance" | "rent" | "general" | "emergency" | "other";
  priority: "low" | "normal" | "high" | "critical";
  entities: Record<string, any>;
  action: "route_to_pm" | "auto_reply" | "escalate" | "ask_clarify";
  reply: string;
  confidence: number;
};

// ---------- Config ----------
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

// ---------- Helpers ----------
function clsx(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function pretty(obj: any) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

function storage<T>(key: string, initial: T) {
  const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  if (raw) {
    try {
      return JSON.parse(raw) as T;
    } catch {}
  }
  return initial;
}

// ---------- Main UI ----------
export default function Home() {
  // Conversations (stored as contexts)
  const [convos, setConvos] = useState<Context[]>(() =>
    storage<Context[]>("propai.convos", [
      {
        tenant_name: "John Doe",
        unit: "3A",
        address: "123 Maple St, Atlanta, GA 30318",
        hotline: "+1-555-0100",
        portal_url: "https://portal.example.com/login",
        property_name: "Maple Court",
      },
    ])
  );
  const [selectedIdx, setSelectedIdx] = useState(0);
  const context = useMemo(() => convos[selectedIdx], [convos, selectedIdx]);

  // Thread state
  const [history, setHistory] = useState<Message[]>([]); // from backend
  const [pending, setPending] = useState<string[]>([]); // not yet sent to backend
  const [draft, setDraft] = useState("");

  // Result state
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist convos
  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("propai.convos", JSON.stringify(convos));
  }, [convos]);

  // Load history for selected convo
  useEffect(() => {
    if (!context) return;
    const url = `${BACKEND_URL}/history/${encodeURIComponent(
      context.tenant_name
    )}/${encodeURIComponent(context.unit)}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => setHistory(data || []))
      .catch(() => setHistory([]));
  }, [context]);

  function updateContext<K extends keyof Context>(key: K, val: Context[K]) {
    setConvos((old) => {
      const copy = [...old];
      copy[selectedIdx] = { ...copy[selectedIdx], [key]: val } as Context;
      return copy;
    });
  }

  function addConvo() {
    setConvos((old) => [
      ...old,
      {
        tenant_name: "New Tenant",
        unit: "1A",
        address: "",
        hotline: "",
        portal_url: "",
        property_name: "",
      },
    ]);
    setSelectedIdx(convos.length);
    setHistory([]);
    setPending([]);
    setResult(null);
  }

  function queueMessage() {
    const msg = draft.trim();
    if (!msg) return;
    setPending((p) => [...p, msg]);
    setDraft("");
  }

  async function classify() {
    setError(null);
    if (!context?.tenant_name || !context?.unit || !context?.address) {
      setError("Context requires tenant_name, unit, and address.");
      return;
    }
    // If user hasn't queued the current draft, include it
    let toSend = pending;
    if (draft.trim()) {
      toSend = [...pending, draft.trim()];
      setDraft("");
    }
    if (toSend.length === 0) {
      setError("Add at least one tenant message before classifying.");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread: toSend, context }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      const data: ClassifyResult = await resp.json();
      setResult(data);
      setPending([]);
      // Refresh history from server so UI matches backend memory
      const h = await fetch(
        `${BACKEND_URL}/history/${encodeURIComponent(
          context.tenant_name
        )}/${encodeURIComponent(context.unit)}`
      ).then((r) => r.json());
      setHistory(h || []);
    } catch (e: any) {
      setError(e?.message || "Classification failed");
    } finally {
      setLoading(false);
    }
  }

  function loadExample(kind: "maintenance" | "emergency" | "rent" | "spam") {
    const base = {
      tenant_name: "John Doe",
      unit: "3A",
      address: "123 Maple St, Atlanta, GA 30318",
      hotline: "+1-555-0100",
      portal_url: "https://portal.example.com/login",
      property_name: "Maple Court",
    } as Context;
    const payloads: Record<string, string[]> = {
      maintenance: [
        "Hi, my dishwasher keeps tripping the breaker.",
        "It happened twice today.",
      ],
      emergency: [
        "Water is pouring from the ceiling into the hallway right now.",
      ],
      rent: ["When is rent due and how much do I owe this month?"],
      spam: ["🔥 Exclusive solar panel deal! Save 50% this weekend only!"],
    };
    setConvos((old) => {
      const copy = [...old];
      copy[selectedIdx] = { ...copy[selectedIdx], ...base };
      return copy;
    });
    setPending(payloads[kind]);
    setResult(null);
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-12 gap-4 p-4 bg-gray-50">
      {/* Sidebar */}
      <aside className="col-span-3 bg-white rounded-2xl shadow p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <button
            onClick={addConvo}
            className="px-3 py-1.5 rounded-xl bg-black text-white text-sm"
          >
            + New
          </button>
        </div>
        <div className="space-y-2 overflow-auto">
          {convos.map((c, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={clsx(
                "w-full text-left p-3 rounded-xl border",
                i === selectedIdx ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-100"
              )}
            >
              <div className="font-medium">{c.tenant_name || "(no name)"}</div>
              <div className="text-xs opacity-80">Unit {c.unit || "?"}</div>
            </button>
          ))}
        </div>
        <div className="mt-4">
          <div className="text-xs font-semibold mb-2">Quick examples</div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => loadExample("maintenance")} className="text-xs px-2 py-1 border rounded-lg">Maintenance</button>
            <button onClick={() => loadExample("emergency")} className="text-xs px-2 py-1 border rounded-lg">Emergency</button>
            <button onClick={() => loadExample("rent")} className="text-xs px-2 py-1 border rounded-lg">Rent</button>
            <button onClick={() => loadExample("spam")} className="text-xs px-2 py-1 border rounded-lg">Spam</button>
          </div>
        </div>
      </aside>

      {/* Chat */}
      <main className="col-span-6 bg-white rounded-2xl shadow p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-3">Conversation</h2>
        <div className="flex-1 overflow-auto space-y-2">
          {history.length === 0 && pending.length === 0 ? (
            <div className="text-sm text-gray-500">No messages yet. Add one below.</div>
          ) : null}
          {history.map((m, idx) => (
            <div key={idx} className={clsx("p-3 rounded-xl", m.role === "user" ? "bg-gray-100" : "bg-gray-900 text-white")}> 
              <div className="text-xs opacity-70 mb-1">{m.role}</div>
              <div className="text-sm whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}
          {pending.map((p, idx) => (
            <div key={`p-${idx}`} className="p-3 rounded-xl border border-dashed">
              <div className="text-xs opacity-70 mb-1">pending</div>
              <div className="text-sm whitespace-pre-wrap">{p}</div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type tenant message…"
            className="w-full border rounded-xl p-3 min-h-[90px]"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={queueMessage}
              className="px-3 py-2 rounded-xl border"
            >
              Add to thread
            </button>
            <button
              onClick={classify}
              disabled={loading}
              className={clsx(
                "px-4 py-2 rounded-xl text-white",
                loading ? "bg-gray-400" : "bg-black"
              )}
            >
              {loading ? "Classifying…" : "Classify with AI"}
            </button>
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-600">{error}</div>
          )}
        </div>
      </main>

      {/* Context + Result */}
      <aside className="col-span-3 flex flex-col gap-4">
        <section className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Context</h2>
          <div className="space-y-2 text-sm">
            <LabeledInput label="Tenant name" value={context?.tenant_name || ""} onChange={(v) => updateContext("tenant_name", v)} />
            <LabeledInput label="Unit" value={context?.unit || ""} onChange={(v) => updateContext("unit", v)} />
            <LabeledInput label="Address" value={context?.address || ""} onChange={(v) => updateContext("address", v)} />
            <LabeledInput label="Hotline" value={context?.hotline || ""} onChange={(v) => updateContext("hotline", v)} />
            <LabeledInput label="Portal URL" value={context?.portal_url || ""} onChange={(v) => updateContext("portal_url", v)} />
            <LabeledInput label="Property name" value={context?.property_name || ""} onChange={(v) => updateContext("property_name", v)} />
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold mb-3">AI Result</h2>
          {result ? (
            <div className="space-y-2 text-sm">
              <Row name="Category" value={result.category} />
              <Row name="Priority" value={result.priority} />
              <Row name="Action" value={result.action} />
              <Row name="Confidence" value={result.confidence.toFixed(2)} />
              <div>
                <div className="text-xs font-semibold opacity-70 mb-1">Reply</div>
                <div className="border rounded-xl p-2 whitespace-pre-wrap">{result.reply}</div>
              </div>
              <details className="mt-2">
                <summary className="text-xs opacity-70 cursor-pointer">Entities (JSON)</summary>
                <pre className="text-xs mt-1 bg-gray-50 p-2 rounded-xl overflow-auto max-h-40">
{pretty(result.entities)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No result yet.</div>
          )}
        </section>
      </aside>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold opacity-70 mb-1">{label}</div>
      <input
        className="w-full border rounded-xl px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Row({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-xs font-semibold opacity-70">{name}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
