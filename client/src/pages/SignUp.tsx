import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../api";

export default function SignUp() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (
      !userName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await signupUser(userName, email, password);
      navigate("/device-connect");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Create Account</h1>
          <p>Join OnTime and start monitoring your devices today.</p>
        </div>
      </header>

      <main className="content">
        <section className="card authCard">
          <h2>Sign Up</h2>
          <div className="formRow">
            <label>
              Username
              <input
                type="text"
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                placeholder="e.g., alex"
                className="textInput"
              />
            </label>
          </div>
          <div className="formRow">
            <label>
              Email Address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="textInput"
              />
            </label>
          </div>
          <div className="formRow">
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password (6+ characters)"
                className="textInput"
              />
            </label>
          </div>
          <div className="formRow">
            <label>
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your password"
                className="textInput"
              />
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <button
            className="primaryButton authButton"
            onClick={handleSignUp}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account…" : "Create Account"}
          </button>
          <div className="divider">or</div>
          <button
            className="secondaryButton authButton"
            onClick={() => navigate("/login")}
          >
            Already have an account? Sign In
          </button>
        </section>

        <section className="card infoCard">
          <h3>Why OnTime?</h3>
          <ul className="reasonsList">
            <li>✓ Real-time transport monitoring</li>
            <li>✓ Easy device management</li>
            <li>✓ Reliable and always available</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
