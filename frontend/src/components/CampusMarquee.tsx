const campuses = [
  { name: "Stanford", file: "stanford.png" },
  { name: "Harvard", file: "harvard.png" },
  { name: "Virginia Tech", file: "virginia-tech.svg" },
  { name: "Yale", file: "yale.png" },
  { name: "MIT", file: "mit.svg" },
  { name: "Duke", file: "duke.png" },
  { name: "UNC Chapel Hill", file: "unc.png" },
];

export default function CampusMarquee() {
  return (
    <div
      className="campus-marquee"
      role="group"
      aria-label="Users from these campuses"
    >
      <p>users from:</p>
      <div className="campus-marquee__window">
        <div className="campus-marquee__track">
          {[0, 1].map((copy) => (
            <div
              className="campus-marquee__group"
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
            >
              {campuses.map((campus) => (
                <span className="campus-marquee__school" key={campus.name}>
                  <img
                    src={`/colleges/${campus.file}`}
                    alt=""
                    width="26"
                    height="26"
                    draggable={false}
                  />
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
