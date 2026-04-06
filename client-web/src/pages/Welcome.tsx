import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Welcome to OnTime</h1>
          <p>Get started with public transport monitoring and tower assignment.</p>
        </div>
      </header>

      <main className="content">
        <section className="card">
          <h2>Step 1 of 4</h2>
          <p>OnTime gives you real-time public transport updates, gateway setup, and tower monitoring.</p>
          <div className="buttonGroup">
            <button className="primaryButton" onClick={() => navigate('/signup')}>
              Create Account
            </button>
            <button className="secondaryButton" onClick={() => navigate('/login')}>
              Log In
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
