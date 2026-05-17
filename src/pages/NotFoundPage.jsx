import { Link } from 'react-router-dom';

// Shown for any URL that doesn't match a route (the * route in App.jsx)
export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h2>404 — Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">Go back to shop</Link>
    </div>
  );
}
