import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTowerConfigs, TowerConfig } from "../towerStorage";
import { getTowerStatus, authFetch, getUserGateways } from "../api";

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
    name: "home stop",
    status: "online",
    battery: "46%",
    lastSeen: "12:32",
    lowBattery: false,
    line: "Line 136",
    location: "Vysočanská",
  },
  {
    name: "work stop",
    status: "offline",
    battery: "22%",
    lastSeen: "16:03",
    lowBattery: true,
    line: "Metro B",
    location: "Kolbenova",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [towerConfigs, setTowerConfigs] = useState<TowerConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // getting gateways list info from backend
        const gateways = await getUserGateways();

        // for each gateway get its status: towers, assignments
        const allTowersData = await Promise.all(
          gateways.map(async (gw: any) => {
            const statusRes = await authFetch(`/gateways/${gw.id}/status`);
            return statusRes.json();
          }),
        );

        const realConfigs: TowerConfig[] = allTowersData.flatMap(
          (gwStatus: any) =>
            gwStatus.towers.flatMap((tower: any) =>
              tower.assignments.map((ass: any) => ({
                id: String(ass.assignmentId),
                stopName: ass.stop.name,
                stopId: String(ass.stopId),
                line: ass.line,
                offset: ass.departureOffset,
                createdAt: new Date().toISOString(),
                updatedAt: tower.lastSeen || new Date().toISOString(),
                gatewayName: gwStatus.gatewayName,
                towerName: tower.towerName,
                batteryLevel: tower.battery,
              })),
            ),
        );
        //
        setTowerConfigs(realConfigs);
      } catch (error) {
        console.error("Unable to load data from DB: ", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const devices =
    towerConfigs.length > 0
      ? towerConfigs.map((config: any) => ({
          name: config.stopName,
          status: "online",
          battery: config.batteryLevel ? `${config.batteryLevel}%` : "100%",
          lastSeen: new Date(config.updatedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          lowBattery: false,
          line: config.line.name,
          location: `${config.gatewayName} • ${config.towerName}`,
          offset: Math.abs(config.offset),
        }))
      : fallbackDevices;

  const onlineCount = devices.filter((d) => d.status === "online").length;

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
                  <div
                    className={
                      device.status === "online"
                        ? "statusBadge online"
                        : "statusBadge offline"
                    }
                  >
                    {device.status === "online" ? "🟢" : "🔴"} {device.status}
                  </div>
                </div>

                <div className="deviceDetails">
                  <div className="deviceDetailRow">
                    <span className="detailLabel">Line:</span>
                    <span className="detailValue">{device.line}</span>
                  </div>
                  <div className="deviceDetailRow">
                    <span className="detailLabel">Battery:</span>
                    <span
                      className={`detailValue ${device.lowBattery ? "lowBattery" : ""}`}
                    >
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
