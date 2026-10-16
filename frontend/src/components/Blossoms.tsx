import type { CSSProperties } from "react";

function Branch({ lower = false }: { lower?: boolean }) {
  return (
    <svg className={`blossom-branch ${lower ? "blossom-branch--lower" : ""}`} viewBox="0 0 500 320" fill="none">
      <path d="M505 20C398 30 390 126 295 145S126 184 32 286" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M403 64L355 9M323 139L284 64M233 169L184 104M144 212L117 168M349 133L418 158M295 145L309 210M184 104L153 91M117 168L92 159M377 103L430 79M76 248L36 224" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {[[354,24],[288,76],[184,110],[120,178],[52,270],[249,164],[413,157],[337,128],[307,208],[428,80],[153,91],[36,224],[220,165],[385,74],[96,158]].map(([x,y],i)=>(
        <g key={i} transform={`translate(${x} ${y}) rotate(${i*31}) scale(${i%3===0?1:.72})`}>
          {[0,72,144,216,288].map(a=>(
            <path key={a} d="M0 2C-12-2-11-15-5-18L0-15 5-18C11-15 12-2 0 2Z" transform={`rotate(${a})`} fill={i%2 ? "#FFB1B1" : "#FFCCB8"} stroke="#ca8580" strokeWidth=".45" />
          ))}
          <circle r="3.2" fill="#FFFAD3" />
          <circle r="1.3" fill="#bd7c67" />
        </g>
      ))}
      <path d="M264 148Q251 120 272 127Q281 139 264 148M395 67Q405 41 418 50Q413 65 395 67M99 230Q66 224 73 209Q95 209 99 230" fill="#c6ad79" opacity=".65" />
    </svg>
  );
}
export default function Blossoms({ paused = false, quiet = false }: { paused?: boolean; quiet?: boolean }) {
  return (
    <div className={`blossoms ${paused ? "blossoms--paused" : ""} ${quiet ? "blossoms--quiet" : ""}`} aria-hidden="true">
      <Branch />
      <Branch lower />
      {!quiet && Array.from({length:9},(_,i)=>(
        <i key={i} className="falling-petal" style={{"--petal-width":`${4+(i%3)*1.5}px`,"--left":`${7+i*11}%`,"--delay":`${-i*3.1}s`,"--duration":`${16+(i%4)*3}s`,"--drift":`${i%2?110:-85}px`} as CSSProperties} />
      ))}
    </div>
  );
}
