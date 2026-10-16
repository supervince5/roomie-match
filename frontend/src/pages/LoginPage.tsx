import AuthLayout from "../components/AuthLayout";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useAuth } from "../auth/authContext";
import FormErrors from "../components/FormErrors";

function LoginPage() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const goTo = (location.state as { from?: string } | null)?.from ?? "/discover";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  if (token !== null) {
    return <Navigate to={goTo} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate(goTo, { replace: true, viewTransition: true });
    } catch (caught) {
      setError(caught);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <form className="landing-card auth-card" onSubmit={handleSubmit}>
        <p className="auth-card__overline">Welcome back</p>
        <h1>Good to have<br />you back.</h1>
        <p className="auth-card__intro">Log in to pick up where you left off.</p>

        <FormErrors error={error} />

        <label className="field">
          <span>Email</span>
          <input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
          <Link viewTransition className="field__link" to="/forgot-password">Forgot password?</Link>
        </label>

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </button>
        <p className="auth-card__switch">
          New here? <Link viewTransition to="/signup">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
