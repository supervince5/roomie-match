import { ArrowRight, Check, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import BrandMark from "./BrandMark";
import { isOutsideDialog } from "../lib/dialog";
import { submitWaitlist } from "../lib/waitlist";

export default function WaitlistDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inFlight = useRef(false);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog?.open) dialog?.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || status === "saved") return;
    inFlight.current = true;
    setStatus("saving");
    setError("");
    try {
      await submitWaitlist(import.meta.env.VITE_API_URL, email, website);
      setStatus("saved");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "we couldn’t save your email. please try again.");
      setStatus("idle");
    } finally {
      inFlight.current = false;
    }
  }

  return (
    <dialog ref={dialogRef} className="waitlist-dialog" aria-labelledby="waitlist-title"
      aria-describedby="waitlist-description"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target === event.currentTarget && isOutsideDialog(event, event.currentTarget.getBoundingClientRect())) onClose();
      }}>
      <button type="button" className="waitlist-close" aria-label="close waitlist" onClick={onClose}><X size={21} /></button>
      <div className="waitlist-mark"><BrandMark /></div>
      <div aria-live="polite">
        <p className="waitlist-eyebrow">a little something is brewing</p>
        <h2 id="waitlist-title">{status === "saved" ? "you’re on the list." : "your roomie era awaits."}</h2>
        <p id="waitlist-description">{status === "saved"
          ? "we’ll email you when matcharoomie opens. until then, good luck with your decisions."
          : "find someone who feels like home. we’re opening after uva early decision results."}</p>
      </div>
      {status === "saved" ? (
        <button type="button" className="minimal-cta waitlist-submit" onClick={onClose}>sounds good <Check size={18} /></button>
      ) : (
        <form onSubmit={submit} aria-busy={status === "saving"}>
          <label className="waitlist-label" htmlFor="waitlist-email">your email</label>
          <input id="waitlist-email" name="email" type="email" autoComplete="email" required maxLength={254}
            placeholder="you@example.com" value={email} disabled={status === "saving"}
            aria-describedby={error ? "waitlist-error waitlist-consent" : "waitlist-consent"}
            onChange={(event) => setEmail(event.target.value)} />
          <div className="waitlist-honey" aria-hidden="true">
            <label htmlFor="waitlist-website">website</label>
            <input id="waitlist-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
          </div>
          {error && <p id="waitlist-error" className="waitlist-error" role="alert">{error}</p>}
          <button className="minimal-cta waitlist-submit" type="submit" disabled={status === "saving"}>
            {status === "saving" ? "saving your spot…" : "join the waitlist"}<ArrowRight size={18} />
          </button>
          <p id="waitlist-consent" className="waitlist-consent">by joining, you agree to a launch email from matcharoomie. your email stays private. no account needed.</p>
        </form>
      )}
    </dialog>
  );
}
