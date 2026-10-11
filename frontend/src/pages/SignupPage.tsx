import AuthLayout from "../components/AuthLayout";
import { HeartHandshake } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "../auth/authContext";
import FormErrors from "../components/FormErrors";
import { apiRequest } from "../lib/api";

// Two steps: 1) create the account, 2) enter the code Cognito emailed you.
// After confirming, we log you in and send you to build your profile.
function SignupPage() {
  const { token, login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"account" | "confirm">("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  if (token !== null) {
    return <Navigate to="/discover" replace />;
  }

  async function run(action: () => Promise<void>) {
    setSubmitting(true);
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError(caught);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCreateAccount(event: FormEvent) {
    event.preventDefault();
    run(async () => {
      await apiRequest("/signup", { method: "POST", body: { email: email, password: password } });
      setStep("confirm");
    });
  }

  function handleConfirm(event: FormEvent) {
    event.preventDefault();
    run(async () => {
      await apiRequest("/signup/confirm", { method: "POST", body: { email: email, confirmationCode: code } });
      await login(email, password);
      navigate("/profile", { replace: true });
    });
  }

  return (
    <AuthLayout>
      {step === "account" ? (
        <form className="landing-card auth-card" onSubmit={handleCreateAccount}>
          <div className="brand-icon">
            <HeartHandshake size={42} strokeWidth={2.2} />
          </div>
          <p className="eyebrow">Get started</p>
          <h1>Create an account</h1>

          <FormErrors error={error} />

          <label className="field">
            <span>Email</span>
            <input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} />
            <small>At least 8 characters, with an uppercase letter, a lowercase letter, and a number.</small>
          </label>

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </button>
          <p className="auth-card__switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      ) : (
        <form className="landing-card auth-card" onSubmit={handleConfirm}>
          <p className="eyebrow">Almost there</p>
          <h1>Check your email</h1>
          <p className="landing-card__description">We sent a 6-digit code to {email}.</p>

          <FormErrors error={error} />

          <label className="field">
            <span>Confirmation code</span>
            <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={code} onChange={e => setCode(e.target.value)} />
          </label>

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Confirming..." : "Confirm and continue"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default SignupPage;
