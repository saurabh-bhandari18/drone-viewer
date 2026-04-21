const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let wsScrcpyProcess = null;

const startWsScrcpy = () => {
  const wsScrcpyDir = path.join(__dirname, '..', '..', 'ws-scrcpy');

  console.log('Starting ws-scrcpy server from:', wsScrcpyDir);

  wsScrcpyProcess = spawn('npm', ['start'], {
    cwd: wsScrcpyDir,
    shell: true,
    stdio: 'pipe',
  });

  wsScrcpyProcess.stdout.on('data', (data) => {
    console.log(`[ws-scrcpy] ${data.toString().trim()}`);
  });

  wsScrcpyProcess.stderr.on('data', (data) => {
    console.error(`[ws-scrcpy] ${data.toString().trim()}`);
  });

  wsScrcpyProcess.on('error', (err) => {
    console.error('Failed to start ws-scrcpy:', err.message);
  });

  wsScrcpyProcess.on('close', (code) => {
    console.log(`ws-scrcpy exited with code ${code}`);
  });
};

const stopWsScrcpy = () => {
  if (wsScrcpyProcess) {
    wsScrcpyProcess.kill();
    wsScrcpyProcess = null;
    console.log('ws-scrcpy stopped');
  }
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    minWidth: 900,
    minHeight: 500,
    title: 'Drone Viewer',
    backgroundColor: '#0f0f1a',
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      webviewTag: true,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

app.whenReady().then(() => {
  startWsScrcpy();

  // Give ws-scrcpy a moment to start before opening the window
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopWsScrcpy();
    app.quit();
  }
});

app.on('before-quit', () => {
  stopWsScrcpy();
});
