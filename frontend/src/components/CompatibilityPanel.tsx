import { Check, MessageCircle, Sparkles } from "lucide-react";
import { useApi } from "../lib/useApi";
import { compareProfiles } from "../lib/compatibility";
import type { Profile } from "../types/profile";
export default function CompatibilityPanel({ profile }: { profile: Profile }) {
  const { data: me } = useApi<Profile>("/profiles");
  if (!me || me.id === profile.id) return null;
  return (
    <section className="compatibility-panel">
      <p className="eyebrow">
        <Sparkles size={14} /> YOUR EVERYDAY FIT
      </p>
      <h3>A little more in common.</h3>
      <div className="fit-list">
        {compareProfiles(me, profile).map((f) => (
          <div className="fit-item" key={f.label}>
            <span className={f.aligned ? "fit-icon is-aligned" : "fit-icon"}>
              {f.aligned ? <Check size={16} /> : <MessageCircle size={16} />}
            </span>
            <div>
              <strong>{f.label}</strong>
              <p>{f.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <small>
        Based on what you both shared. Start a conversation about the details.
      </small>
    </section>
  );
}
