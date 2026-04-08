import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DeviceConnect() {
  const [deviceCode, setDeviceCode] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleConnect = async () => {
    if (!deviceCode.trim()) {
      setError('Please enter a device code.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');

      // TODO: Replace with actual device connection API call
      console.log('Connecting to device with code:', deviceCode);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSuccessMessage(`Connected to device ${deviceCode}!`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to device.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Connect Device</h1>
          <p>Enter your device code to connect and start monitoring.</p>
        </div>
      </header>

      <main className="content">
        <section className="card">
          <h2>Step 3 of 4</h2>
          <div className="formRow">
            <label>
              Device Code
              <input
                type="text"
                value={deviceCode}
                onChange={(event) => setDeviceCode(event.target.value)}
                placeholder="Enter your 6-12 character device code"
                className="textInput"
              />
            </label>
          </div>
          <p className="helperText">
            You can find your device code on the back of your OnTime device or in the device settings.
          </p>
          {error && <p className="error">{error}</p>}
          {successMessage && <p className="success">{successMessage}</p>}
          <div className="buttonGroup">
            <button 
              className="primaryButton" 
              onClick={handleConnect} 
              disabled={isLoading}
            >
              {isLoading ? 'Connecting…' : 'Connect Device'}
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
      </main>
    </div>
  );
}
