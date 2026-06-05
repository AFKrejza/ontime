import { useEffect, useMemo, useState } from "react";
import {
  addAssignment,
  getAllStops,
  getStopDetails,
  Line,
  StopDetails,
  StopSummary,
  getUserGateways,
  authFetch,
} from "../api";
import { getTowerConfigs, saveTowerConfig } from "../towerStorage";
import type { TowerConfig } from "../towerStorage";
import BackButton from "../components/BackButton";
import SettingsButton from "../components/SettingsButton";
function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function uniqueTypes(details: StopDetails | null): string[] {
  if (!details) return [];
  return Object.keys(details.lines).filter(
    (type) => details.lines[type]?.length > 0,
  );
}

export default function TowerConfig() {
  const [stops, setStops] = useState<StopSummary[]>([]);
  const [query, setQuery] = useState("");
  const [selectedStop, setSelectedStop] = useState<StopSummary | null>(null);
  const [stopDetails, setStopDetails] = useState<StopDetails | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [walkingOffset, setWalkingOffset] = useState(5);
  const [loading, setLoading] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<TowerConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [loadingSavedConfig, setLoadingSavedConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [availableTowers, setAvailableTowers] = useState<
    { id: string; name: string; gatewayName: string; assignments: any[] }[]
  >([]);
  const [selectedTowerId, setSelectedTowerId] = useState<string>("");

  async function loadStops() {
    try {
      setLoading(true);
      const data = await getAllStops();
      setStops(data);

      const gateways = await getUserGateways();
      const allGatewaysStatus = await Promise.all(
        gateways.map(async (gw: any) => {
          try {
            const res = await authFetch(`/gateways/${gw.id}/status`);
            return await res.json();
          } catch (e) {
            console.error(
              `Unabled to load status for gateway: ${gw.gatewayId}`,
              e,
            );
            return null;
          }
        }),
      );
      console.log(allGatewaysStatus);
      const towers = allGatewaysStatus
        .filter((status) => status !== null)
        .flatMap((status: any) =>
          (status.towers || []).map((t: any) => ({
            id: t.towerId,
            name: t.towerName,
            gatewayName: status.gatewayName || "Unknown Gateway",
            assignments: t.assignments || [],
          })),
        );
      setAvailableTowers(towers);
      if (towers.length > 0) setSelectedTowerId(towers[0].id);
    } catch (err) {
      console.error(err);
      setError("Unable to load stop list from backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStops();
    setSavedConfigs(getTowerConfigs());
  }, []);

  const filteredStops = useMemo(() => {
    if (!query.trim()) return [];
    const normalizedQuery = normalize(query);
    return stops
      .filter((stop) => normalize(stop.name).includes(normalizedQuery))
      .slice(0, 20);
  }, [stops, query]);

  const handleSelectStop = async (stop: StopSummary) => {
    setSelectedStop(stop);
    setQuery(stop.name);
    setError(null);
    setSuccessMessage(null);
    setStopDetails(null);
    setSelectedType("");
    setSelectedLine(null);

    try {
      setLoading(true);
      const details = await getStopDetails(stop.slug);
      setStopDetails(details);
      const types = uniqueTypes(details);
      const firstType = types[0] || "bus";
      setSelectedType(firstType);
      const firstLines = details.lines[firstType] || [];
      setSelectedLine(firstLines[0] || null);
    } catch (err) {
      console.error(err);
      setError("Unable to load stop details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSavedConfig = async (config: TowerConfig) => {
    setSelectedConfigId(config.id);
    setQuery(config.stopName);
    setSelectedStop({
      id: config.stopId,
      name: config.stopName,
      slug: config.slug,
    });
    setSelectedType(config.line.type);
    setSelectedLine(config.line);
    setWalkingOffset(config.offset);
    setLoadingSavedConfig(true);

    try {
      const details = await getStopDetails(config.stopId);
      setStopDetails(details);
    } catch (error) {
      console.error("Failed to load saved tower stop details:", error);
    } finally {
      setLoadingSavedConfig(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStop || !selectedLine || !selectedTowerId) {
      setError("Please select a stop, line and a device to continue.");
      return;
    }
    console.log(availableTowers);
    try {
      setError(null);
      setSuccessMessage(null);
      setLoading(true);
      await addAssignment(selectedTowerId, {
        offset: walkingOffset,
        stopName: selectedStop.name,
        stopId: selectedStop.id,
        line: selectedLine,
      });
      const currentTower = availableTowers.find(
        (t) => String(t.id) === String(selectedTowerId),
      );
      const saved = saveTowerConfig({
        id: selectedConfigId || undefined,
        stopSlug: selectedStop.slug,
        towerId: selectedTowerId,
        gatewayName: currentTower?.gatewayName,
        stopName: selectedStop.name,
        stopId: selectedStop.id,
        line: selectedLine,
        offset: walkingOffset,
        slug: selectedStop.slug,
      });
      setSavedConfigs(getTowerConfigs());
      await loadStops();
      setSuccessMessage("Assignment was created successfully.");

      setTimeout(() => {
        setSuccessMessage(null);
        setSelectedConfigId(null);
        setSelectedStop(null);
        setStopDetails(null);
        setQuery("");
      }, 4000);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(
          `⚠️ Maximum limit reached: You can only assign up to 2 stops to a single Tower.`,
        );
      } else {
        setError(
          "⚠️ Maximum limit reached: You can only assign up to 2 stops to a single Tower.",
        );
      }
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <BackButton />
      <SettingsButton toPage="/settings" />
      <header className="header">
        <div>
          <h1>Tower Configuration</h1>
          <p>Search a stop, choose a line, and create your assignment.</p>
        </div>
      </header>

      <section className="card">
        <h2>Select Device</h2>
        {availableTowers.length === 0 ? (
          <p className="status">No devices found</p>
        ) : (
          <div className="towerGrid">
            {availableTowers.map((tower) => {
              const count = tower.assignments ? tower.assignments.length : 0;
              const isFull = count >= 2;
              const isSelected = tower.id === selectedTowerId;
              let cardClass = "towerCard";
              if (isSelected) cardClass += " selected";
              if (isFull && !isSelected) cardClass += " full";

              return (
                <div
                  key={tower.id}
                  className={cardClass}
                  onClick={() => {
                    if (!isFull || tower.id === selectedConfigId) {
                      setSelectedTowerId(tower.id);
                    }
                  }}
                >
                  <div className="towerCardHeader">
                    <div className="towerInfo">
                      <h3>{`${tower.name} (${tower.id})`}</h3>
                      <span className="gatewayBadge">{tower.gatewayName}</span>
                    </div>
                    <div className="slotIndicator">
                      <span
                        className={`slotDot ${count >= 1 ? "active" : ""}`}
                      ></span>
                      <span
                        className={`slotDot ${count >= 2 ? "active" : ""}`}
                      ></span>
                      <span className="slotText">{count}/2</span>
                    </div>
                  </div>
                  {count > 0 && (
                    <div className="towerAssignmentsList">
                      <div className="assignmentsTitle">
                        Active assignments:
                      </div>
                      {tower.assignments.map((asm: any) => (
                        <div
                          key={asm.assignmentId}
                          className="towerAssignmentMiniItem"
                        >
                          <span
                            className="lineBadge"
                            data-type={asm.line?.type || "bus"}
                          >
                            {asm.line?.name}
                          </span>
                          <span className="stopMiniName">{asm.stop?.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {isFull && (
                    <div className="fullBadge">🔒 Max Limit Reached</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <main className="content">
        {savedConfigs.length > 0 && (
          <section className="card">
            <h2>Saved Assignments</h2>
            <div className="savedTowerList">
              {savedConfigs.map((config) => (
                <button
                  key={config.id}
                  className={
                    config.id === selectedConfigId
                      ? "savedTowerItem selected"
                      : "savedTowerItem"
                  }
                  onClick={() => handleSelectSavedConfig(config)}
                >
                  <div className="savedTowerTitle">
                    {config.stopName} · {config.line.name}
                  </div>
                  <div className="savedTowerMeta">
                    {config.line.type} • {config.offset} mins
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="card">
          <h2>Stop autocomplete</h2>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for a stop..."
            className="textInput"
          />
          {loading && <p className="status">Loading...</p>}
          {!loading && filteredStops.length > 0 && (
            <ul className="resultList">
              {filteredStops.map((stop) => (
                <li key={stop.id}>
                  <button
                    className="linkButton"
                    onClick={() => handleSelectStop(stop)}
                  >
                    {stop.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {selectedStop && (
          <section className="card">
            <h2>Selected stop</h2>
            <p>
              <strong>{selectedStop.name}</strong> ({selectedStop.id})
            </p>

            {stopDetails ? (
              <>
                <div className="typeSelector">
                  {uniqueTypes(stopDetails).map((type) => (
                    <button
                      key={type}
                      className={
                        type === selectedType ? "pill selected" : "pill"
                      }
                      onClick={() => {
                        setSelectedType(type);
                        const lines = stopDetails.lines[type] || [];
                        setSelectedLine(lines[0] || null);
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {selectedType && (
                  <div className="lineGrid">
                    {(stopDetails.lines[selectedType] || []).map(
                      (line, index) => (
                        <button
                          key={`${line.type}-${line.name}-${index}`}
                          className={
                            selectedLine?.id === line.id
                              ? "lineCard selected"
                              : "lineCard"
                          }
                          onClick={() => setSelectedLine(line)}
                        >
                          <div>{line.name}</div>
                          <div className="lineMeta">{line.direction}</div>
                        </button>
                      ),
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="status">Loading stop details…</p>
            )}

            <div className="formRow">
              <label>
                Walking offset (minutes)
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={walkingOffset}
                  onChange={(event) =>
                    setWalkingOffset(Number(event.target.value))
                  }
                />
              </label>
            </div>

            <button
              className="primaryButton"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating assignment…" : "Create assignment"}
            </button>
            {(error || successMessage) && (
              <section className="card statusCard">
                {error && <p className="error">{error}</p>}
                {successMessage && <p className="success">{successMessage}</p>}
              </section>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
