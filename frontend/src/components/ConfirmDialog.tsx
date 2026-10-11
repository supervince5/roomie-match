import { useEffect, useRef, useState } from "react";
import FormErrors from "./FormErrors";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  busyLabel?: string;
  busy?: boolean;
  error?: unknown;
  // For serious actions: the confirm button stays disabled until this exact word is typed
  requireTyping?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// An in-app "are you sure?" pop-up, used instead of the browser's window.confirm().
// Built on the HTML <dialog> element, which handles the dark backdrop, keeping focus
// inside the dialog, and closing on Escape for us.
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  busyLabel,
  busy = false,
  error,
  requireTyping,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const canConfirm = !busy && (requireTyping === undefined || typed === requireTyping);

  function cancel() {
    setTyped("");
    onCancel();
  }

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      onCancel={(event) => {
        event.preventDefault(); // Escape key: close through React state instead
        if (!busy) cancel();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !busy) cancel(); // click on the dark backdrop
      }}
    >
      <h2>{title}</h2>
      <p>{message}</p>

      {requireTyping !== undefined && (
        <label className="field">
          <span>Type {requireTyping} to confirm</span>
          <input value={typed} autoComplete="off" onChange={(e) => setTyped(e.target.value)} />
        </label>
      )}

      <FormErrors error={error} />

      <div className="confirm-dialog__buttons">
        <button className="secondary-button" type="button" disabled={busy} onClick={cancel}>
          Cancel
        </button>
        <button className="danger-button" type="button" disabled={!canConfirm} onClick={onConfirm}>
          {busy ? (busyLabel ?? confirmLabel) : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

export default ConfirmDialog;
