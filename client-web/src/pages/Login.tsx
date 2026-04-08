import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }
    setError('');
    navigate('/device-connect');
  };

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Log In</h1>
          <p>Enter your credentials to continue to OnTime.</p>
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
          {error && <p className="error">{error}</p>}
          <button className="primaryButton" onClick={handleLogin}>
            Log In
          </button>
          <button className="secondaryButton" onClick={() => navigate('/signup')}>
            Create account
          </button>
        </section>
      </main>
    </div>
  );
}
