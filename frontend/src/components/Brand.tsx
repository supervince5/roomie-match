import { Link } from "react-router";
export default function Brand() {
  return (
    <Link className="brand" to="/" aria-label="RoomieMatch home">
      <span className="brand-mark" aria-hidden="true">
        rm<span>✳</span>
      </span>
      <span>
        roomie<span className="brand-word">match</span>
        <small>A LITTLE MORE AT HOME.</small>
      </span>
    </Link>
  );
}
