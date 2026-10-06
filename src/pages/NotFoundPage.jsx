import { Link } from "react-router-dom";
import FadeImg from "../components/FadeImg.jsx";
import { getSpriteUrl } from "../utils.js";

function NotFoundPage() {
  return (
    <div className="nf page-enter">
      <div className="nf-art-wrap" aria-hidden="true">
        <FadeImg
          src={getSpriteUrl(133)}
          alt=""
          width={120}
          height={120}
          pixelated
          className="nf-pokemon"
        />
        <span className="nf-ghost">?</span>
      </div>
      <h2 className="nf-title">Uh-oh…</h2>
      <p className="nf-text">
        This Pokémon slipped through the net. The page you&apos;re looking for
        doesn&apos;t exist.
      </p>
      <Link to="/" className="btn btn-primary">
        ← Back to the Pokédex
      </Link>
    </div>
  );
}

export default NotFoundPage;
