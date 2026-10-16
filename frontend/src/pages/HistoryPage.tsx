import { ArrowLeft, Heart, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import ConfirmDialog from "../components/ConfirmDialog";
import FormErrors from "../components/FormErrors";
import PersonRow from "../components/PersonRow";
import { switchSwipe, undoSwipe, type SwipeDirection } from "../lib/swipes";
import { useApi } from "../lib/useApi";
import type { Profile } from "../types/profile";

type HistoryItem = { direction: SwipeDirection; swipedAt: string; matched: boolean; profile: Profile };

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

// Your last 15 swipes. Made a mistake? Undo it (they go back into Discover) or switch it.
function HistoryPage() {
  const { data, error, loading, reload } = useApi<{ history: HistoryItem[] }>("/swipes");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // Undoing a like that made a match also unmatches, so ask first
  const [confirmItem, setConfirmItem] = useState<{ item: HistoryItem; action: "undo" | "switch" } | null>(null);

  async function run(item: HistoryItem, action: "undo" | "switch") {
    setBusyId(item.profile.id);
    setActionError(null);
    setNotice(null);
    try {
      if (action === "undo") {
        await undoSwipe(item.profile.id);
        setNotice(`Undone. ${item.profile.name} is back in your Discover.`);
      } else {
        const result = await switchSwipe(item.profile.id, item.direction === "like" ? "pass" : "like");
        setNotice(result.matched ? `It's a match with ${item.profile.name}!` : `Switched to ${item.direction === "like" ? "pass" : "like"}.`);
      }
      reload();
    } catch (caught) {
      setActionError(caught);
    } finally {
      setBusyId(null);
      setConfirmItem(null);
    }
  }

  function request(item: HistoryItem, action: "undo" | "switch") {
    if (item.matched) {
      setConfirmItem({ item, action });
    } else {
      run(item, action);
    }
  }

  const history = data?.history ?? [];

  let content;
  if (loading) {
    content = <p className="status-message">Loading your swipes...</p>;
  } else if (error) {
    content = <FormErrors error={error} />;
  } else if (history.length === 0) {
    content = <p className="status-message">No swipes yet. Your last 15 will show up here.</p>;
  } else {
    content = (
      <section className="match-list">
        {history.map((item) => {
          const busy = busyId === item.profile.id;
          return (
            <PersonRow
              key={item.profile.id}
              profile={item.profile}
              to={`/people/${encodeURIComponent(item.profile.id)}`}
              aside={
                <div className="history-row__aside">
                  <span className={`badge ${item.direction === "like" ? "badge--like" : "badge--pass"}`}>
                    {item.direction === "like" ? <Heart size={12} /> : <X size={12} />}
                    {item.matched ? "Matched" : item.direction === "like" ? "Liked" : "Passed"}
                  </span>
                  <small>{timeAgo(item.swipedAt)}</small>
                  <div className="history-row__buttons">
                    <button className="small-button" type="button" disabled={busy} onClick={() => request(item, "undo")}>
                      Undo
                    </button>
                    <button className="small-button" type="button" disabled={busy} onClick={() => request(item, "switch")}>
                      {item.direction === "like" ? "Pass" : "Like"}
                    </button>
                  </div>
                </div>
              }
            />
          );
        })}
      </section>
    );
  }

  return (
    <main className="page page--with-navigation">
      <header className="page-header page-header--with-back">
        <Link viewTransition className="icon-button" to="/discover" aria-label="Back to Discover">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <p className="eyebrow">Last 15 swipes</p>
          <h1>History</h1>
        </div>
      </header>

      {notice && <p className="decision-message" role="status">{notice}</p>}
      <FormErrors error={actionError} />
      {content}

      <ConfirmDialog
        open={confirmItem !== null}
        title={`Unmatch with ${confirmItem?.item.profile.name ?? ""}?`}
        message="You matched with them. Changing this swipe will also remove the match."
        confirmLabel={confirmItem?.action === "undo" ? "Undo and unmatch" : "Pass and unmatch"}
        busy={busyId !== null}
        onConfirm={() => confirmItem && run(confirmItem.item, confirmItem.action)}
        onCancel={() => setConfirmItem(null)}
      />
    </main>
  );
}

export default HistoryPage;
