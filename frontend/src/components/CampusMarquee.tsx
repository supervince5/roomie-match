import { useEffect, useRef, useState } from "react";
import { featuredCampuses as campuses } from "../lib/featuredCampuses";

export default function CampusMarquee({ prelaunch = false }: { prelaunch?: boolean }) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(campuses.length * 6);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    // Keep the same gentle travel speed regardless of the number of schools.
    const measure = () => setDuration(Math.max(42, group.getBoundingClientRect().width / 36));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(group);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="campus-marquee"
      role="group"
      aria-label={prelaunch ? "college inspiration" : "Explore roomies from these campuses"}
    >
      <p>{prelaunch ? "where will you call home?" : "explore roomies from:"}</p>
      <div className="campus-marquee__window">
        <div className="campus-marquee__track" style={{ animationDuration: `${duration}s` }}>
          {[0, 1].map((copy) => (
            <div
              className="campus-marquee__group"
              ref={copy === 0 ? groupRef : undefined}
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
            >
              {campuses.map((campus) => (
                <span className="campus-marquee__school" key={campus.name}>
                  {campus.file && <img
                    src={`/colleges/${campus.file}`}
                    alt=""
                    width="26"
                    height="26"
                    draggable={false}
                  />}
                  <span>{campus.name}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
