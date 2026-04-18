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
          <p>Access your OnTime account and manage your devices.</p>
        </div>
      </header>

      <main className="content">
        <section className="card authCard">
          <h2>Sign In to Your Account</h2>
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
                placeholder="Enter your password"
                className="textInput"
              />
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="primaryButton authButton" onClick={handleLogin}>
            Sign In
          </button>
          <div className="divider">or</div>
          <button className="secondaryButton authButton" onClick={() => navigate('/signup')}>
            Create New Account
          </button>
        </section>

        <section className="card infoCard">
          <h3>Need help?</h3>
          <p>If you don't have an account yet, you can create one in seconds with just an email and password.</p>
        </section>
      </main>
    </div>
  );
}
