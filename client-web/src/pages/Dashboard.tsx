import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTowerConfigs, TowerConfig } from '../towerStorage';

type DisplayDevice = {
  name: string;
  status: string;
  battery: string;
  lastSeen: string;
  lowBattery: boolean;
  line: string;
  location: string;
  offset?: number;
};

const fallbackDevices: DisplayDevice[] = [
  {
    name: 'home stop',
    status: 'online',
    battery: '46%',
    lastSeen: '12:32',
    lowBattery: false,
    line: 'Line 136',
    location: 'Vysočanská',
  },
  {
    name: 'work stop',
    status: 'offline',
    battery: '22%',
    lastSeen: '16:03',
    lowBattery: true,
    line: 'Metro B',
    location: 'Kolbenova',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [towerConfigs, setTowerConfigs] = useState<TowerConfig[]>([]);

  useEffect(() => {
    setTowerConfigs(getTowerConfigs());
  }, []);

  const devices = towerConfigs.length > 0
    ? towerConfigs.map((config) => ({
        name: config.stopName,
        status: 'online',
        battery: config.offset ? `${config.offset * 2}%` : 'n/a',
        lastSeen: new Date(config.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lowBattery: false,
        line: config.line.name,
        location: config.stopName,
        offset: config.offset,
      }))
    : fallbackDevices;

  const onlineCount = devices.filter(d => d.status === 'online').length;

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Dashboard</h1>
          <p>Monitor your connected devices and tower assignments.</p>
        </div>
      </header>

      <main className="content">
        <section className="card summarySection">
          <div className="summaryGrid">
            <div className="summaryItem">
              <div className="summaryValue">{onlineCount}</div>
              <div className="summaryLabel">Online Devices</div>
            </div>
            <div className="summaryItem">
              <div className="summaryValue">{devices.length}</div>
              <div className="summaryLabel">Total Towers</div>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>Your Towers</h2>
          <div className="deviceGrid">
            {devices.map((device) => (
              <div key={device.name} className="deviceCard">
                <div className="deviceHeader">
                  <div>
                    <div className="deviceLabel">📍 {device.name}</div>
                    <div className="deviceLocation">{device.location}</div>
                  </div>
                  <div className={device.status === 'online' ? 'statusBadge online' : 'statusBadge offline'}>
                    {device.status === 'online' ? '🟢' : '🔴'} {device.status}
                  </div>
                </div>

                <div className="deviceDetails">
                  <div className="deviceDetailRow">
                    <span className="detailLabel">Line:</span>
                    <span className="detailValue">{device.line}</span>
                  </div>
                  <div className="deviceDetailRow">
                    <span className="detailLabel">Battery:</span>
                    <span className={`detailValue ${device.lowBattery ? 'lowBattery' : ''}`}>
                      🔋 {device.battery}
                    </span>
                  </div>
                  {device.offset != null && (
                    <div className="deviceDetailRow">
                      <span className="detailLabel">Offset:</span>
                      <span className="detailValue">{device.offset} mins</span>
                    </div>
                  )}
                  <div className="deviceDetailRow">
                    <span className="detailLabel">Last seen:</span>
                    <span className="detailValue">{device.lastSeen}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <button className="primaryButton gatewayButton" onClick={() => navigate('/tower')}>
            ➕ Add New Assignment
          </button>
          <button className="secondaryButton gatewayButton" onClick={() => navigate('/settings')}>
            ⚙️ Settings
          </button>
        </section>
      </main>
    </div>
  );
}
