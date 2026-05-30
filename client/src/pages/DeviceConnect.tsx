import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerGateway } from "../api";

export default function DeviceConnect() {
  const [deviceCode, setDeviceCode] = useState("");
  const [deviceName, setDeviceName] = useState("My Gateway");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleConnect = async () => {
    if (!deviceCode.trim()) {
      setError("Please enter a device code.");
      return;
    }
    try {
      setIsLoading(true);
      setError("");
      setSuccessMessage("");

      await registerGateway({ gatewayId: deviceCode, gatewayName: deviceName });

      setSuccessMessage(
        `✓ Registered gateway ${deviceName} with id:${String(deviceCode).toLocaleLowerCase()}`,
      );

      setTimeout(() => {
        navigate("/gateways");
      }, 4000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to device.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/gateways");
  };

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Connect Your Device</h1>
          <p>Link your gateway to start monitoring transport lines.</p>
        </div>
      </header>

      <main className="content">
        <section className="card deviceConnectCard">
          <h2>Device Pairing</h2>
          <p className="stepInfo">Step 3 of 4</p>

          <div className="instructionBox">
            <h3>How to find your device code:</h3>
            <ol className="instructionList">
              <li>Check your gateway dongle ID in Node-Red</li>
              <li>Find the 12 character alphanumeric code</li>
              <li>Enter it below to pair with your account</li>
            </ol>
          </div>

          <div className="formRow">
            <label>
              Give your gateway a name
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g., Living Room"
                className="textInput deviceCodeInput"
              />
            </label>
          </div>

          <div className="formRow">
            <label>
              Device Code
              <input
                type="text"
                value={deviceCode}
                onChange={(event) => setDeviceCode(event.target.value)}
                placeholder="e.g., ABC123XYZ789"
                className="textInput deviceCodeInput"
              />
            </label>
          </div>

          {error && <p className="error">{error}</p>}
          {successMessage && <p className="success">{successMessage}</p>}

          <div className="buttonGroup">
            <button
              className="primaryButton"
              onClick={handleConnect}
              disabled={isLoading}
            >
              {isLoading ? "⏳ Connecting…" : "🔗 Connect Device"}
            </button>
            <button
              className="secondaryButton"
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip for Now
            </button>
          </div>
        </section>

        <section className="card infoCard">
          <h3>Don't have a gateway yet?</h3>
          <p>
            You can still use OnTime to configure and manage your settings.
            You'll be able to connect a gateway later.
          </p>
        </section>
      </main>
    </div>
  );
}
