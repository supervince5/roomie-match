import { Camera } from "lucide-react";
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { uploadPhoto } from "../lib/photos";
import { editablePhotos, MAX_PROFILE_PHOTOS } from "../lib/profilePhotos";
import "../profile-photos.css";
import FormErrors from "./FormErrors";
import SchoolPicker, { type SchoolOption } from "./SchoolPicker";
import {
  CLEANLINESS_LABELS,
  PROMPT_QUESTIONS,
  SLEEP_LABELS,
  TAGS,
  type Cleanliness,
  type Profile,
  type ProfileInput,
  type PromptQuestion,
  type SleepSchedule,
  type Tag,
} from "../types/profile";

type ProfileFormProps = {
  initial?: Partial<Profile>;
  localPreview?: boolean;
  submitLabel: string;
  onSubmit: (profile: ProfileInput) => Promise<void>;
  onCancel?: () => void;
};

const MAX_TAGS = 5;

// Inputs hold text while you type; we turn them into numbers/booleans when you submit.
// The backend validates everything again, and its error list is shown at the top.
function ProfileForm({ initial = {}, localPreview = false, submitLabel, onSubmit, onCancel }: ProfileFormProps) {
  const previewPhotos = useRef<string[]>([]);
  useEffect(() => () => { previewPhotos.current.forEach(url => URL.revokeObjectURL(url)); }, []);
  const form = useRef<HTMLFormElement>(null);
  const saving = useRef(false);
  const budgetHelp = useId();
  const [name, setName] = useState(initial.name ?? "");
  const [age, setAge] = useState(initial.age?.toString() ?? "");
  const [school, setSchool] = useState<SchoolOption | null>(
    initial.schoolId && initial.school ? { id: initial.schoolId, name: initial.school } : null,
  );
  const [major, setMajor] = useState(initial.major ?? "");
  const [classYear, setClassYear] = useState(initial.classYear?.toString() ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [instagram, setInstagram] = useState(initial.instagram ?? "");
  const [photos, setPhotos] = useState(() => editablePhotos(initial));
  const uploadInProgress = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState<Tag[]>(initial.tags ?? []);
  const [promptQuestion, setPromptQuestion] = useState<PromptQuestion | "">(initial.prompt?.question ?? "");
  const [promptAnswer, setPromptAnswer] = useState(initial.prompt?.answer ?? "");
  const [budgetMin, setBudgetMin] = useState(initial.budget?.min.toString() ?? "");
  const [budgetMax, setBudgetMax] = useState(initial.budget?.max.toString() ?? "");
  const [moveInDate, setMoveInDate] = useState(initial.moveInDate ?? "");
  const [sleepSchedule, setSleepSchedule] = useState<SleepSchedule | "">(initial.sleepSchedule ?? "");
  const [cleanliness, setCleanliness] = useState<Cleanliness | "">(initial.cleanliness ?? "");
  const [smoking, setSmoking] = useState<boolean | undefined>(initial.smoking);
  const [pets, setPets] = useState<boolean | undefined>(initial.pets);

  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  const budgetInvalid = budgetMin !== "" && budgetMax !== "" && Number(budgetMin) > Number(budgetMax);
  useEffect(() => {
    if (error) form.current?.querySelector<HTMLElement>(".form-error")?.focus();
  }, [error]);

  // Upload in selection order. Successful photos stay in the draft if a later upload fails.
  async function handlePhotoPicked(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    input.value = "";
    if (!files.length || uploadInProgress.current) return;
    if (files.length + photos.length > MAX_PROFILE_PHOTOS) {
      setError(new Error(`choose up to ${MAX_PROFILE_PHOTOS} photos in total.`));
      return;
    }
    if (files.some(file => !file.type.startsWith("image/"))) {
      setError(new Error("please choose image files."));
      return;
    }
    uploadInProgress.current = true;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const uploaded = import.meta.env.DEV && localPreview
          ? { photoKey: undefined, previewUrl: URL.createObjectURL(file) }
          : await uploadPhoto(file);
        previewPhotos.current.push(uploaded.previewUrl);
        setPhotos(current => [...current, { key: uploaded.photoKey, url: uploaded.previewUrl }]);
      }
    } catch (caught) {
      setError(caught);
    } finally {
      uploadInProgress.current = false;
      setUploading(false);
    }
  }

  function toggleTag(tag: Tag) {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else if (tags.length < MAX_TAGS) {
      setTags([...tags, tag]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving.current || uploading) return;
    if (budgetInvalid) {
      setError(new Error("Maximum budget must be at least your minimum budget."));
      return;
    }
    if (school === null) {
      setError(new Error("Pick your school from the list."));
      return;
    }
    const profile: ProfileInput = {
      name: name,
      age: age === "" ? undefined : Number(age),
      schoolId: school.id,
      major: major,
      classYear: classYear === "" ? undefined : Number(classYear),
      bio: bio.trim() === "" ? undefined : bio,
      instagram: instagram.trim() === "" ? undefined : instagram.trim(),
      photoKeys: photos.flatMap(photo => photo.key ? [photo.key] : []),
      tags: tags,
      prompt: promptQuestion === "" || promptAnswer.trim() === ""
        ? undefined
        : { question: promptQuestion, answer: promptAnswer },
      budget: budgetMin === "" && budgetMax === "" ? undefined : { min: Number(budgetMin), max: Number(budgetMax) },
      moveInDate: moveInDate || undefined,
      sleepSchedule: sleepSchedule || undefined,
      cleanliness: cleanliness || undefined,
      smoking: smoking,
      pets: pets,
    };

    saving.current = true;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(profile);
    } catch (caught) {
      setError(caught);

    } finally {
      saving.current = false;
      setSubmitting(false);
    }
  }

  return (
    <form ref={form} className="profile-form" onSubmit={handleSubmit}>
      <FormErrors error={error} />

      <fieldset disabled={submitting || uploading}>
        <legend>photos <small>({photos.length}/{MAX_PROFILE_PHOTOS})</small></legend>
        {photos.length > 0 && <div className="photo-album">
          {photos.map((photo, index) => <figure className="photo-album__item" key={photo.key ?? photo.url ?? index}>
            <div className="photo-album__preview">{photo.url ? <img src={photo.url} alt={`your photo ${index + 1}`} /> : <Camera size={26} />}</div>
            <figcaption>
              {index === 0 ? <span className="photo-album__cover">cover photo</span> : <button type="button" aria-label={`make photo ${index + 1} the cover`} onClick={() => setPhotos(current => [current[index], ...current.filter((_, i) => i !== index)])}>make cover</button>}
              <button type="button" aria-label={`remove photo ${index + 1}`} onClick={() => setPhotos(current => current.filter((_, i) => i !== index))}>remove</button>
            </figcaption>
          </figure>)}
        </div>}
        {photos.length < MAX_PROFILE_PHOTOS && <div className="photo-picker">
          {!photos.length && <div className="photo-picker__preview"><Camera size={30} /></div>}
          <label className="secondary-button photo-picker__button">
            {uploading ? "uploading…" : "add photos"}
            <input type="file" accept="image/*" multiple className="sr-only" disabled={uploading || submitting} onChange={handlePhotoPicked} />
          </label>
        </div>}
        <p className="photo-album__help" role="status">{uploading ? "uploading your photos…" : "up to 6 photos. the first one is your cover."}</p>
      </fieldset>

      <fieldset disabled={submitting}>
        <legend>About you</legend>
        <label className="field">
          <span>First name</span>
          <input required maxLength={50} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="field-row">
          <label className="field">
            <span>Age</span>
            <input type="number" min={17} max={100} value={age} onChange={(e) => setAge(e.target.value)} />
          </label>
          <label className="field">
            <span>Class of</span>
            <input type="number" min={2020} max={2040} placeholder="2030" value={classYear} onChange={(e) => setClassYear(e.target.value)} />
          </label>
        </div>
        <div className="field">
          <span>School</span>
          <SchoolPicker value={school} onChange={setSchool} />
          <small>You'll see students at the same school.</small>
        </div>
        <label className="field">
          <span>Major</span>
          <input required maxLength={100} value={major} onChange={(e) => setMajor(e.target.value)} />
        </label>
        <label className="field">
          <span>Instagram (optional)</span>
          <input placeholder="@yourhandle" maxLength={31} value={instagram} onChange={(e) => setInstagram(e.target.value)} />
          <small>Only people you match with can see this.</small>
        </label>
        <label className="field">
          <span>Bio (optional)</span>
          <textarea rows={3} maxLength={500} value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
      </fieldset>

      <fieldset disabled={submitting}>
        <legend>Living preferences</legend>
        <div className="field-row">
          <label className="field">
            <span>Budget min ($/mo)</span>
            <input type="number" required={budgetMax !== ""} min={0} value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
          </label>
          <label className="field">
            <span>Budget max ($/mo)</span>
            <input type="number" required={budgetMin !== ""} min={Number(budgetMin) || 0} aria-invalid={budgetInvalid || undefined} aria-describedby={budgetInvalid ? budgetHelp : undefined} value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
            {budgetInvalid && <small id={budgetHelp} className="field-error" role="status">Maximum must be at least your minimum budget.</small>}
          </label>
        </div>
        <label className="field">
          <span>Move-in date</span>
          <input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} />
        </label>
        <div className="field-row">
          <label className="field">
            <span>Sleep schedule</span>
            <select value={sleepSchedule} onChange={(e) => setSleepSchedule(e.target.value as SleepSchedule)}>
              <option value="">not shared yet</option>
              {Object.entries(SLEEP_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Cleanliness</span>
            <select value={cleanliness} onChange={(e) => setCleanliness(e.target.value as Cleanliness)}>
              <option value="">not shared yet</option>
              {Object.entries(CLEANLINESS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="field-row">
          <label className="field"><span>smoking</span>
            <select value={smoking === undefined ? "" : String(smoking)} onChange={e => setSmoking(e.target.value === "" ? undefined : e.target.value === "true")}>
              <option value="">not shared yet</option><option value="false">i don't smoke</option><option value="true">i smoke</option>
            </select>
          </label>
          <label className="field"><span>pets</span>
            <select value={pets === undefined ? "" : String(pets)} onChange={e => setPets(e.target.value === "" ? undefined : e.target.value === "true")}>
              <option value="">not shared yet</option><option value="false">no pets</option><option value="true">i have pets</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset disabled={submitting}>
        <legend>
          Tags <small>({tags.length}/{MAX_TAGS})</small>
        </legend>
        <div className="tag-list">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`tag tag--choice ${tags.includes(tag) ? "tag--selected" : ""}`}
              aria-pressed={tags.includes(tag)}
              disabled={!tags.includes(tag) && tags.length >= MAX_TAGS}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={submitting}>
        <legend>Prompt (optional)</legend>
        <label className="field">
          <span>Question</span>
          <select value={promptQuestion} onChange={(e) => setPromptQuestion(e.target.value as PromptQuestion | "")}>
            <option value="">No prompt</option>
            {PROMPT_QUESTIONS.map((question) => (
              <option key={question} value={question}>{question}</option>
            ))}
          </select>
        </label>
        {promptQuestion !== "" && (
          <label className="field">
            <span>Your answer</span>
            <input maxLength={200} value={promptAnswer} onChange={(e) => setPromptAnswer(e.target.value)} />
          </label>
        )}
      </fieldset>

      <button className="primary-button" type="submit" disabled={submitting || uploading}>
        {submitting ? "Saving..." : submitLabel}
      </button>
      {onCancel && (
        <button className="secondary-button profile-form__cancel" type="button" disabled={submitting || uploading} onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}

export default ProfileForm;
