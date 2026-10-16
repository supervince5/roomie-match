import AuthLayout from "../components/AuthLayout";
import { KeyRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import FormErrors from "../components/FormErrors";
import { apiRequest } from "../lib/api";

// Step 1: enter your email, and Cognito emails a code.
// Step 2: enter the code and a new password.
// Step 3: done, so log in.
function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "reset" | "done">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

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

  function handleSendCode(event: FormEvent) {
    event.preventDefault();
    run(async () => {
      await apiRequest("/password/forgot", { method: "POST", body: { email: email } });
      setStep("reset");
    });
  }

  function handleReset(event: FormEvent) {
    event.preventDefault();
    run(async () => {
      await apiRequest("/password/reset", {
        method: "POST",
        body: { email: email, confirmationCode: code, newPassword: newPassword },
      });
      setStep("done");
    });
  }

  return (
    <AuthLayout>
      {step === "email" && (
        <form className="landing-card auth-card" onSubmit={handleSendCode}>
          <div className="brand-icon">
            <KeyRound size={40} strokeWidth={2.2} />
          </div>
          <p className="eyebrow">Forgot password</p>
          <h1>Reset your password</h1>
          <p className="landing-card__description">Enter your email and we'll send you a 6-digit code.</p>
          <FormErrors error={error} />
          <label className="field">
            <span>Email</span>
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send code"}
          </button>
          <p className="auth-card__switch">
            Remembered it? <Link viewTransition to="/login">Log in</Link>
          </p>
        </form>
      )}

      {step === "reset" && (
        <form className="landing-card auth-card" onSubmit={handleReset}>
          <p className="eyebrow">Check your email</p>
          <h1>Choose a new password</h1>
          <p className="landing-card__description">If {email} has an account, a code is on its way.</p>
          <FormErrors error={error} />
          <label className="field">
            <span>Code</span>
            <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
          <label className="field">
            <span>New password</span>
            <input type="password" autoComplete="new-password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <small>At least 8 characters, with an uppercase letter, a lowercase letter, and a number.</small>
          </label>
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Set new password"}
          </button>
          <button className="secondary-button" type="button" onClick={() => setStep("email")}>
            Send a new code
          </button>
        </form>
      )}

      {step === "done" && (
        <section className="landing-card auth-card">
          <p className="eyebrow">All set</p>
          <h1>Password updated</h1>
          <p className="landing-card__description">You can log in with your new password now.</p>
          <Link viewTransition className="primary-button" to="/login">Log in</Link>
        </section>
      )}
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
