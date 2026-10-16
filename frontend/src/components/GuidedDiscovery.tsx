import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import SchoolPicker from "./SchoolPicker";
import { previewSchools } from "../lib/previewSchools";
import type { Profile } from "../types/profile";
import { guidedSteps, validateGuidedStep, type GuidedValues } from "../lib/guidedDiscovery";
import "../guided-discovery.css";

type Props = {
  initial: Profile | null;
  localPreview?: boolean;
  initialCleanliness?: GuidedValues["cleanliness"];
  preferences?: boolean;
  onComplete: (values: GuidedValues) => Promise<void>;
  onDismiss: () => void;
  onAdvanced?: () => void;
};
const greetings = [
  { word: "hello.", lang: "en" }, { word: "hola.", lang: "es" },
  { word: "bonjour.", lang: "fr" }, { word: "ciao.", lang: "it" },
  { word: "你好。", lang: "zh" }, { word: "hello.", lang: "en" },
];
function Welcome() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reduced || index === greetings.length - 1) return;
    const timer = window.setTimeout(() => setIndex(value => value + 1), 1900);
    return () => window.clearTimeout(timer);
  }, [index, reduced]);
  const greeting = greetings[reduced ? 0 : index];
  return <>
    <div className="guided-hello" aria-hidden="true">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={greeting.lang + index} lang={greeting.lang}
          initial={{ opacity: 0, y: reduced ? 0 : 9 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : -9 }} transition={{ duration: .5, ease: [.22, 1, .36, 1] }}>
          {greeting.word}
        </motion.span>
      </AnimatePresence>
    </div>
    <h2 id="guided-title-hello" tabIndex={-1}>make yourself at home.</h2>
    <p className="guided-intro">a little about you.<br />a little closer to your kind of roomie.</p>
  </>;
}
const StepFrame = forwardRef<HTMLElement, { children: ReactNode; direction: number; reduced: boolean; focusKey: string }>(function StepFrame({children,direction,reduced,focusKey}, ref) {
  const present = useIsPresent();
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const node = content.current;
      const target = node?.querySelector<HTMLElement>('input:not([type=radio]), [data-step-focus]') ?? node?.querySelector<HTMLElement>('h2');
      target?.focus({preventScroll:true});
    });
    return () => cancelAnimationFrame(frame);
  }, [focusKey]);
  return <motion.section ref={ref} className="guided-step" inert={!present} aria-hidden={!present || undefined}
    initial={{opacity:0,x:reduced ? 0 : direction * 20}} animate={{opacity:1,x:0}}
    exit={{opacity:0,x:reduced ? 0 : direction * -12}}
    transition={{opacity:{duration:.18},x:{type:"spring",stiffness:320,damping:36}}}>
    <div ref={content}>{children}</div>
  </motion.section>;
});
export default function GuidedDiscovery({ initial, localPreview = false, initialCleanliness = "", preferences = true, onComplete, onDismiss, onAdvanced }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reduced = !!useReducedMotion();
  const [steps] = useState(() => guidedSteps(initial, preferences));
  const [values, setValues] = useState<GuidedValues>(() => ({
    name: initial?.name ?? "", school: initial?.schoolId ? {id:initial.schoolId,name:initial.school} : null,
    major: initial?.major ?? "", cleanliness: initialCleanliness,
  }));
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [closing, setClosing] = useState(false);
  const step = steps[index];
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => node?.close(); }, []);
  function close() { if (!savingRef.current) setClosing(true); }
  function go(next: number) { setDirection(next < index ? -1 : 1); setError(""); setIndex(next); }
  async function advance() {
    if (savingRef.current) return;
    const problem = validateGuidedStep(step, values);
    if (problem) { setError(problem); return; }
    if (step !== "ready") { go(index + 1); return; }
    savingRef.current = true; setSaving(true); setError("");
    try { await onComplete(values); setClosing(true); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "couldn't save just yet. please try again."); }
    finally { savingRef.current = false; setSaving(false); }
  }
  return <dialog id="guided-setup" ref={dialog} className="guided-dialog" aria-labelledby={`guided-title-${step}`}
    onCancel={event => { event.preventDefault(); close(); }}>
    <AnimatePresence onExitComplete={() => { if (closing) onDismiss(); }}>
      {!closing && <motion.div className="guided-shell" key="shell"
        initial={{opacity:0,y:reduced ? 0 : 14,scale:reduced ? 1 : .985}} animate={{opacity:1,y:0,scale:1}}
        exit={{opacity:0,y:reduced ? 0 : 10,scale:reduced ? 1 : .99}} transition={{duration:.24,ease:[.22,1,.36,1]}}>
        <header className="guided-topbar"><span>matcharoomie.</span>
          <button type="button" className="icon-button" aria-label="Close setup" disabled={saving} onClick={close}><X size={19}/></button>
        </header>
        <form noValidate onSubmit={event => {event.preventDefault(); void advance();}}>
          <div className="guided-stage">
            <AnimatePresence mode="popLayout" initial={false}>
              <StepFrame key={step} focusKey={step} direction={direction} reduced={reduced}>
                {step === "hello" ? <Welcome/> : <>
                  <p className="guided-eyebrow">{step === "cleanliness" ? "your kind of everyday" : step === "ready" ? "a thoughtful start" : "a little about you"}</p>
                  <h2 id={`guided-title-${step}`} tabIndex={-1}>{step === "name" ? "what should we call you?" : step === "school" ? "where’s your campus?" : step === "major" ? "what are you studying?" : step === "cleanliness" ? "how tidy feels like home?" : "you’re in the right place."}</h2>
                  <p className="guided-intro">{step === "name" ? "just your first name is lovely." : step === "school" ? "we’ll start with people at your college." : step === "major" ? "undecided is a perfectly good answer." : step === "cleanliness" ? "a roommate preference. leave it open if you’re flexible." : "start with the basics. make it more you whenever you like."}</p>
                  {step === "name" && <label className="guided-field"><span className="sr-only">your first name</span><input autoComplete="given-name" maxLength={50} value={values.name} placeholder="your name" aria-invalid={!!error} onChange={e=>setValues({...values,name:e.target.value})}/></label>}
                  {step === "school" && <div className="guided-school"><SchoolPicker sampleSchools={localPreview ? previewSchools : undefined} value={values.school} onChange={school=>setValues({...values,school})}/></div>}
                  {step === "major" && <label className="guided-field"><span className="sr-only">your major</span><input maxLength={100} value={values.major} placeholder="your major" aria-invalid={!!error} onChange={e=>setValues({...values,major:e.target.value})}/></label>}
                  {step === "cleanliness" && <fieldset className="guided-choices"><legend className="sr-only">roommate cleanliness preference</legend>
                    {([['very_clean','a place for everything','tidy counters, regular resets.'],['clean','comfortable and cared for','mostly tidy, a little lived in.'],['relaxed','easygoing about mess','life happens. we’ll sort it out.']] as const).map(([value,title,detail])=><label key={value} className={`guided-choice ${values.cleanliness===value?'is-selected':''}`}><input type="radio" name="cleanliness" value={value} checked={values.cleanliness===value} onChange={()=>setValues({...values,cleanliness:value})}/><span><strong>{title}</strong><small>{detail}</small></span><Check size={17} aria-hidden="true"/></label>)}
                  </fieldset>}
                  {step === "ready" && <div className="guided-recap"><span className="guided-initial" aria-hidden="true">{values.name.charAt(0)}</span><div><strong>{values.name}</strong><span>{values.school?.name}</span><small>{values.major}</small></div></div>}
                </>}
              </StepFrame>
            </AnimatePresence>
          </div>
          <p className="guided-error" role="alert">{error}</p>
          <footer className="guided-actions">
            {index > 0 ? <button type="button" className="guided-back" disabled={saving} onClick={()=>go(index-1)}><ArrowLeft size={17}/>back</button> : <span/>}
            <button type="submit" className="primary-button guided-next" disabled={saving}>{saving ? "saving…" : step === "hello" ? "let’s begin" : step === "ready" ? "find my roomies" : "continue"}<ArrowRight size={17}/></button>
          </footer>
          <div className="guided-secondary">
            {step === "cleanliness" ? <button type="button" disabled={saving} onClick={()=>{setValues({...values,cleanliness:""});go(index+1);}}>keep this open for now</button> : step === "hello" && onAdvanced ? <button type="button" onClick={onAdvanced}>i’ll choose my own filters</button> : <span>you can change these later.</span>}
          </div>
        </form>
      </motion.div>}
    </AnimatePresence>
  </dialog>;
}
