import { useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { nextPhotoIndex, photoSwipeStep } from "../lib/profilePhotos";
import "../profile-photos.css";

type Props = { name: string; photos: string[]; children: ReactNode };
export default function ProfilePhotoCarousel({ name, photos, children }: Props) {
  const [index, setIndex] = useState(0);
  const active = Math.min(index, Math.max(0, photos.length - 1));
  const gesture = useRef<{ id: number; x: number; y: number } | null>(null);
  const instructions = useId();
  const multiple = photos.length > 1;
  const move = (step: number) => setIndex(current => nextPhotoIndex(current, step, photos.length));
  function start(event: PointerEvent<HTMLDivElement>) {
    // Image gestures never bubble to the outer like/pass surface, even for one photo.
    event.stopPropagation();
    if (!multiple || !event.isPrimary || event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function finish(event: PointerEvent<HTMLDivElement>) {
    event.stopPropagation();
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    gesture.current = null;
    const step = photoSwipeStep(event.clientX - start.x, event.clientY - start.y);
    if (step) move(step);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  return <div className={`profile-card__photo-area profile-photos ${!photos.length ? "profile-card__photo-area--avatar" : ""} ${multiple ? "profile-photos--multiple" : ""}`}
    role="group" aria-roledescription={multiple ? "carousel" : undefined} aria-label={`${name}'s photos`}
    tabIndex={multiple ? 0 : undefined} aria-describedby={multiple ? instructions : undefined}
    onPointerDown={start} onPointerUp={finish}
    onPointerCancel={() => { gesture.current = null; }} onLostPointerCapture={() => { gesture.current = null; }}
    onKeyDown={event => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.stopPropagation();
      if (multiple) { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); }
    }}>
    {photos.length ? <img className="profile-card__photo" src={photos[active]} alt={`${name}'s photo ${active + 1} of ${photos.length}`} draggable={false} /> : <>
      <span className="profile-card__initial" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
      <span className="avatar-caption">photo not added yet</span>
    </>}
    {children}
    {multiple && <>
      <span id={instructions} className="sr-only">swipe right for the next photo, left for the previous photo, or use the arrow keys.</span>
      <button className="profile-photos__arrow profile-photos__arrow--previous" type="button" aria-label="previous photo" disabled={active === 0} onClick={() => move(-1)}><ChevronLeft size={20} /></button>
      <button className="profile-photos__arrow profile-photos__arrow--next" type="button" aria-label="next photo" disabled={active === photos.length - 1} onClick={() => move(1)}><ChevronRight size={20} /></button>
      <div className="profile-photos__dots" aria-label="choose a photo">{photos.map((_, i) => <button key={i} className="profile-photos__dot" type="button" aria-label={`photo ${i + 1} of ${photos.length}`} aria-current={i === active ? "true" : undefined} onClick={() => setIndex(i)}><span /></button>)}</div>
      <span className="sr-only" aria-live="polite" aria-atomic="true">photo {active + 1} of {photos.length}</span>
    </>}
  </div>;
}
