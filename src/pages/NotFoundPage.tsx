import { Link } from "react-router";

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <p className="not-found-page__number">404</p>
      <h1>That page does not exist.</h1>

      <p>
        The address may be incorrect, or the page may have moved.
      </p>

      <Link className="primary-button" to="/">
        Return home
      </Link>
    </main>
  );
}

export default NotFoundPage;