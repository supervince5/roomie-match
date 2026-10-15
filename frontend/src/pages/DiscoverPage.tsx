import { isOutsideDialog } from "../lib/dialog";
import SwipeSurface from "../components/SwipeSurface";
import InviteButton from "../components/InviteButton";
import {
  Heart,
  History,
  PartyPopper,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import FormErrors from "../components/FormErrors";
import ProfileCard, { InstagramLink } from "../components/ProfileCard";
import SchoolPicker, { type SchoolOption } from "../components/SchoolPicker";
import { ApiError, apiRequest } from "../lib/api";
import { useAuth } from "../auth/authContext";
import {
  pickDiscoverNote,
  type DiscoverFeedbackKind,
} from "../lib/discoverFeedback";
import { useDiscoverSound } from "../lib/useDiscoverSound";
import "../discover.css";
import {
  invalidateApiCache,
  readApiCache,
  updateApiCache,
  writeApiCache,
} from "../lib/useApi";
import {
  CLEANLINESS_LABELS,
  SLEEP_LABELS,
  TAGS,
  type MatchedProfile,
  type Profile,
} from "../types/profile";

type SwipeAction = "like" | "pass";

// Each filter is a URL setting, e.g. { smoking: "false" } becomes ?smoking=false.
// An empty value means "any", so it's left out of the URL.
type Filters = {
  schoolId: string;
  major: string;
  classYear: string;
  minAge: string;
  maxAge: string;
  moveInBy: string;
  sleepSchedule: string;
  cleanliness: string;
  smoking: string;
  pets: string;
  maxBudget: string;
  tag: string;
};

const NO_FILTERS: Filters = {
  schoolId: "",
  major: "",
  classYear: "",
  minAge: "",
  maxAge: "",
  moveInBy: "",
  sleepSchedule: "",
  cleanliness: "",
  smoking: "",
  pets: "",
  maxBudget: "",
  tag: "",
};

const THIS_YEAR = new Date().getFullYear();
const CLASS_YEARS = Array.from({ length: 8 }, (_, i) => THIS_YEAR + i);
function toQueryString(filters: Filters, cursor?: string) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "") {
      params.set(key, value);
    }
  }
  if (cursor) {
    params.set("cursor", cursor);
  }
  const query = params.toString();
  return query === "" ? "" : "?" + query;
}

type DiscoverResponse = {
  school: { id: number; name: string };
  profiles: Profile[];
  nextCursor: string | null;
};

// Everything loaded so far for one set of filters. `key` says which filters it belongs to.
type Feed = {
  key: string;
  school?: { id: number; name: string };
  profiles: Profile[];
  nextCursor: string | null;
  error: ApiError | null;
};

const LOAD_MORE_WHEN_LEFT = 3; // start fetching the next batch when this few profiles are left

function asApiError(caught: unknown) {
  return caught instanceof ApiError
    ? caught
    : new ApiError(0, "Something went wrong.");
}

function DiscoverPage({ previewProfiles }: { previewProfiles?: Profile[] }) {
  const { userId } = useAuth();
  const preview = import.meta.env.DEV && previewProfiles !== undefined;
  const preferenceKey = `roomie.discover.preferences.${preview ? "design-preview-v2" : userId}`;
  const [initial] = useState(() => {
    try {
      const raw = localStorage.getItem(preferenceKey);
      if (!raw) return null;
      const stored = JSON.parse(raw);
      const filters = { ...NO_FILTERS };
      for (const key of Object.keys(filters) as (keyof Filters)[]) {
        if (typeof stored.filters?.[key] === "string")
          filters[key] = stored.filters[key];
      }
      const school =
        typeof stored.school?.id === "number" &&
        typeof stored.school?.name === "string"
          ? (stored.school as SchoolOption)
          : null;
      return { filters, school };
    } catch {
      return null;
    }
  });
  const [filters, setFilters] = useState<Filters>(
    initial?.filters ?? NO_FILTERS,
  );
  const [draft, setDraft] = useState<Filters>(initial?.filters ?? NO_FILTERS);
  const [filterSchool, setFilterSchool] = useState<SchoolOption | null>(
    initial?.school ?? null,
  );
  const [appliedSchool, setAppliedSchool] = useState<SchoolOption | null>(
    initial?.school ?? null,
  );
  const [ready, setReady] = useState(initial !== null);
  const [showFilters, setShowFilters] = useState(initial === null);
  const [filterError, setFilterError] = useState("");
  const filterDialog = useRef<HTMLDialogElement>(null);
  const sound = useDiscoverSound();
  const [note, setNote] = useState<{
    text: string;
    kind: DiscoverFeedbackKind;
    id: number;
  } | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastNote = useRef("");
  useEffect(
    () => () => {
      if (noteTimer.current) clearTimeout(noteTimer.current);
    },
    [],
  );
  useEffect(() => {
    const dialog = filterDialog.current;
    if (!dialog) return;
    if (showFilters && !dialog.open) dialog.showModal();
    else if (!showFilters && dialog.open) dialog.close();
  }, [showFilters]);
  function remember(next: Filters, school: SchoolOption | null) {
    try {
      localStorage.setItem(
        preferenceKey,
        JSON.stringify({ filters: next, school }),
      );
    } catch {
      /* Keep working without storage. */
    }
  }
  function closeFilters() {
    setDraft(filters);
    setFilterSchool(appliedSchool);
    setFilterError("");
    remember(filters, appliedSchool);
    setReady(true);
    setShowFilters(false);
  }
  function applyFilters() {
    if (
      draft.minAge &&
      draft.maxAge &&
      Number(draft.minAge) > Number(draft.maxAge)
    ) {
      setFilterError("Minimum age must be no greater than maximum age.");
      return;
    }
    setFilters(draft);
    setAppliedSchool(filterSchool);
    remember(draft, filterSchool);
    setFilterError("");
    setReady(true);
    setShowFilters(false);
  }
  function showNote(kind: DiscoverFeedbackKind) {
    const text = pickDiscoverNote(kind, lastNote.current);
    lastNote.current = text;
    if (noteTimer.current) clearTimeout(noteTimer.current);
    setNote({ text, kind, id: Date.now() });
    noteTimer.current = setTimeout(() => setNote(null), 3300);
  }
  const [version, setVersion] = useState(0); // bump to refresh
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const activeFeedKey = useRef("");
  const decisionInFlight = useRef(false);
  const exitComplete = useRef<(() => void) | null>(null);
  useEffect(() => () => exitComplete.current?.(), []);

  // Changing a filter (or refreshing) starts a fresh feed from the first page
  const feedKey = toQueryString(filters) + "#" + version;
  const path = "/discover" + toQueryString(filters);
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    activeFeedKey.current = feedKey;
    const request = preview
      ? Promise.resolve({
          school: { id: 1, name: "Sample university" },
          profiles: (previewProfiles ?? []).filter(
            (p) =>
              (!filters.major ||
                p.major.toLowerCase().includes(filters.major.toLowerCase())) &&
              (!filters.maxBudget || p.budget.min <= Number(filters.maxBudget)),
          ),
          nextCursor: null,
        })
      : apiRequest<DiscoverResponse>(path);
    request.then(
      (data) => {
        if (!preview) writeApiCache(path, data);
        if (!cancelled)
          setFeed({
            key: feedKey,
            school: data.school,
            profiles: data.profiles,
            nextCursor: data.nextCursor,
            error: null,
          });
      },
      (caught) => {
        if (!cancelled)
          setFeed({
            key: feedKey,
            profiles: [],
            nextCursor: null,
            error: asApiError(caught),
          });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [feedKey, path, ready, preview, previewProfiles, filters]);

  // Show the remembered deck instantly while the fresh one loads
  const remembered = preview ? undefined : readApiCache<DiscoverResponse>(path);
  const current: Feed | null =
    feed?.key === feedKey
      ? feed
      : remembered
        ? {
            key: feedKey,
            school: remembered.school,
            profiles: remembered.profiles,
            nextCursor: remembered.nextCursor,
            error: null,
          }
        : null;
  const loading = current === null;
  const error = current?.error ?? null;
  const reload = () => setVersion((v) => v + 1);

  // "Load more": fetch the next page using the bookmark and add it to the end
  async function loadMore() {
    if (!current || !current.nextCursor || loadingMoreRef.current) {
      return;
    }
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const data = await apiRequest<DiscoverResponse>(
        "/discover" + toQueryString(filters, current.nextCursor),
      );
      if (activeFeedKey.current !== feedKey) return;
      setFeed((latest) => {
        const base = latest?.key === feedKey ? latest : current;
        return {
          ...base,
          profiles: [...base.profiles, ...data.profiles],
          nextCursor: data.nextCursor,
        };
      });
    } catch (caught) {
      setSwipeError(caught);
      if (noteTimer.current) clearTimeout(noteTimer.current);
      setNote(null);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }

  const [swipedIds, setSwipedIds] = useState<string[]>([]);
  const [animation, setAnimation] = useState<SwipeAction | null>(null);
  const [lastDecision, setLastDecision] = useState<string | null>(null);
  const [newMatch, setNewMatch] = useState<Profile | null>(null);
  const [swipeError, setSwipeError] = useState<unknown>(null);

  // The deck is whatever the API sent, minus anyone swiped on since it loaded
  const deck = (current?.profiles ?? []).filter(
    (profile) => !swipedIds.includes(profile.id),
  );
  const hasMore = current !== null && current.nextCursor !== null;
  const currentProfile = deck[0];
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;

  function updateFilter(key: keyof Filters, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }
  function pickSchool(school: SchoolOption | null) {
    setFilterSchool(school);
    updateFilter("schoolId", school === null ? "" : String(school.id));
  }
  function clearFilters() {
    setFilterSchool(null);
    setAppliedSchool(null);
    setDraft(NO_FILTERS);
    setFilters(NO_FILTERS);
    remember(NO_FILTERS, null);
  }

  async function handleDecision(action: SwipeAction) {
    if (!currentProfile || decisionInFlight.current) {
      return;
    }
    decisionInFlight.current = true;
    setSwipeError(null);
    sound.prime();
    const exit = new Promise<void>(resolve => { exitComplete.current = resolve; });
    setAnimation(action);
    showNote(action);
    if (action === "pass") void sound.play("pass");
    try {
      const [result] = await Promise.all([
        preview
          ? Promise.resolve({
              matched: action === "like" && currentProfile.id === "preview-2",
              match: currentProfile,
            })
          : apiRequest<{ matched: boolean; match?: Profile }>("/swipes", {
              method: "POST",
              body: { targetId: currentProfile.id, direction: action },
            }),
        exit,
      ]);
      const swipedId = currentProfile.id;
      if (!preview) invalidateApiCache("/swipes"); // history changed
      // Keep the remembered deck in sync, so they don't reappear next time you open Discover
      if (!preview)
        updateApiCache<DiscoverResponse>(path, (deckData) => ({
          ...deckData,
          profiles: deckData.profiles.filter((p) => p.id !== swipedId),
        }));
      if (result.matched) {
        // The match version of their profile includes their Instagram
        const matched = result.match ?? currentProfile;
        setNewMatch(matched);
        void sound.play("match");
        showNote("match");
        // Put them at the top of the remembered Matches list right away
        if (!preview)
          updateApiCache<{ matches: MatchedProfile[] }>("/matches", (list) => ({
            matches: [
              { ...matched, matchedAt: new Date().toISOString() },
              ...list.matches,
            ],
          }));
      }

      setLastDecision(
        action === "like"
          ? `You liked ${currentProfile.name}.`
          : `You passed on ${currentProfile.name}.`,
      );
      setSwipedIds((ids) => [...ids, currentProfile.id]);
      if (deck.length - 1 <= LOAD_MORE_WHEN_LEFT) {
        loadMore();
      }
    } catch (caught) {
      setSwipeError(caught);
      if (noteTimer.current) clearTimeout(noteTimer.current);
      setNote(null);
    } finally {
      decisionInFlight.current = false;
      setAnimation(null);
    }
  }

  let content;
  if (loading) {
    content = (
      <p className="status-message">Finding students at your school...</p>
    );
  } else if (error?.status === 404 || error?.status === 409) {
    content = (
      <section className="empty-state">
        <h2>
          {error.status === 404
            ? "Create your profile first"
            : "Finish your profile first"}
        </h2>
        <p>
          Discover shows students at your school, so we need to know where you
          go.
        </p>
        <Link className="primary-button" to="/profile">
          Set up profile
        </Link>
      </section>
    );
  } else if (error) {
    content = (
      <section className="empty-state">
        <FormErrors error={error} />
        <button className="secondary-button" type="button" onClick={reload}>
          Try again
        </button>
      </section>
    );
  } else if (currentProfile) {
    content = (
      <>
        <div className="discover-card-entry" key={currentProfile.id}>
          <SwipeSurface
            disabled={animation !== null}
            onSwipe={handleDecision}
            name={currentProfile.name}
            decision={animation}
            onExitComplete={() => { exitComplete.current?.(); exitComplete.current = null; }}
          >
            <ProfileCard profile={currentProfile} />
          </SwipeSurface>
        </div>
        <FormErrors error={swipeError} />
        <div className="swipe-controls">
          <button
            className="swipe-button swipe-button--pass"
            type="button"
            aria-label={`Pass on ${currentProfile.name}`}
            disabled={animation !== null}
            onClick={() => handleDecision("pass")}
          >
            <X size={22} strokeWidth={1.8} />
            <span>Pass</span>
          </button>
          <button
            className="swipe-button swipe-button--like"
            type="button"
            aria-label={`Like ${currentProfile.name}`}
            disabled={animation !== null}
            onClick={() => handleDecision("like")}
          >
            <Heart size={22} strokeWidth={1.8} />
            <span>Like</span>
          </button>
        </div>
      </>
    );
  } else if (hasMore) {
    content = (
      <section className="empty-state">
        <p>
          {loadingMore
            ? "Finding more students..."
            : "Looking for more students..."}
        </p>
        <button
          className="secondary-button"
          type="button"
          disabled={loadingMore}
          onClick={loadMore}
        >
          Load more
        </button>
      </section>
    );
  } else {
    content = (
      <section className="empty-state">
        <div className="empty-state__icon">
          <Heart size={28} />
        </div>
        <h2>
          {activeFilterCount > 0
            ? "No one matches these filters."
            : "You're all caught up."}
        </h2>
        <p>
          {activeFilterCount > 0
            ? "Try loosening a filter or two."
            : "New people will appear here. Check back soon."}
        </p>
        <div className="empty-actions">
          {activeFilterCount > 0 ? (
            <button
              className="secondary-button"
              type="button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          ) : (
            <button className="secondary-button" type="button" onClick={reload}>
              <RotateCcw size={17} />
              Check again
            </button>
          )}
          <Link className="button button--dark" to="/history">
            Revisit your swipes
          </Link>
          <InviteButton />
        </div>
        <Link className="text-link" to="/matches">
          Make the first hello with your matches →
        </Link>
      </section>
    );
  }

  return (
    <main className="page page--with-navigation discover-page">
      <header className="discover-toolbar">
        <h1>Discover</h1>
        <div className="discover-tools">
          <button
            className="icon-button"
            type="button"
            onClick={sound.toggle}
            aria-label={
              sound.enabled ? "Mute swipe sounds" : "Enable swipe sounds"
            }
            aria-pressed={!sound.enabled}
            title={sound.enabled ? "Sound on" : "Sound off"}
          >
            {sound.enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <Link className="icon-button" to="/search" aria-label="Search people">
            <Search size={18} />
          </Link>
          <Link
            className="icon-button"
            to="/history"
            aria-label="Swipe history"
          >
            <History size={18} />
          </Link>
          <button
            className="discover-filter-button"
            type="button"
            aria-haspopup="dialog"
            aria-controls="discover-filters"
            aria-expanded={showFilters}
            disabled={animation !== null}
            onClick={() => setShowFilters(true)}
          >
            <SlidersHorizontal size={17} /> Filters{" "}
            {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
          </button>
        </div>
      </header>

      <dialog
        ref={filterDialog}
        id="discover-filters"
        className="discover-filters-dialog"
        aria-labelledby="discover-filter-title"
        onCancel={(event) => {
          event.preventDefault();
          closeFilters();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget && isOutsideDialog(event, event.currentTarget.getBoundingClientRect())) closeFilters();
        }}
      >
        <div className="discover-filter-heading">
          <div>
            <p className="eyebrow">
              {ready ? "YOUR PREFERENCES" : "BEFORE YOU MEET YOUR ROOMIE"}
            </p>
            <h2 id="discover-filter-title">Your kind of everyday.</h2>
            <p>A few preferences, then it’s all about the people.</p>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close filters"
            onClick={closeFilters}
          >
            <X size={19} />
          </button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            applyFilters();
          }}
        >
          <section className="filter-panel" aria-label="Filters">
            <div className="field filter-panel__wide">
              <span>School</span>
              {filterSchool === null ? (
                <div className="filter-panel__school">
                  <span>Your school</span>
                  <SchoolPicker value={null} onChange={pickSchool} />
                </div>
              ) : (
                <SchoolPicker value={filterSchool} onChange={pickSchool} />
              )}
            </div>
            <label className="field">
              <span>Major</span>
              <input
                placeholder="Any"
                value={draft.major}
                onChange={(e) => updateFilter("major", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Class of</span>
              <select
                value={draft.classYear}
                onChange={(e) => updateFilter("classYear", e.target.value)}
              >
                <option value="">Any</option>
                {CLASS_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Min age</span>
              <input
                type="number"
                min={17}
                max={100}
                placeholder="Any"
                value={draft.minAge}
                onChange={(e) => updateFilter("minAge", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Max age</span>
              <input
                type="number"
                min={17}
                max={100}
                placeholder="Any"
                value={draft.maxAge}
                onChange={(e) => updateFilter("maxAge", e.target.value)}
              />
            </label>
            <label className="field filter-panel__wide">
              <span>Moving in by</span>
              <input
                type="date"
                value={draft.moveInBy}
                onChange={(e) => updateFilter("moveInBy", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Sleep schedule</span>
              <select
                value={draft.sleepSchedule}
                onChange={(e) => updateFilter("sleepSchedule", e.target.value)}
              >
                <option value="">Any</option>
                {Object.entries(SLEEP_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Cleanliness</span>
              <select
                value={draft.cleanliness}
                onChange={(e) => updateFilter("cleanliness", e.target.value)}
              >
                <option value="">Any</option>
                {Object.entries(CLEANLINESS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Smoking</span>
              <select
                value={draft.smoking}
                onChange={(e) => updateFilter("smoking", e.target.value)}
              >
                <option value="">Any</option>
                <option value="false">Non-smokers</option>
                <option value="true">Smokers</option>
              </select>
            </label>
            <label className="field">
              <span>Pets</span>
              <select
                value={draft.pets}
                onChange={(e) => updateFilter("pets", e.target.value)}
              >
                <option value="">Any</option>
                <option value="false">No pets</option>
                <option value="true">Has pets</option>
              </select>
            </label>
            <label className="field">
              <span>Max budget ($/mo)</span>
              <input
                type="number"
                min={0}
                placeholder="Any"
                value={draft.maxBudget}
                onChange={(e) => updateFilter("maxBudget", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Tag</span>
              <select
                value={draft.tag}
                onChange={(e) => updateFilter("tag", e.target.value)}
              >
                <option value="">Any</option>
                {TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>
          </section>
          {filterError && (
            <p className="filter-error" role="alert">
              {filterError}
            </p>
          )}
          <div className="discover-filter-actions">
            <button
              className="text-link"
              type="button"
              onClick={() => {
                setDraft(NO_FILTERS);
                setFilterSchool(null);
              }}
            >
              Reset
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={closeFilters}
            >
              {ready ? "Cancel" : "Skip for now"}
            </button>
            <button className="primary-button" type="submit">
              Show people
            </button>
          </div>
        </form>
      </dialog>

      <div className="discover-grid discover-grid--no-filters">
        <div className="discover-main">
          {newMatch && (
            <section className="match-banner" role="status">
              {newMatch.photoUrl ? (
                <img
                  className="match-banner__photo"
                  src={newMatch.photoUrl}
                  alt=""
                />
              ) : (
                <PartyPopper size={26} />
              )}
              <div>
                <strong>It's a match with {newMatch.name}!</strong>
                {newMatch.instagram && (
                  <p>
                    Say hi: <InstagramLink handle={newMatch.instagram} />
                  </p>
                )}
                <p>
                  <Link to={`/matches/${encodeURIComponent(newMatch.id)}`}>
                    View {newMatch.name}'s profile
                  </Link>
                </p>
              </div>
              <button
                className="match-banner__close"
                type="button"
                aria-label="Dismiss"
                onClick={() => setNewMatch(null)}
              >
                <X size={18} />
              </button>
            </section>
          )}

          <p className="sr-only" role="status">
            {lastDecision}
          </p>
          <div className="discover-note-slot" aria-live="polite">
            {note && (
              <p
                key={note.id}
                className={`discover-note discover-note--${note.kind}`}
              >
                {note.text}
              </p>
            )}
          </div>
          {ready ? (
            content
          ) : (
            <div className="discover-placeholder" aria-hidden="true" />
          )}
        </div>
      </div>
    </main>
  );
}

export default DiscoverPage;
