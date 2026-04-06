import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    navigate('/dashboard');
  };

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Create Account</h1>
          <p>Sign up to start assigning tower stops and monitoring lines.</p>
        </div>
      </header>

      <main className="content">
        <section className="card">
          <h2>Step 2 of 4</h2>
          <div className="formRow">
            <label>
              Email
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
                placeholder="Password"
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
                placeholder="Confirm password"
                className="textInput"
              />
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="primaryButton" onClick={handleSignUp}>
            Create Account
          </button>
          <button className="secondaryButton" onClick={() => navigate('/login')}>
            Already have an account
          </button>
        </section>
      </main>
    </div>
  );
}
