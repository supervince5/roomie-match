import type { ReactNode } from "react";

type Props = {
  busy: boolean;
  children: ReactNode;
  pace?: "list" | "detail" | "search";
};

// Keep the subtree mounted: refreshing data must not reset forms or conversations.
// CSS restarts the reveal only when loading completes, not on ordinary rerenders.
export default function ContentArrival({ busy, children, pace = "list" }: Props) {
  return (
    <div className={`content-arrival content-arrival--${pace}`}
      data-ready={!busy} aria-busy={busy}>
      {children}
    </div>
  );
}
