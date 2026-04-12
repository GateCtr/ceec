"use client";

import { useState } from "react";

type Message = {
  id: number;
  nom: string;
  email: string;
  telephone: string | null;
  sujet: string | null;
  message: string;
  lu: boolean;
  createdAt: string;
};

type Props = {
  initialMessages: Message[];
  initialTotal: number;
  initialPages: number;
  initialNonLus: number;
};

export default function ContactMessagesClient({
  initialMessages,
  initialTotal,
  initialPages,
  initialNonLus,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [total, setTotal] = useState(initialTotal);
  const [pages, setPages] = useState(initialPages);
  const [nonLus, setNonLus] = useState(initialNonLus);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterNonLu, setFilterNonLu] = useState(false);
  const [selected, setSelected] = useState<Message | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function fetchPage(p: number, nonLu: boolean) {
    setLoading(true);
    try {
      const url = `/api/gestion/contact?page=${p}${nonLu ? "&nonLu=true" : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setMessages(data.messages ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      setNonLus(data.nonLus ?? 0);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: number, lu: boolean) {
    const res = await fetch(`/api/gestion/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lu }),
    });
    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, lu } : m))
      );
      setNonLus((n) => lu ? Math.max(0, n - 1) : n + 1);
      if (selected?.id === id) setSelected((m) => m ? { ...m, lu } : m);
    }
  }

  async function deleteMessage(id: number) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/gestion/contact/${id}`, { method: "DELETE" });
      if (res.ok) {
        const wasUnread = messages.find((m) => m.id === id)?.lu === false;
        setMessages((prev) => prev.filter((m) => m.id !== id));
        setTotal((t) => Math.max(0, t - 1));
        if (wasUnread) setNonLus((n) => Math.max(0, n - 1));
        if (selected?.id === id) setSelected(null);
      }
    } finally {
      setDeleting(null);
    }
  }

  function openMessage(msg: Message) {
    setSelected(msg);
    if (!msg.lu) {
      markAsRead(msg.id, true);
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function toggleFilter() {
    const newFilter = !filterNonLu;
    setFilterNonLu(newFilter);
    fetchPage(1, newFilter);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 20 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 14, color: "#64748b" }}>
            {total} message{total !== 1 ? "s" : ""}
            {nonLus > 0 && (
              <span style={{ marginLeft: 8, background: "#1e3a8a", color: "white", borderRadius: 12, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>
                {nonLus} non lu{nonLus !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            onClick={toggleFilter}
            style={{
              padding: "6px 14px", borderRadius: 7,
              background: filterNonLu ? "#1e3a8a" : "white",
              color: filterNonLu ? "white" : "#374151",
              border: "1px solid " + (filterNonLu ? "#1e3a8a" : "#d1d5db"),
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            {filterNonLu ? "✕ Non lus seulement" : "Non lus seulement"}
          </button>
          <button
            onClick={() => fetchPage(page, filterNonLu)}
            disabled={loading}
            style={{ padding: "6px 14px", borderRadius: 7, background: "white", color: "#374151", border: "1px solid #d1d5db", fontSize: 13, cursor: "pointer" }}
          >
            ↻ Actualiser
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Chargement…</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", background: "white", borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
            <p style={{ fontWeight: 600 }}>Aucun message{filterNonLu ? " non lu" : ""}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => openMessage(msg)}
                style={{
                  background: "white",
                  border: `1px solid ${selected?.id === msg.id ? "#1e3a8a" : "#e2e8f0"}`,
                  borderRadius: 10,
                  padding: "14px 16px",
                  cursor: "pointer",
                  position: "relative",
                  borderLeft: `4px solid ${msg.lu ? "#e2e8f0" : "#1e3a8a"}`,
                  transition: "border-color 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      {!msg.lu && (
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1e3a8a", flexShrink: 0, display: "inline-block" }} />
                      )}
                      <span style={{ fontWeight: msg.lu ? 600 : 700, fontSize: 14, color: "#0f172a" }}>
                        {msg.nom}
                      </span>
                      <span style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0 }}>{formatDate(msg.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#475569", marginBottom: 2 }}>{msg.email}</div>
                    {msg.sujet && (
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                        {msg.sujet}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {msg.message}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                    disabled={deleting === msg.id}
                    style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: 16, padding: "0 4px", flexShrink: 0 }}
                    title="Supprimer"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
            <button onClick={() => fetchPage(page - 1, filterNonLu)} disabled={page <= 1 || loading} style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid #d1d5db", background: "white", fontSize: 13, cursor: "pointer", opacity: page <= 1 ? 0.5 : 1 }}>
              ← Préc.
            </button>
            <span style={{ padding: "7px 14px", fontSize: 13, color: "#64748b" }}>
              Page {page} / {pages}
            </span>
            <button onClick={() => fetchPage(page + 1, filterNonLu)} disabled={page >= pages || loading} style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid #d1d5db", background: "white", fontSize: 13, cursor: "pointer", opacity: page >= pages ? 0.5 : 1 }}>
              Suiv. →
            </button>
          </div>
        )}
      </div>

      {selected && (
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: "1.5rem", alignSelf: "start", position: "sticky", top: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", margin: 0 }}>Détail du message</h3>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>✕</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Expéditeur</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{selected.nom}</div>
              <a href={`mailto:${selected.email}`} style={{ fontSize: 14, color: "#1e3a8a", textDecoration: "none" }}>{selected.email}</a>
              {selected.telephone && (
                <div style={{ fontSize: 14, color: "#475569", marginTop: 4 }}>📞 {selected.telephone}</div>
              )}
            </div>

            {selected.sujet && (
              <div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Sujet</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>{selected.sujet}</div>
              </div>
            )}

            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Message</div>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selected.message}</div>
            </div>

            <div style={{ fontSize: 12, color: "#94a3b8" }}>Reçu le {formatDate(selected.createdAt)}</div>

            <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
              <a
                href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: " + (selected.sujet ?? "Votre message"))}`}
                style={{ flex: 1, padding: "9px 16px", borderRadius: 8, background: "#1e3a8a", color: "white", textDecoration: "none", fontWeight: 600, fontSize: 13, textAlign: "center" }}
              >
                ✉️ Répondre
              </a>
              <button
                onClick={() => markAsRead(selected.id, !selected.lu)}
                style={{ padding: "9px 16px", borderRadius: 8, background: "white", border: "1px solid #d1d5db", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >
                {selected.lu ? "Marquer non lu" : "Marquer lu"}
              </button>
              <button
                onClick={() => deleteMessage(selected.id)}
                disabled={deleting === selected.id}
                style={{ padding: "9px 16px", borderRadius: 8, background: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >
                🗑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
