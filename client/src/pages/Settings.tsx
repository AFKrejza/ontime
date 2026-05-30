import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTowerConfigs,
  clearTowerConfigs,
  TowerConfig,
} from "../towerStorage";
import BackButton from "../components/BackButton";
import {
  clearToken,
  authFetch,
  deleteAssignment,
  deleteAllAssignments,
  getUserGateways,
  getUserIdFromToken,
  fetchProfile,
  userProfile,
} from "../api";

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<userProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const profileData = await fetchProfile();
        setProfile(profileData);
      } catch (error) {
        console.error("Unable to load data from DB: ", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSignOut = () => {
    clearToken();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="page" style={{ padding: "20px" }}>
        Loading settings...
      </div>
    );
  }

  return (
    <div className="page">
      <BackButton />
      <header className="header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and preferences.</p>
        </div>
      </header>

      <main className="content">
        <section className="card">
          <h2>Account</h2>
          <p>You are currently signed in.</p>
          <div className="settingsList">
            <div className="settingItem">
              <span className="settingLabel">Username</span>
              <span className="settingValue">
                {profile?.username || "Loading..."}
              </span>
            </div>
            <div className="settingItem">
              <span className="settingLabel">Email</span>
              <span className="settingValue">
                {profile?.email || "Loading..."}
              </span>
            </div>
            <div className="settingItem">
              <span className="settingLabel">Account Status</span>
              <span className="settingValue active">Active</span>
            </div>
          </div>
          <button
            className="secondaryButton gatewayButton"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </section>

        <section className="card">
          <h2>ℹ️ About</h2>
          <div className="aboutInfo">
            <p>
              <strong>OnTime</strong> v1.0.0
            </p>
            <p>
              A real-time public transport monitoring solution for tower
              devices.
            </p>
            <p className="aboutMeta">© 2026 OnTime. All rights reserved.</p>
          </div>
        </section>

        <section className="card">
          <button
            className="secondaryButton gatewayButton"
            onClick={() => navigate(-1)}
          >
            ← Back to Dashboard
          </button>
        </section>
      </main>
    </div>
  );
}
