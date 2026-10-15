import { Link } from "react-router";
import BrandMark from "./BrandMark";
export default function Brand() {
  return (
    <Link className="brand" to="/" aria-label="RoomieMatch home">
      <BrandMark />
      <span>
        roomie<span className="brand-word">match</span>
        
      </span>
    </Link>
  );
}
