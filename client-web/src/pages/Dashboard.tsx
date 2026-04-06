import { useNavigate } from 'react-router-dom';

const devices = [
  {
    name: 'home stop',
    status: 'online',
    battery: '46%',
    lastSeen: '12:32',
    lowBattery: false,
  },
  {
    name: 'work stop',
    status: 'offline',
    battery: '22%',
    lastSeen: '16:03',
    lowBattery: true,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Your devices</h1>
          <p>Monitor your gateways, status, and recent activity.</p>
        </div>
      </header>

      <main className="content">
        <section className="card">
          <div className="deviceGrid">
            {devices.map((device) => (
              <div key={device.name} className="deviceCard">
                <div className="deviceHeader">
                  <div>
                    <div className="deviceLabel">Tower: {device.name}</div>
                  </div>
                  <div className={device.status === 'online' ? 'statusValue online' : 'statusValue offline'}>
                    {device.status}
                  </div>
                </div>

                <div className="deviceRow">
                  <span>Battery:</span>
                  <span className={device.lowBattery ? 'statusValue offline' : 'statusValue normalBattery'}>{device.battery}</span>
                </div>
                <div className="deviceRow">
                  <span>Last seen:</span>
                  <span>{device.lastSeen}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <button className="primaryButton gatewayButton" onClick={() => navigate('/tower')}>
            + Add assignment
          </button>
        </section>
      </main>
    </div>
  );
}
