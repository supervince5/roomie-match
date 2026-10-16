import { Link } from "react-router";
import BrandMark from "./BrandMark";
export default function Brand() {
  return (
    <Link viewTransition className="brand" to="/" aria-label="matcharoomie home">
      <BrandMark />
      <span>
        <span className="brand-word">matcha</span>roomie
        
      </span>
    </Link>
  );
}
