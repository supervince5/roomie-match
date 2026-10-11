import { Check, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
export default function InviteButton() {
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState(false);
  const url = import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin;
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(url);
  return (
    <div className="invite-control">
      <button
        className="secondary-button"
        type="button"
        onClick={async () => {
          if (isLocal) {
            setFallback(true);
            return;
          }
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
          } catch {
            setFallback(true);
          }
        }}
      >
        {copied ? <Check size={17} /> : <LinkIcon size={17} />}{" "}
        {copied ? "Invite link copied" : "Invite a classmate"}
      </button>
      {copied && (
        <span className="sr-only" role="status">
          Invite link copied to clipboard.
        </span>
      )}
      {fallback && isLocal && (
        <p className="page-subtitle" role="status">
          Invites will be available when RoomieMatch has a public web address.
        </p>
      )}
      {fallback && !isLocal && (
        <label className="field">
          <span>Copy this link to invite a friend</span>
          <input readOnly value={url} onFocus={(e) => e.target.select()} />
        </label>
      )}
    </div>
  );
}
