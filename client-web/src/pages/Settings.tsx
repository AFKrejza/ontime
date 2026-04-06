import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and web app preferences.</p>
        </div>
      </header>

      <main className="content">
        <section className="card">
          <h2>Account</h2>
          <p>Currently signed in to the OnTime web app.</p>
          <button className="secondaryButton gatewayButton" onClick={() => navigate('/')}>
            Sign out
          </button>
        </section>

        <section className="card">
          <h2>App</h2>
          <p>Navigate back to the dashboard or add a new gateway.</p>
          <button className="primaryButton gatewayButton" onClick={() => navigate('/dashboard')}>
            View dashboard
          </button>
        </section>
      </main>
    </div>
  );
}
