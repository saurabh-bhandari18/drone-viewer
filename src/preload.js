const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('scrcpy', {
  start: (args) => ipcRenderer.invoke('start-scrcpy', args),
  stop: () => ipcRenderer.invoke('stop-scrcpy'),
  status: () => ipcRenderer.invoke('scrcpy-status'),
  getPath: () => ipcRenderer.invoke('get-scrcpy-path'),
});
