import React, { useState } from 'react';

// ===== CONFIGURATION =====
const DEFAULT_STREAM_URL = 'http://192.168.42.129:8081/';

// Set to true for local testing, false for production
const LOCAL_MODE = true;

const HOST = LOCAL_MODE ? 'localhost' : '192.168.144.50';
const FOXGLOVE_WIDE = `http://${HOST}:8080/?ds=rosbridge-websocket&ds.url=ws%3A%2F%2F${HOST}%3A9090`;
const FOXGLOVE_NARROW = `http://${HOST}:8082/?ds=rosbridge-websocket&ds.url=ws%3A%2F%2F${HOST}%3A9090`;

const NARROW_THRESHOLD = 40;
// ==========================

function StreamPanel() {
  const [url, setUrl] = useState(DEFAULT_STREAM_URL);
  const [activeUrl, setActiveUrl] = useState('');
  const [connected, setConnected] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 bg-dark-card border-b border-dark-border">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-500'}`} />
        <span className="text-sm font-bold text-accent">Video Mirror</span>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 bg-dark-bg border border-dark-border rounded px-2 py-1 text-xs text-gray-300 focus:border-accent focus:outline-none"
          placeholder="http://<controller-ip>:8081/"
        />
        {!connected ? (
          <button
            onClick={() => { setActiveUrl(url); setConnected(true); }}
            className="px-3 py-1 bg-green-700 border border-green-600 rounded text-xs text-white hover:bg-green-600 transition"
          >
            Connect
          </button>
        ) : (
          <button
            onClick={() => { setActiveUrl(''); setConnected(false); }}
            className="px-3 py-1 bg-red-700 border border-red-600 rounded text-xs text-white hover:bg-red-600 transition"
          >
            Disconnect
          </button>
        )}
      </div>
      <div className="flex-1 bg-black flex items-center justify-center">
        {activeUrl ? (
          <webview
            src={activeUrl}
            className="w-full h-full"
            style={{ background: '#000' }}
          />
        ) : (
          <div className="text-center text-gray-600">
            <p className="text-lg mb-2">No Stream</p>
            <p className="text-xs">Press "Start Mirror" on the controller</p>
            <p className="text-xs mt-1">Then click "Connect" above</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FoxglovePanel({ foxgloveSpace }) {
  const [loaded, setLoaded] = useState(false);
  const isNarrow = foxgloveSpace < NARROW_THRESHOLD;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 bg-dark-card border-b border-dark-border">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        <span className="text-sm font-bold text-accent">Point Cloud</span>
        <span className={`text-xs px-1.5 rounded ${
          isNarrow ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
        }`}>
          {isNarrow ? 'Compact' : 'Full'}
        </span>
        {!loaded ? (
          <button
            onClick={() => setLoaded(true)}
            className="ml-auto px-3 py-1 bg-dark-hover border border-dark-border rounded text-xs text-accent hover:bg-dark-border transition"
          >
            Load
          </button>
        ) : (
          <button
            onClick={() => setLoaded(false)}
            className="ml-auto px-3 py-1 bg-dark-hover border border-dark-border rounded text-xs text-gray-400 hover:bg-dark-border transition"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex-1 bg-black relative">
        {loaded ? (
          <>
            <webview
              src={FOXGLOVE_WIDE}
              className="absolute inset-0 w-full h-full"
              allowpopups="true"
              style={{ display: !isNarrow ? 'flex' : 'none' }}
            />
            <webview
              src={FOXGLOVE_NARROW}
              className="absolute inset-0 w-full h-full"
              allowpopups="true"
              style={{ display: isNarrow ? 'flex' : 'none' }}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600">
            Click "Load" to start point cloud viewer
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
            type="range" min="0" max="100" value={split}
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
  const foxgloveSpace = showVideo && showCloud ? (100 - split) : showCloud ? 100 : 0;

  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      <div className="flex items-center justify-between px-4 py-2 bg-dark-card border-b border-dark-border">
        <h1 className="text-lg font-bold text-accent">Drone Viewer</h1>
        <span className="text-xs text-gray-500">Video Mirror + Point Cloud</span>
      </div>

      <SettingsBar split={split} onSplitChange={setSplit} layout={layout} onLayoutChange={setLayout} />

      <div className={`flex-1 flex ${isStacked ? 'flex-col' : 'flex-row'} overflow-hidden`}>
        {showVideo && (
          <div
            style={{ [isStacked ? 'height' : 'width']: !showCloud ? '100%' : `${split}%` }}
            className="flex flex-col border-r border-dark-border"
          >
            <StreamPanel />
          </div>
        )}

        {showCloud && (
          <div
            style={{ [isStacked ? 'height' : 'width']: !showVideo ? '100%' : `${100 - split}%` }}
            className="flex flex-col"
          >
            <FoxglovePanel foxgloveSpace={foxgloveSpace} />
          </div>
        )}
      </div>
    </div>
  );
}
