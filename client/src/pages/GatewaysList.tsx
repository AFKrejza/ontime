import { useState, useEffect } from "react";
import { authFetch, getUserGateways } from "../api";
// @ts-ignore
import DotsMenu from "../assets/dots.png";
// @ts-ignore
import viewIcon from "../assets/view.png";
// @ts-ignore
import closedViewIcon from "../assets/closedView.png";
// @ts-ignore
import copyIcon from "../assets/copy.png";
// @ts-ignore
import gatewayIcon from "../assets/gateway.png";
// @ts-ignore
import towerIcon from "../assets/tower.png";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import getBatteryIcon from "../components/batteryLevel";
import SettingsButton from "../components/SettingsButton";
import ModalWindow from "../components/ModalWindow";
interface Tower {
  towerName: string;
  towerId: string;
  battery: number;
}
interface GatewayStatus {
  gatewayId: string;
  gatewayName: string;
  gatewaySecret: string;
  towers: Tower[];
}
export default function GatewaysList() {
  const [gateways, setGateways] = useState<GatewayStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeMenuGwId, setActiveMenuGwId] = useState<string | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>(
    {},
  );
  const [activeModal, setActiveModal] = useState<{
    type: "regenerate" | "rename" | "delete";
    id: string;
    name?: string;
    onConfirmAction: (inputValue: string) => void | Promise<void>;
  } | null>(null);

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

  const handleRenameGateway = async (gatewayId: string, newName: string) => {
    setActiveMenuGwId(null);
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

  const handleRenameTower = async (towerId: string, newName: string) => {
    setActiveMenuGwId(null);
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

  const handleDeleteGateway = async (gatewayId: string) => {
    setActiveMenuGwId(null);
    try {
      await authFetch(`/gateways/${gatewayId}`, {
        method: "DELETE",
      });
      setGateways((prev) => prev.filter((g) => g.gatewayId !== gatewayId));
    } catch (err) {
      alert("Failed to delete gateway");
    }
  };

  const handleDeleteTower = async (towerId: string) => {
    setActiveMenuGwId(null);
    try {
      await authFetch(`/towers/${towerId}`, {
        method: "DELETE",
      });
      setGateways((prev) =>
        prev.map((gw) => ({
          ...gw,
          towers: gw.towers.filter((t) => t.towerId !== towerId),
        })),
      );
    } catch (err) {
      alert("Failed to delete tower");
    }
  };

  const handleToggleSecretVisibility = (gatewayId: string) => {
    setVisibleSecrets((prev) => ({
      ...prev,
      [gatewayId]: !prev[gatewayId],
    }));
  };

  const handleCopySecret = (secret: string) => {
    if (!secret) {
      alert("No secret available to copy!");
      return;
    }
    navigator.clipboard.writeText(secret);
  };

  const handleGenerateSecret = async (gatewayId: string) => {
    try {
      const res = await authFetch(`/gateways/${gatewayId}/generateSecret`, {
        method: "POST",
      });
      const updatedGate = await res.json();
      setGateways((prev) =>
        prev.map((g) =>
          g.gatewayId === gatewayId
            ? { ...g, gatewaySecret: updatedGate.hmac_secret }
            : g,
        ),
      );
      setVisibleSecrets((prev) => ({ ...prev, [gatewayId]: true }));
    } catch (err) {
      alert("Failed to generate new secret");
    }
  };

  // Catch Clicks
  const handleGenerateClick = (gatewayId: string) => {
    setActiveModal({
      type: "regenerate",
      id: gatewayId,
      onConfirmAction: () => handleGenerateSecret(gatewayId),
    });
  };
  const handleDeleteTowerClick = (towerId: string, towerName: string) => {
    setActiveModal({
      type: "delete",
      id: towerId,
      name: towerName,
      onConfirmAction: () => handleDeleteTower(towerId),
    });
  };
  const handleDeleteGatewayClick = (gatewayId: string, gatewayName: string) => {
    setActiveModal({
      type: "delete",
      id: gatewayId,
      name: gatewayName,
      onConfirmAction: () => handleDeleteGateway(gatewayId),
    });
  };
  const handleRenameGatewayClick = (gatewayId: string, oldName: string) => {
    setActiveModal({
      type: "rename",
      id: gatewayId,
      name: oldName,
      onConfirmAction: (inputValue) =>
        handleRenameGateway(gatewayId, inputValue),
    });
  };
  const handleRenameTowerClick = (towerId: string, oldName: string) => {
    setActiveModal({
      type: "rename",
      id: towerId,
      name: oldName,
      onConfirmAction: (inputValue) => handleRenameTower(towerId, inputValue),
    });
  };

  if (loading) {
    return (
      <div className="loadingContainer">
        <div className="loadingSpinner"></div>
        <p className="loadingText">Loading data, please wait...</p>
      </div>
    );
  }
  return (
    <div>
      <BackButton toPage="/device-connect" />
      <SettingsButton toPage="/settings" />
      {activeModal && (
        <ModalWindow
          title={
            activeModal.type === "regenerate"
              ? "Regenerate Secret Key?"
              : activeModal.type === "delete"
                ? `Delete ${activeModal.name}`
                : `Rename ${activeModal.name}`
          }
          description={
            activeModal.type === "regenerate"
              ? "Regenerating the secret will immediately disconnect this gateway from Node-RED and all connected towers. You will need to re-configure your hardware dongle manually."
              : activeModal.type === "delete"
                ? `You will permanently delete ${activeModal.name}. To confirm, type 'delete' below.`
                : "Enter new name below."
          }
          confirmBtnText={
            activeModal.type === "delete"
              ? "Delete permanently"
              : activeModal.type === "rename"
                ? "Save Name"
                : "Yes, Regenerate"
          }
          textInput={activeModal.type !== "regenerate"}
          requiredConfirmWord={
            activeModal.type === "delete" ? "delete" : undefined
          }
          onCancel={() => setActiveModal(null)}
          onConfirm={async (inputValue) => {
            await activeModal.onConfirmAction(inputValue);
            setActiveModal(null);
          }}
        />
      )}
      <h2 className="gatewayPageHeader">My Gateways</h2>
      {gateways.length === 0 ? (
        <p className="noGates">You have not active gateways</p>
      ) : (
        <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
          {gateways.map((gw) => {
            const isSecretVisible = !!visibleSecrets[gw.gatewayId];
            return (
              <div key={gw.gatewayId} className="gatewayCard">
                <div className="gatewayHeader">
                  <div className="gatewayTitleArea">
                    <img
                      src={gatewayIcon}
                      width={24}
                      height={24}
                      alt="Gateway"
                    ></img>
                    <span className="gatewayName">{gw.gatewayName}</span>
                  </div>
                  <div className="gatewayId">Gateway ID: {gw.gatewayId}</div>
                  <div className="secretSection">
                    <div className="gatewaySecret">
                      Gateway Secret:{" "}
                      <strong className="showSecret">
                        {isSecretVisible
                          ? gw.gatewaySecret || "No secret generated yet"
                          : "••••••••••••••••"}
                      </strong>
                    </div>

                    <div className="secretActionsContainer">
                      <button
                        className="secretRoundBtn"
                        onClick={() =>
                          handleToggleSecretVisibility(gw.gatewayId)
                        }
                        title={isSecretVisible ? "Hide Secret" : "View Secret"}
                      >
                        <img
                          src={isSecretVisible ? closedViewIcon : viewIcon}
                          width={16}
                          height={16}
                          alt="toggle visibility"
                          style={{ display: "block" }}
                        />
                      </button>

                      <button
                        className="secretRoundBtn"
                        onClick={() => handleCopySecret(gw.gatewaySecret)}
                        disabled={!gw.gatewaySecret}
                        title="Copy Secret"
                      >
                        <img
                          src={copyIcon}
                          width={14}
                          height={14}
                          alt="Copy"
                          style={{ display: "block" }}
                        ></img>
                      </button>

                      <button
                        className="regenerateSecretBtn"
                        onClick={() => handleGenerateClick(gw.gatewayId)}
                        title="Regenerate Secret"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#fff0f0";
                          e.currentTarget.style.borderColor = "#f56565";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#fff5f5";
                          e.currentTarget.style.borderColor = "#feb2b2";
                        }}
                      >
                        Regenerate Secret
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="towerContainer">
                    <h4 className="towerHeader">Connected Towers:</h4>
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <button
                        className="menuButton"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuGwId(
                            activeMenuGwId === gw.gatewayId
                              ? null
                              : gw.gatewayId,
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
                                handleRenameGatewayClick(
                                  gw.gatewayId,
                                  gw.gatewayName,
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
                              ✏️ Rename Gateway
                            </button>

                            {gw.towers.map((tower) => (
                              <button
                                key={`rename-${tower.towerId}`}
                                onClick={() =>
                                  handleRenameTowerClick(
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
                                ✏️ Rename "{tower.towerName}"
                              </button>
                            ))}
                            <div className="divider" />

                            {gw.towers.map((tower) => (
                              <button
                                key={`delete-${tower.towerId}`}
                                onClick={() =>
                                  handleDeleteTowerClick(
                                    tower.towerId,
                                    tower.towerName,
                                  )
                                }
                                className="dropdownItemStyle"
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = "#d7abab")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "transparent")
                                }
                              >
                                🗑️ Delete "{tower.towerName}"
                              </button>
                            ))}

                            <button
                              onClick={() =>
                                handleDeleteGatewayClick(
                                  gw.gatewayId,
                                  gw.gatewayName,
                                )
                              }
                              className="dropdownItemStyle"
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#d7abab")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
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
                          onClick={() =>
                            navigate(`/dashboard/${tower.towerId}`)
                          }
                          className="towerCard"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#e2e8f0";
                            e.currentTarget.style.transform =
                              "translateY(-4px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#f0f4f8";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          <div className="gatewayTitleArea">
                            <img
                              src={towerIcon}
                              width={22}
                              height={22}
                              alt="Tower"
                            ></img>
                            <div className="towerName">{tower.towerName}</div>
                          </div>
                          <div className="towerBattery">
                            {getBatteryIcon(tower.battery, 22, 22)}
                            Battery: {tower.battery}%
                          </div>
                          <div className="towerId">ID: {tower.towerId}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
