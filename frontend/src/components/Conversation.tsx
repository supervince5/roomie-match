import { MessageCircle, RefreshCw, Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "../auth/authContext";
import { ApiError, apiRequest } from "../lib/api";
type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
};
type Props = { matchId: string; name: string };
export default function Conversation({ matchId, name }: Props) {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]),
    [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null),
    [loading, setLoading] = useState(true),
    [sending, setSending] = useState(false),
    [retry, setRetry] = useState(0);
  const scroll = useRef<HTMLDivElement>(null);
  const requestId = useRef<string | null>(null);
  const sendingRef = useRef(false);
  useEffect(() => {
    let cancelled = false;
    let running = false;
    async function refresh() {
      if (running) return;
      running = true;
      try {
        const data = await apiRequest<{ messages: Message[] }>(
          `/matches/${encodeURIComponent(matchId)}/messages`,
        );
        if (!cancelled) {
          setMessages((previous) => {
            const merged = new Map(
              [...previous, ...data.messages].map((m) => [m.id, m]),
            );
            return [...merged.values()].sort((a, b) =>
              a.createdAt.localeCompare(b.createdAt),
            );
          });
          setError(null);
        }
      } catch (e) {
        if (!cancelled)
          setError(
            e instanceof ApiError && e.status === 404
              ? "This conversation is unavailable. Refresh your matches, or try again shortly."
              : e instanceof Error
                ? e.message
                : "Could not load your conversation.",
          );
      } finally {
        running = false;
        if (!cancelled) setLoading(false);
      }
    }
    refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [matchId, retry]);
  useEffect(() => {
    const el = scroll.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);
  async function send(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setError(null);
    requestId.current ??= crypto.randomUUID();
    try {
      const result = await apiRequest<{ message: Message }>(
        `/matches/${encodeURIComponent(matchId)}/messages`,
        {
          method: "POST",
          body: { text: draft.trim(), clientId: requestId.current },
        },
      );
      setMessages((previous) =>
        [
          ...previous.filter((m) => m.id !== result.message.id),
          result.message,
        ].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      );
      setDraft("");
      requestId.current = null;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Your message could not be sent. Please try again.",
      );
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }
  return (
    <section className="conversation" aria-label={`Conversation with ${name}`}>
      <header className="conversation-header">
        <h2>Say hello to {name}.</h2>
        <p>
          Just between you and your match. Showing your latest 100 messages.
        </p>
      </header>
      {error && (
        <div className="form-errors" role="alert">
          {error}
        </div>
      )}
      {error && (
        <button
          className="small-button conversation-retry"
          type="button"
          onClick={() => setRetry((v) => v + 1)}
        >
          <RefreshCw size={13} /> Try again
        </button>
      )}
      <div
        className="message-list"
        ref={scroll}
        role="log"
        aria-label="Messages"
        aria-live="polite"
      >
        {loading ? (
          <p className="status-message">Opening your conversation…</p>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <MessageCircle size={26} />
            <h3>Every friendship starts somewhere.</h3>
            <p>
              Ask about their ideal home, quiet hours, or plans for next
              semester.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              className={`message-bubble ${m.senderId === userId ? "is-mine" : ""}`}
              key={m.id}
            >
              <span className="sr-only">
                {m.senderId === userId ? "You" : name}:{" "}
              </span>
              <p>{m.text}</p>
              <time dateTime={m.createdAt}>
                {new Date(m.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </time>
            </div>
          ))
        )}
      </div>
      {messages.length === 0 && (
        <div className="conversation-starters">
          {[
            "What does your ideal weekday at home look like?",
            "What are your plans for move-in?",
          ].map((text) => (
            <button
              type="button"
              key={text}
              disabled={sending}
              onClick={() => {
                setDraft(text);
                requestId.current = null;
              }}
            >
              {text}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={send}>
        <label className="sr-only" htmlFor="message-draft">
          Message {name}
        </label>
        <textarea
          id="message-draft"
          placeholder="A simple hello is a good start…"
          value={draft}
          maxLength={2000}
          disabled={sending}
          onChange={(e) => {
            setDraft(e.target.value);
            requestId.current = null;
          }}
        />
        <div className="message-compose-bottom">
          <span>{draft.length}/2,000 · Only mutual matches can message</span>
          <button
            type="submit"
            className="primary-button"
            disabled={sending || !draft.trim() || loading}
          >
            {sending ? "Sending…" : "Send"}
            <Send size={14} />
          </button>
        </div>
      </form>
    </section>
  );
}
