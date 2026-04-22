import React, { useState, useEffect } from 'react';

// ===== CONFIGURATION =====
// Android controller's USB tethering IP — serves MJPEG screen mirror on port 8081
const DEFAULT_STREAM_URL = 'http://192.168.42.129:8081/';
// Foxglove point cloud viewer — runs on the drone's companion computer
const DEFAULT_FOXGLOVE_URL = 'http://192.168.144.50:8080/?ds=rosbridge-websocket&ds.url=ws%3A%2F%2F192.168.144.50%3A9090';
// ==========================

function StreamPanel() {
  const [url, setUrl] = useState(DEFAULT_STREAM_URL);
  const [activeUrl, setActiveUrl] = useState('');
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    setActiveUrl(url);
    setConnected(true);
  };

  const handleDisconnect = () => {
    setActiveUrl('');
    setConnected(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-dark-card border-b border-dark-border">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-500'}`} />
        <span className="text-sm font-bold text-accent">Video Mirror</span>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 bg-dark-bg border border-dark-border rounded px-2 py-1 text-xs text-gray-300 focus:border-accent focus:outline-none"
          placeholder="http://<controller-ip>:8081/stream"
        />
        {!connected ? (
          <button
            onClick={handleConnect}
            className="px-3 py-1 bg-green-700 border border-green-600 rounded text-xs text-white hover:bg-green-600 transition"
          >
            Connect
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="px-3 py-1 bg-red-700 border border-red-600 rounded text-xs text-white hover:bg-red-600 transition"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Video */}
      <div className="flex-1 bg-black flex items-center justify-center">
        {activeUrl ? (
          <img
            src={activeUrl}
            alt="Drone Screen"
            className="max-w-full max-h-full object-contain"
            onError={() => {
              setConnected(false);
            }}
          />
        ) : (
          <div className="text-center text-gray-600">
            <p className="text-lg mb-2">No Stream</p>
            <p className="text-xs">Press "Start Stream" on the controller first</p>
            <p className="text-xs mt-1">Then click "Connect" above</p>
          </div>
        )}
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

function SettingsBar({ split, onSplitChange, layout, onLayoutChange }) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-dark-card border-b border-dark-border">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Layout:</span>
        {['side', 'stack', 'video', 'cloud'].map((l) => (
          <button
            key={l}
            onClick={() => onLayoutChange(l)}
            className={`px-2 py-1 rounded text-xs ${layout === l ? 'bg-accent text-black' : 'bg-dark-hover text-gray-300'}`}
          >
            {l === 'side' ? 'Side by Side' : l === 'stack' ? 'Stacked' : l === 'video' ? 'Video Only' : 'Cloud Only'}
          </button>
        ))}
      </div>

      {(layout === 'side' || layout === 'stack') && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Split:</span>
          <input
            type="range" min="20" max="80" value={split}
            onChange={(e) => onSplitChange(Number(e.target.value))}
            className="w-32 accent-accent"
          />
          <span className="text-xs text-gray-500">{split}%</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [split, setSplit] = useState(50);
  const [layout, setLayout] = useState('side');

  const showVideo = layout !== 'cloud';
  const showCloud = layout !== 'video';
  const isStacked = layout === 'stack';

  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      {/* Title */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-card border-b border-dark-border">
        <h1 className="text-lg font-bold text-accent">Drone Viewer</h1>
        <span className="text-xs text-gray-500">Video Mirror + Point Cloud</span>
      </div>

      {/* Settings bar */}
      <SettingsBar split={split} onSplitChange={setSplit} layout={layout} onLayoutChange={setLayout} />

      {/* Content */}
      <div className={`flex-1 flex ${isStacked ? 'flex-col' : 'flex-row'} overflow-hidden`}>
        {showVideo && (
          <div
            style={{
              [isStacked ? 'height' : 'width']:
                !showCloud ? '100%' : `${split}%`,
            }}
            className="flex flex-col border-r border-dark-border"
          >
            <StreamPanel />
          </div>
        )}

        {showCloud && (
          <div
            style={{
              [isStacked ? 'height' : 'width']:
                !showVideo ? '100%' : `${100 - split}%`,
            }}
            className="flex flex-col"
          >
            <FoxglovePanel />
          </div>
        )}
      </div>
    </div>
  );
}
