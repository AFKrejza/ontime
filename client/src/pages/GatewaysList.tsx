import { useState, useEffect } from "react";
import { authFetch, getUserGateways } from "../api";
// @ts-ignore
import DotsMenu from "../assets/dots.png";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
interface Tower {
  towerName: string;
  towerId: string;
  battery: number;
}
interface GatewayStatus {
  gatewayId: string;
  gatewayName: string;
  towers: Tower[];
}
export default function GatewaysList() {
  const [gateways, setGateways] = useState<GatewayStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeMenuGwId, setActiveMenuGwId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const userGateways = await getUserGateways();

        const FullData: GatewayStatus[] = await Promise.all(
          userGateways.map(async (gw: any) => {
            const res = await authFetch(`/gateways/${gw.id}/status`);
            return res.json();
          }),
        );

        setGateways(FullData);
      } catch (e) {
        console.log("Unable to load Gateways from DB: ", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRenameGateway = async (gatewayId: string, oldName: string) => {
    setActiveMenuGwId(null);
    const newName = window.prompt("Enter new name for this gateway: ", oldName);
    if (!newName || newName.trim() === "") return;

    try {
      await authFetch(`/gateways/${gatewayId}/rename`, {
        method: "PATCH",
        body: JSON.stringify({ name: newName }),
      });
      setGateways((prev) =>
        prev.map((g) =>
          g.gatewayId === gatewayId ? { ...g, gatewayName: newName.trim() } : g,
        ),
      );
    } catch (err) {
      alert("Failed to rename Tower");
    }
  };

  const handleRenameTower = async (towerId: string, oldName: string) => {
    setActiveMenuGwId(null);
    const newName = window.prompt("Enter new name for this tower: ", oldName);
    if (!newName || newName.trim() === "") return;

    try {
      await authFetch(`/towers/${towerId}`, {
        method: "PATCH",
        body: JSON.stringify({ name: newName }),
      });
      setGateways((prev) =>
        prev.map((g) => ({
          ...g,
          towers: g.towers.map((t) =>
            t.towerId === towerId ? { ...t, towerName: newName.trim() } : t,
          ),
        })),
      );
    } catch (err) {
      alert("Failed rename Tower");
    }
  };

  const handleDeleteGateway = async (
    gatewayId: string,
    gatewayName: string,
  ) => {
    setActiveMenuGwId(null);
    const userCode = window.prompt(
      `To delete gateway "${gatewayName}" and ALL its towers, enter 'delete'`,
    );
    if (userCode?.toLocaleLowerCase() !== "delete") {
      alert("Incorrect code! Deletion canceled.");
      return;
    }

    try {
      await authFetch(`/gateways/${gatewayId}`, {
        method: "DELETE",
      });
      setGateways((prev) => prev.filter((g) => g.gatewayId !== gatewayId));
    } catch (err) {
      alert("Failed to delete gateway");
    }
  };

  if (loading) return <div>Loading your gateways</div>;

  return (
    <div>
      <BackButton toPage="/device-connect" />
      <h2 className="gatewayPageHeader">My Gateways</h2>
      {gateways.length === 0 ? (
        <p>You have not active gateways</p>
      ) : (
        <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
          {gateways.map((gw) => (
            <div key={gw.gatewayId} className="gatewayCard">
              <div className="gatewayHeader">
                <span className="gatewayName">📟 {gw.gatewayName}</span>
                <div className="gatewayId">Gateway ID: {gw.gatewayId}</div>
              </div>

              <div>
                <div className="towerContainer">
                  <h4 className="towerHeader">Connected Towers:</h4>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <button
                      className="deleteButton"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuGwId(
                          activeMenuGwId === gw.gatewayId ? null : gw.gatewayId,
                        );
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <img src={DotsMenu} alt="Menu" className="menuIcon" />
                    </button>
                    {activeMenuGwId === gw.gatewayId && (
                      <>
                        <div
                          style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 99,
                          }}
                          onClick={() => setActiveMenuGwId(null)}
                        />
                        <div className="dotsMenu">
                          <button
                            onClick={() =>
                              handleRenameGateway(gw.gatewayId, gw.gatewayName)
                            }
                            className="dropdownItemStyle"
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#e9f4ff")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            ✏️ Rename Gateway
                          </button>

                          {gw.towers.map((tower) => (
                            <button
                              key={`rename-${tower.towerId}`}
                              onClick={() =>
                                handleRenameTower(
                                  tower.towerId,
                                  tower.towerName,
                                )
                              }
                              className="dropdownItemStyle"
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#e9f4ff")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
                              }
                            >
                              🗼 Rename "{tower.towerName}"
                            </button>
                          ))}
                          <div className="divider" />
                          <button
                            onClick={() =>
                              handleDeleteGateway(gw.gatewayId, gw.gatewayName)
                            }
                            className="dropdownItemStyle"
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#d7abab")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            🗑️ Delete Gateway
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {gw.towers.length === 0 ? (
                  <p style={{ color: "#aaa", fontSize: "14px" }}>
                    No active towers.
                  </p>
                ) : (
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
                  >
                    {gw.towers.map((tower) => (
                      <div
                        key={tower.towerId}
                        onClick={() => navigate(`/dashboard/${tower.towerId}`)}
                        className="towerCard"
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#e2e8f0")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#f0f4f8")
                        }
                      >
                        <div className="towerName">🗼 {tower.towerName}</div>
                        <div className="towerBattery">
                          🔋 Battery: {tower.battery}%
                        </div>
                        <div className="towerId">ID: {tower.towerId}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
