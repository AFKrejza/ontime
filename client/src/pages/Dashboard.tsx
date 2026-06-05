import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTowerConfigs, TowerConfig } from "../towerStorage";
import {
  getTowerStatus,
  authFetch,
  getUserGateways,
  deleteAssignment,
} from "../api";
// @ts-ignore
import DeleteButton from "../assets/delete.png";
import BackButton from "../components/BackButton";
import getBatteryIcon from "../components/batteryLevel";
import SettingsButton from "../components/SettingsButton";

type DisplayDevice = {
  assignmentId: string;
  name: string;
  status: string;
  lastSeen: string;
  line: string;
  type: string;
  location: string;
  offset: number;
  battery: number;
};

interface TowerInfo {
  id: string;
  name: string;
  battery: number;
  lastSeen: string;
  assignments: any[];
}
export default function Dashboard() {
  const navigate = useNavigate();
  const { towerId } = useParams<{ towerId: string }>();
  const [towerConfigs, setTowerConfigs] = useState<TowerConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawTowerInfo, setRawTowerInfo] = useState<TowerInfo>();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const getTowers = await authFetch(`/towers/${towerId}`);
        const tower: TowerInfo = await getTowers.json();
        console.log(`get towers response: ${JSON.stringify(getTowers)}`);
        console.log(`tower object: ${JSON.stringify(tower)}`);

        const realConfigs: TowerConfig[] = tower.assignments.map(
          (ass: any) => ({
            id: String(ass.assignmentId),
            towerId: tower.id,
            towerName: tower.name,
            stopName: ass.stop.name,
            stopId: ass.stopId,
            slug: ass.stop.slug,
            line: ass.line,
            offset: ass.departureOffset,
            lastSeen: tower.lastSeen,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        );
        console.log(`tower last Seen: ${tower.lastSeen}`);

        setTowerConfigs(realConfigs);
        setRawTowerInfo(tower);
      } catch (error) {
        console.error("Unable to load data from DB: ", error);
      } finally {
        setLoading(false);
      }
    }
    if (towerId) loadData();
  }, [towerId]);

  const devices = towerConfigs.map((config: any) => {
    let transportType = config.line.type;
    if (transportType === "metro") {
      transportType = "Metro Line";
    } else if (transportType === "tram") {
      transportType = "Tram";
    } else if (transportType === "bus") {
      transportType = "Bus";
    }
    console.log(`last Seen: ${config.lastSeen}`);
    return {
      assignmentId: config.id,
      name: config.stopName,
      status: "online",
      battery: config.batteryLevel ? `${config.batteryLevel}%` : "100%",
      lastSeen: new Date(config.lastSeen).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      line: config.line.name,
      type: transportType,
      location: `${config.line.direction}`,
      offset: Math.abs(config.offset),
    };
  });

  console.log(`towerconfigs: ${JSON.stringify(towerConfigs)}`);
  console.log(`devices: ${JSON.stringify(devices)}`);

  // if data is still loading in useEffect, then show Loader:
  if (loading || !rawTowerInfo) {
    return (
      <div className="page" style={{ padding: "20px" }}>
        Loading tower data...
      </div>
    );
  }

  async function handleDeleteAssignment(assignmentId: string) {
    const userCode = window.prompt("To delete assignment, type 'delete': ");

    if (userCode?.toLocaleLowerCase() !== "delete") {
      alert("Delete canceled.");
      return;
    }
    try {
      await deleteAssignment(rawTowerInfo!.id, assignmentId);
      setTowerConfigs((prev) => prev.filter((c) => c.id !== assignmentId));
    } catch (err) {
      alert("Failed to delete from server");
    }
  }
  return (
    <div className="page">
      <BackButton toPage="/gateways" />
      <SettingsButton toPage="/settings" />
      <header className="header">
        <div>
          <h1>Tower: {rawTowerInfo.name}</h1>
          <p>Monitor your connected devices and tower assignments.</p>
        </div>
      </header>

      <main className="content">
        <section className="card summarySection">
          <div className="summaryGrid">
            <div className="summaryItem">
              <div className="summaryValue">
                {rawTowerInfo.lastSeen ? new Date(rawTowerInfo.lastSeen).toLocaleTimeString() : "Never"}
              </div>
              <div className="summaryLabel">Last seen</div>
            </div>
            <div className="summaryItem">
              <div className="summaryValue">{devices.length}</div>
              <div className="summaryLabel">Active Assignments</div>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>Your Tower Stops</h2>
          <div className="deviceGrid">
            {devices.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  padding: "4px",
                  color: "#64748b",
                }}
              >
                No assignments found for this tower. Click the button below to
                add one!
              </p>
            ) : (
              devices.map((device) => (
                <div key={device.name} className="deviceCard">
                  <div className="deviceHeader">
                    <div>
                      <div className="deviceLabel">📍 {device.name}</div>
                      <div className="deviceLocation">{device.location}</div>
                    </div>
                    <div className="assignmentHeader">
                      <div
                        className={
                          device.status === "online"
                            ? "statusBadge online"
                            : "statusBadge offline"
                        }
                      >
                        {device.status === "online" ? "🟢" : "🔴"}{" "}
                        {device.status}
                      </div>
                      <button
                        className="deleteButton"
                        onClick={() =>
                          handleDeleteAssignment(device.assignmentId)
                        }
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = "1";
                          e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        <img
                          src={DeleteButton}
                          alt="Back"
                          style={{
                            width: "1.65rem",
                            height: "1.65rem",
                            objectFit: "contain",
                          }}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="deviceDetails">
                    <div className="deviceDetailRow">
                      <span className="detailLabel">{device.type}:</span>
                      <span className="detailValue">{device.line}</span>
                    </div>
                    <div className="deviceDetailRow">
                      <span className="detailLabel">Direction:</span>
                      <span className="detailValue">{device.location}</span>
                    </div>
                    {device.offset != null && (
                      <div className="deviceDetailRow">
                        <span className="detailLabel">Offset:</span>
                        <span className="detailValue">
                          {device.offset} mins
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card">
          <button
            className="primaryButton gatewayButton"
            onClick={() => navigate("/tower")}
          >
            ➕ Add New Assignment
          </button>
          <button
            className="secondaryButton gatewayButton"
            onClick={() => navigate("/settings")}
          >
            ⚙️ Settings
          </button>
        </section>
      </main>
    </div>
  );
}
