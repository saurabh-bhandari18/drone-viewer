import React, { useState, useRef } from 'react';

// ===== CONFIGURATION — CHANGE THESE =====
const DEFAULT_SCRCPY_URL = 'http://localhost:8000'; // ws-scrcpy endpoint
const DEFAULT_FOXGLOVE_URL = 'http://192.168.144.50:8080/?ds=rosbridge-websocket&ds.url=ws%3A%2F%2F192.168.144.50%3A9090'; // Foxglove endpoint — change port if needed
// =========================================

function Panel({ title, url, onUrlChange, onLoad, color }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-dark-card border-b border-dark-border">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-sm font-semibold text-white">{title}</span>
        <input
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          className="flex-1 bg-dark-bg border border-dark-border rounded px-2 py-1 text-xs text-gray-300 focus:border-accent focus:outline-none"
          placeholder="Enter URL..."
        />
        <button
          onClick={onLoad}
          className="px-3 py-1 bg-dark-hover border border-dark-border rounded text-xs text-accent hover:bg-dark-border transition"
        >
          Load
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 bg-black">
        {url ? (
          <webview
            src={url}
            className="w-full h-full"
            allowpopups="true"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600 text-sm">
            Enter URL and click Load
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsBar({ split, onSplitChange, layout, onLayoutChange }) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-dark-card border-b border-dark-border">
      {/* Layout toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Layout:</span>
        <button
          onClick={() => onLayoutChange('side')}
          className={`px-2 py-1 rounded text-xs ${layout === 'side' ? 'bg-accent text-black' : 'bg-dark-hover text-gray-300'}`}
        >
          Side by Side
        </button>
        <button
          onClick={() => onLayoutChange('stack')}
          className={`px-2 py-1 rounded text-xs ${layout === 'stack' ? 'bg-accent text-black' : 'bg-dark-hover text-gray-300'}`}
        >
          Stacked
        </button>
        <button
          onClick={() => onLayoutChange('video-only')}
          className={`px-2 py-1 rounded text-xs ${layout === 'video-only' ? 'bg-accent text-black' : 'bg-dark-hover text-gray-300'}`}
        >
          Video Only
        </button>
        <button
          onClick={() => onLayoutChange('cloud-only')}
          className={`px-2 py-1 rounded text-xs ${layout === 'cloud-only' ? 'bg-accent text-black' : 'bg-dark-hover text-gray-300'}`}
        >
          Cloud Only
        </button>
      </div>

      {/* Split slider */}
      {(layout === 'side' || layout === 'stack') && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Split:</span>
          <input
            type="range"
            min="20"
            max="80"
            value={split}
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
  const [scrcpyUrl, setScrcpyUrl] = useState(DEFAULT_SCRCPY_URL);
  const [foxgloveUrl, setFoxgloveUrl] = useState(DEFAULT_FOXGLOVE_URL);
  const [activeScrcpyUrl, setActiveScrcpyUrl] = useState('');
  const [activeFoxgloveUrl, setActiveFoxgloveUrl] = useState('');
  const [split, setSplit] = useState(50);
  const [layout, setLayout] = useState('side');

  const loadScrcpy = () => setActiveScrcpyUrl(scrcpyUrl);
  const loadFoxglove = () => setActiveFoxgloveUrl(foxgloveUrl);

  const showVideo = layout === 'side' || layout === 'stack' || layout === 'video-only';
  const showCloud = layout === 'side' || layout === 'stack' || layout === 'cloud-only';

  const isHorizontal = layout === 'side';
  const isStacked = layout === 'stack';

  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-dark-card border-b border-dark-border">
        <h1 className="text-lg font-bold text-accent">Drone Viewer</h1>
        <span className="text-xs text-gray-500">Video Mirror + Point Cloud</span>
      </div>

      {/* Settings */}
      <SettingsBar
        split={split}
        onSplitChange={setSplit}
        layout={layout}
        onLayoutChange={setLayout}
      />

      {/* Main content */}
      <div className={`flex-1 flex ${isStacked ? 'flex-col' : 'flex-row'} overflow-hidden`}>
        {showVideo && (
          <div
            style={{
              [isHorizontal ? 'width' : 'height']:
                layout === 'video-only' ? '100%' : `${split}%`,
            }}
            className="flex flex-col border-r border-dark-border"
          >
            <Panel
              title="Video Mirror"
              url={scrcpyUrl}
              onUrlChange={setScrcpyUrl}
              onLoad={loadScrcpy}
              color="bg-green-500"
            />
          </div>
        )}

        {showCloud && (
          <div
            style={{
              [isHorizontal ? 'width' : 'height']:
                layout === 'cloud-only' ? '100%' : `${100 - split}%`,
            }}
            className="flex flex-col"
          >
            <Panel
              title="Point Cloud"
              url={foxgloveUrl}
              onUrlChange={setFoxgloveUrl}
              onLoad={loadFoxglove}
              color="bg-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}
