import type { CSSProperties } from "react";
export default function Blossoms({ paused = false }: { paused?: boolean }) {
  return (
    <>
      <div
        className={`blossoms ${paused ? "blossoms--paused" : ""}`}
        aria-hidden="true"
      >
        <svg className="blossom-branch" viewBox="0 0 500 320" fill="none">
          <path
            d="M505 20C398 30 390 126 295 145S126 184 32 286M403 64L355 9M323 139L284 64M233 169L184 104M144 212L117 168M349 133L418 158"
            stroke="currentColor"
            strokeWidth="3"
          />
          {[
            [354, 24],
            [288, 76],
            [184, 110],
            [120, 178],
            [52, 270],
            [249, 164],
            [413, 157],
            [337, 128],
          ].map(([x, y], i) => (
            <g
              key={i}
              transform={`translate(${x} ${y})`}
              fill={i % 2 ? "#b59bc2" : "#ded1e7"}
            >
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse
                  key={a}
                  cy="-9"
                  rx="6"
                  ry="10"
                  transform={`rotate(${a})`}
                />
              ))}
              <circle r="3" fill="#f1eff4" />
            </g>
          ))}
        </svg>
        {Array.from({ length: 5 }, (_, i) => (
          <i
            key={i}
            className="falling-petal"
            style={
              {
                "--left": `${14 + i * 17}%`,
                "--delay": `${-i * 2.7}s`,
                "--duration": `${16 + (i % 4) * 3}s`,
                "--drift": `${i % 2 ? 130 : -90}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}
