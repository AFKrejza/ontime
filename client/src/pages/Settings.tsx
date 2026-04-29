import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTowerConfigs,
  clearTowerConfigs,
  TowerConfig,
} from "../towerStorage";
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
  const [towerConfigs, setTowerConfigs] = useState<TowerConfig[]>([]);
  const [profile, setProfile] = useState<userProfile | null>(null);
  const userId = getUserIdFromToken();

  useEffect(() => {
    async function loadData() {
      try {
        // getting getaeways from backend
        const [profileData, gateways] = await Promise.all([
          fetchProfile(),
          getUserGateways(),
        ]);
        setProfile(profileData);

        const allData = await Promise.all(
          gateways.map(async (gt: any) => {
            const res = await authFetch(`/gateways/${gt.id}/status`);
            return res.json();
          }),
        );

        const combined: any[] = allData.flatMap((gwStatus: any) =>
          gwStatus.towers.flatMap((tower: any) =>
            tower.assignments.map((ass: any) => ({
              id: String(ass.assignmentId),
              towerId: tower.towerId,
              stopName: ass.stop.name,
              line: ass.line,
              offset: ass.departureOffset,
              gatewayName: gwStatus.gatewayName,
            })),
          ),
        );
        setTowerConfigs(combined);
      } catch (error) {
        console.error("Unable to load data from DB: ", error);
      }
    }
    loadData();
  }, []);

  const handleSignOut = () => {
    clearToken();
    navigate("/");
  };

  const handleDeleteOne = async (towerId: string, assignmentId: string) => {
    if (!window.confirm("Delete this assignment?")) return;

    try {
      await deleteAssignment(towerId, assignmentId);
      setTowerConfigs((prev) => prev.filter((c) => c.id !== assignmentId));
    } catch (err) {
      alert("Failed to delete from server");
    }
  };

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL assignments? This cannot be undone.",
      )
    )
      return;
    try {
      const uniqueTowerIds = Array.from(
        new Set(towerConfigs.map((c) => c.towerId)),
      );
      await Promise.all(uniqueTowerIds.map((id) => deleteAllAssignments(id)));
      setTowerConfigs([]);
      alert("All tower settings have been cleared.");
    } catch (err) {
      console.error(err);
      alert("Failed to clear assignments from server.");
    }
  };

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
          <h2>Your Assignments</h2>
          <p>Currently monitoring {towerConfigs.length} transport lines.</p>
          <button
            className="primaryButton gatewayButton"
            onClick={() => navigate("/tower")}
          >
            Add New Device
          </button>
          {towerConfigs.length > 0 && (
            <div className="settingsList">
              {towerConfigs.map((config) => (
                <div key={config.id} className="settingItem">
                  <span>
                    <strong>{config.stopName}</strong> • {config.line.name}
                    <br />
                    <small style={{ color: "#888" }}>
                      Device: {config.gatewayName}
                    </small>
                  </span>
                  <span className="settingValue">Offset {config.offset}m</span>
                  <button
                    className="linkButton"
                    style={{ color: "#ff4444", width: "10%" }}
                    onClick={() => handleDeleteOne(config.towerId, config.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          {towerConfigs.length > 0 && (
            <button
              className="secondaryButton gatewayButton"
              onClick={handleDeleteAll}
            >
              Clear All Assignments
            </button>
          )}
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
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </section>
      </main>
    </div>
  );
}
