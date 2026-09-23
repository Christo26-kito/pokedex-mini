import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="status">
      <div aria-hidden="true" style={{ fontSize: "3rem", textAlign: "center" }}>
        🫥
      </div>
      <p>This route doesn't exist.</p>
      <Link to="/" className="back-link">← Back to Pokédex</Link>
    </div>
  );
}

export default NotFoundPage;
