import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  const features = [
    { icon: '📍', title: 'Real-time Monitoring', desc: 'Track buses and metro arrivals in real-time' },
    { icon: '🔗', title: 'Device Connection', desc: 'Connect your tower devices to the network' },
    { icon: '⚙️', title: 'Easy Configuration', desc: 'Set up stops and monitor routes with one click' },
  ];

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Welcome to OnTime</h1>
          <p>Your public transport monitoring solution with real-time updates and device management.</p>
        </div>
      </header>

      <main className="content">
        <section className="card">
          <h2>What is OnTime?</h2>
          <p className="featureIntro">OnTime helps you monitor public transport lines in real-time and manage your connected tower devices.</p>
          
          <div className="featuresGrid">
            {features.map((feature) => (
              <div key={feature.title} className="featureCard">
                <div className="featureIcon">{feature.icon}</div>
                <h3 className="featureTitle">{feature.title}</h3>
                <p className="featureDesc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card authSection">
          <h2>Get Started</h2>
          <p>Create a new account or log in to continue.</p>
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

