"use client";

import { useState } from "react";
import { Mail, Trash2, Phone, X, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className={`grid gap-5 ${selected ? "grid-cols-2" : "grid-cols-1"}`}>
      <div>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="text-sm text-muted-foreground">
            {total} message{total !== 1 ? "s" : ""}
            {nonLus > 0 && (
              <span className="badge badge-primary ml-2 text-white bg-primary">
                {nonLus} non lu{nonLus !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            onClick={toggleFilter}
            className={`btn btn-sm cursor-pointer ${
              filterNonLu ? "btn-primary" : "btn-outline border-gray-300 text-slate-700"
            }`}
          >
            {filterNonLu ? <><X size={12} className="mr-1" />Non lus seulement</> : "Non lus seulement"}
          </button>
          <button
            onClick={() => fetchPage(page, filterNonLu)}
            disabled={loading}
            className="btn btn-sm btn-outline border-gray-300 text-slate-700 cursor-pointer"
          >
            <RefreshCw size={13} /> Actualiser
          </button>
        </div>

        {loading ? (
          <div className="text-center p-12 text-slate-400">Chargement…</div>
        ) : messages.length === 0 ? (
          <div className="card text-center p-12 text-slate-400">
            <div className="flex justify-center mb-3">
              <Mail size={40} className="text-border" />
            </div>
            <p className="font-semibold">Aucun message{filterNonLu ? " non lu" : ""}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`bg-white rounded-[10px] py-3.5 px-4 cursor-pointer relative transition-colors duration-150 border ${
                  selected?.id === msg.id ? "border-primary" : "border-border"
                } ${msg.lu ? "border-l-4 border-l-border" : "border-l-4 border-l-primary"}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!msg.lu && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 inline-block" />
                      )}
                      <span className={`${msg.lu ? "font-semibold" : "font-bold"} text-sm text-foreground`}>
                        {msg.nom}
                      </span>
                      <span className="text-xs text-slate-400 shrink-0">{formatDate(msg.createdAt)}</span>
                    </div>
                    <div className="text-[13px] text-slate-600 mb-0.5">{msg.email}</div>
                    {msg.sujet && (
                      <div className="text-[13px] font-semibold text-slate-700 mb-1">
                        {msg.sujet}
                      </div>
                    )}
                    <div className="text-[13px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                      {msg.message}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                    disabled={deleting === msg.id}
                    className="bg-transparent border-none text-slate-300 cursor-pointer px-1 shrink-0 flex items-center hover:text-red-400 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => fetchPage(page - 1, filterNonLu)}
              disabled={page <= 1 || loading}
              className={`btn btn-sm btn-outline border-gray-300 text-slate-700 cursor-pointer ${page <= 1 ? "opacity-50" : ""}`}
            >
              <ChevronLeft size={14} /> Préc.
            </button>
            <span className="py-1.5 px-3.5 text-[13px] text-muted-foreground">
              Page {page} / {pages}
            </span>
            <button
              onClick={() => fetchPage(page + 1, filterNonLu)}
              disabled={page >= pages || loading}
              className={`btn btn-sm btn-outline border-gray-300 text-slate-700 cursor-pointer ${page >= pages ? "opacity-50" : ""}`}
            >
              Suiv. <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {selected && (
        <div className="card p-6 self-start sticky top-5">
          <div className="flex justify-between items-start mb-5">
            <h3 className="font-bold text-base text-foreground m-0">Détail du message</h3>
            <button onClick={() => setSelected(null)} className="bg-transparent border-none cursor-pointer text-slate-400 flex items-center"><X size={18} /></button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="bg-primary-50 rounded-[10px] py-3 px-3.5">
              <div className="overline mb-0.5">Expéditeur</div>
              <div className="font-bold text-[15px] text-foreground">{selected.nom}</div>
              <a href={`mailto:${selected.email}`} className="text-sm text-primary no-underline">{selected.email}</a>
              {selected.telephone && (
                <div className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                  <Phone size={13} className="text-slate-400" />{selected.telephone}
                </div>
              )}
            </div>

            {selected.sujet && (
              <div>
                <div className="overline mb-1">Sujet</div>
                <div className="font-semibold text-sm text-slate-700">{selected.sujet}</div>
              </div>
            )}

            <div>
              <div className="overline mb-1">Message</div>
              <div className="text-sm text-slate-700 leading-[1.7] whitespace-pre-wrap">{selected.message}</div>
            </div>

            <div className="text-xs text-slate-400">Reçu le {formatDate(selected.createdAt)}</div>

            <div className="flex gap-2.5 pt-2">
              <a
                href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: " + (selected.sujet ?? "Votre message"))}`}
                className="btn btn-primary flex-1 text-center"
              >
                <Mail size={14} /> Répondre
              </a>
              <button
                onClick={() => markAsRead(selected.id, !selected.lu)}
                className="btn btn-outline border-gray-300 text-slate-700"
              >
                {selected.lu ? "Marquer non lu" : "Marquer lu"}
              </button>
              <button
                onClick={() => deleteMessage(selected.id)}
                disabled={deleting === selected.id}
                className="btn btn-danger bg-red-100 border-red-300 text-red-700"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
