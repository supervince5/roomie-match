import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, SlidersHorizontal, X } from "lucide-react";
import { isOutsideDialog } from "../lib/dialog";
import type { Cleanliness, SleepSchedule } from "../types/profile";
import "../guided-filters.css";

export type QuickPreferences = { cleanliness: Cleanliness | ""; sleepSchedule: SleepSchedule | "" };
type Props = {
  initial: QuickPreferences;
  onApply: (values: QuickPreferences) => void;
  onAdvanced: (values: QuickPreferences) => void;
  onDismiss: () => void;
};
const spaceChoices = [
  ["very_clean", "a place for everything", "tidy counters, regular resets."],
  ["clean", "comfortably tidy", "cared for, with room to live."],
  ["relaxed", "a little lived in", "easygoing about everyday mess."],
  ["", "keep my options open", "any shared-space style."],
] as const;
const rhythmChoices = [
  ["early_bird", "early mornings", "up early, winding down at night."],
  ["night_owl", "late nights", "more at home after sunset."],
  ["flexible", "a flexible routine", "a little of both."],
  ["", "any daily rhythm", "leave this preference open."],
] as const;
const FilterStep = forwardRef<HTMLElement, {children: ReactNode; reduced: boolean; step: number}>(function FilterStep({children,reduced,step}, ref) {
  const present = useIsPresent();
  const inner = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(()=>inner.current?.querySelector<HTMLElement>('h2')?.focus({preventScroll:true}));
    return ()=>cancelAnimationFrame(frame);
  }, [step]);
  return <motion.section ref={ref} className="quick-filter-step" inert={!present} aria-hidden={!present || undefined}
    initial={{opacity:0,y:reduced?0:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:-5}} transition={{duration:.18}}>
    <div ref={inner}>{children}</div>
  </motion.section>;
});
export default function GuidedFilters({initial,onApply,onAdvanced,onDismiss}:Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reduced = !!useReducedMotion();
  const [values,setValues] = useState(initial);
  const [step,setStep] = useState(0);
  const [closing,setClosing] = useState<"apply"|"advanced"|"dismiss"|null>(null);
  useEffect(()=>{const node=dialog.current;node?.showModal();return()=>node?.close();},[]);
  function close() {setClosing("dismiss");}
  function finish() {
    if (!closing) return;
    if (closing === "advanced") onAdvanced(values);
    else {if (closing === "apply") onApply(values);onDismiss();}
  }
  const choices = step===0 ? spaceChoices : rhythmChoices;
  const field = step===0 ? "cleanliness" : "sleepSchedule";
  return <dialog id="guided-filters" className="quick-filter-dialog" ref={dialog} aria-labelledby="quick-filter-title"
    onCancel={event=>{event.preventDefault();close();}}
    onClick={event=>{if(event.target===event.currentTarget&&isOutsideDialog(event,event.currentTarget.getBoundingClientRect()))close();}}>
    <AnimatePresence onExitComplete={finish}>
      {!closing && <motion.div key="drawer" className="quick-filter-shell" initial={{opacity:0,x:reduced?0:18}} animate={{opacity:1,x:0}} exit={{opacity:0,x:reduced?0:12}} transition={{duration:.2,ease:[.22,1,.36,1]}}>
        <header className="quick-filter-header"><span id="quick-filter-title"><SlidersHorizontal size={18}/>filters</span><button type="button" className="icon-button" aria-label="close filters" onClick={close}><X size={19}/></button></header>
        <p className="quick-filter-context">roommate preferences</p>
        <div className="quick-filter-stage"><AnimatePresence mode="popLayout" initial={false}>
          <FilterStep key={step} step={step} reduced={reduced}>
            <h2 tabIndex={-1}>{step===0 ? "your kind of shared space." : "a rhythm that fits."}</h2>
            <p className="quick-filter-description">{step===0 ? "what would you like in a roommate?" : "what daily rhythm feels like a good fit?"}</p>
            <fieldset className="quick-filter-options"><legend className="sr-only">{step===0?"roommate cleanliness":"roommate sleep schedule"}</legend>
              {choices.map(([value,title,detail])=><label key={value || "any"} className={values[field]===value?"is-selected":""}>
                <span><strong>{title}</strong><small>{detail}</small></span>
                <input type="radio" name={field} value={value} checked={values[field]===value} onChange={()=>setValues({...values,[field]:value})}/>
              </label>)}
            </fieldset>
          </FilterStep>
        </AnimatePresence></div>
        <footer className="quick-filter-actions">
          {step>0 ? <button type="button" className="quick-filter-back" onClick={()=>setStep(0)}><ArrowLeft size={16}/>back</button> : <span/>}
          <button type="button" className="primary-button" onClick={()=>step===0?setStep(1):setClosing("apply")}>{step===0?"next preference":"show roomies"}<ArrowRight size={17}/></button>
        </footer>
        <div className="quick-filter-secondary"><button type="button" className="text-link" onClick={()=>setClosing("advanced")}>see all filters</button></div>
      </motion.div>}
    </AnimatePresence>
  </dialog>;
}
