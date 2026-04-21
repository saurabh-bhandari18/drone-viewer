import React, { useState, useEffect } from 'react';

const DEFAULT_FOXGLOVE_URL = 'http://192.168.144.50:8080/?ds=rosbridge-websocket&ds.url=ws%3A%2F%2F192.168.144.50%3A9090';

function ScrcpyPanel() {
  const [running, setRunning] = useState(false);
  const [scrcpyPath, setScrcpyPath] = useState('scrcpy');
  const [size, setSize] = useState('960x540');
  const [bitrate, setBitrate] = useState(8);
  const [maxFps, setMaxFps] = useState(30);
  const [noControl, setNoControl] = useState(false);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);
  const [borderless, setBorderless] = useState(false);
  const [status, setStatus] = useState('Ready');

  // Poll status
  useEffect(() => {
    const interval = setInterval(async () => {
      if (window.scrcpy) {
        const s = await window.scrcpy.status();
        if (!s.running && running) {
          setRunning(false);
          setStatus('Disconnected');
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [running]);

  const handleStart = async () => {
    if (!window.scrcpy) return;
    const [w, h] = size === 'auto' ? [0, 0] : size.split('x').map(Number);
    const result = await window.scrcpy.start({
      path: scrcpyPath,
      width: w || undefined,
      height: h || undefined,
      bitrate,
      maxFps,
      noControl,
      alwaysOnTop,
      borderless,
    });
    if (result.success) {
      setRunning(true);
      setStatus(`Mirroring (PID: ${result.pid})`);
    } else {
      setStatus(`Error: ${result.message}`);
    }
  };

  const handleStop = async () => {
    if (!window.scrcpy) return;
    await window.scrcpy.stop();
    setRunning(false);
    setStatus('Stopped');
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <h2 className="text-accent font-bold text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        Video Mirror (scrcpy)
      </h2>

      {/* Path */}
      <div>
        <label className="text-xs text-gray-400">scrcpy path</label>
        <input
          type="text"
          value={scrcpyPath}
          onChange={(e) => setScrcpyPath(e.target.value)}
          className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm text-white focus:border-accent focus:outline-none"
        />
      </div>

      {/* Size */}
      <div>
        <label className="text-xs text-gray-400">Window size</label>
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm text-white"
        >
          <option value="auto">Auto</option>
          <option value="1920x1080">1920x1080</option>
          <option value="1280x720">1280x720</option>
          <option value="960x540">960x540</option>
          <option value="640x360">640x360</option>
        </select>
      </div>

      {/* Bitrate */}
      <div>
        <label className="text-xs text-gray-400">Bitrate: {bitrate} Mbps</label>
        <input
          type="range" min="1" max="20" value={bitrate}
          onChange={(e) => setBitrate(Number(e.target.value))}
          className="w-full accent-accent"
        />
      </div>

      {/* FPS */}
      <div>
        <label className="text-xs text-gray-400">Max FPS: {maxFps}</label>
        <input
          type="range" min="10" max="60" value={maxFps}
          onChange={(e) => setMaxFps(Number(e.target.value))}
          className="w-full accent-accent"
        />
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-300">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={noControl} onChange={(e) => setNoControl(e.target.checked)} />
          View only
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={alwaysOnTop} onChange={(e) => setAlwaysOnTop(e.target.checked)} />
          Always on top
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={borderless} onChange={(e) => setBorderless(e.target.checked)} />
          Borderless
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleStart}
          disabled={running}
          className="flex-1 py-2 rounded font-bold text-white bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 transition"
        >
          Start Mirror
        </button>
        <button
          onClick={handleStop}
          disabled={!running}
          className="flex-1 py-2 rounded font-bold text-white bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 transition"
        >
          Stop Mirror
        </button>
      </div>

      {/* Status */}
      <div className={`text-xs ${running ? 'text-green-400' : 'text-gray-500'}`}>
        {status}
      </div>
    </div>
  );
}

function FoxglovePanel() {
  const [url, setUrl] = useState(DEFAULT_FOXGLOVE_URL);
  const [activeUrl, setActiveUrl] = useState(DEFAULT_FOXGLOVE_URL);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-dark-card border-b border-dark-border">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        <span className="text-sm font-bold text-accent">Point Cloud (Foxglove)</span>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 bg-dark-bg border border-dark-border rounded px-2 py-1 text-xs text-gray-300 focus:border-accent focus:outline-none"
        />
        <button
          onClick={() => setActiveUrl(url)}
          className="px-3 py-1 bg-dark-hover border border-dark-border rounded text-xs text-accent hover:bg-dark-border transition"
        >
          Load
        </button>
        <button
          onClick={() => setActiveUrl('')}
          className="px-3 py-1 bg-dark-hover border border-dark-border rounded text-xs text-gray-400 hover:bg-dark-border transition"
        >
          Clear
        </button>
      </div>

      {/* Web view */}
      <div className="flex-1 bg-black">
        {activeUrl ? (
          <webview
            src={activeUrl}
            className="w-full h-full"
            allowpopups="true"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600">
            Enter Foxglove URL and click Load
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="flex h-screen bg-dark-bg">
      {/* Left — scrcpy controls */}
      <div className="w-72 border-r border-dark-border bg-dark-card overflow-y-auto flex-shrink-0">
        <div className="px-4 py-3 border-b border-dark-border">
          <h1 className="text-lg font-bold text-accent">Drone Viewer</h1>
          <p className="text-xs text-gray-500">Video Mirror + Point Cloud</p>
        </div>
        <ScrcpyPanel />
      </div>

      {/* Right — Foxglove */}
      <div className="flex-1 flex flex-col">
        <FoxglovePanel />
      </div>
    </div>
  );
}
