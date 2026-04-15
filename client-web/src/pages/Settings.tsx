import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTowerConfigs, clearTowerConfigs, TowerConfig } from '../towerStorage';

export default function Settings() {
  const navigate = useNavigate();
  const [towerConfigs, setTowerConfigs] = useState<TowerConfig[]>([]);

  useEffect(() => {
    setTowerConfigs(getTowerConfigs());
  }, []);

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and preferences.</p>
        </div>
      </header>

      <main className="content">
        <section className="card">
          <h2>👤 Account</h2>
          <p>You are currently signed in as a user.</p>
          <div className="settingsList">
            <div className="settingItem">
              <span className="settingLabel">Email</span>
              <span className="settingValue">user@example.com</span>
            </div>
            <div className="settingItem">
              <span className="settingLabel">Account Status</span>
              <span className="settingValue active">Active</span>
            </div>
          </div>
          <button className="secondaryButton gatewayButton" onClick={() => navigate('/')}>
            Sign Out
          </button>
        </section>

        <section className="card">
          <h2>🏠 Devices</h2>
          <p>You have {towerConfigs.length} configured tower{towerConfigs.length === 1 ? '' : 's'}.</p>
          <button className="primaryButton gatewayButton" onClick={() => navigate('/tower')}>
            Add New Device
          </button>
          {towerConfigs.length > 0 && (
            <div className="settingsList">
              {towerConfigs.map((config) => (
                <div key={config.id} className="settingItem">
                  <span>
                    <strong>{config.stopName}</strong> • {config.line.name}
                  </span>
                  <span className="settingValue">Offset {config.offset}m</span>
                </div>
              ))}
            </div>
          )}
          {towerConfigs.length > 0 && (
            <button className="secondaryButton gatewayButton" onClick={() => {
              clearTowerConfigs();
              setTowerConfigs([]);
            }}>
              Clear All Tower Settings
            </button>
          )}
        </section>

        <section className="card">
          <h2>🎯 Preferences</h2>
          <p>Customize your OnTime experience.</p>
          <div className="settingsList">
            <div className="settingItem">
              <span className="settingLabel">Notifications</span>
              <span className="settingValue">Enabled</span>
            </div>
            <div className="settingItem">
              <span className="settingLabel">Theme</span>
              <span className="settingValue">Light Mode</span>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>ℹ️ About</h2>
          <div className="aboutInfo">
            <p><strong>OnTime</strong> v1.0.0</p>
            <p>A real-time public transport monitoring solution for tower devices.</p>
            <p className="aboutMeta">© 2026 OnTime. All rights reserved.</p>
          </div>
        </section>

        <section className="card">
          <button className="secondaryButton gatewayButton" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </section>
      </main>
    </div>
  );
}
