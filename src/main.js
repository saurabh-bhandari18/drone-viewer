const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let scrcpyProcess = null;

// Find bundled scrcpy path
const getBundledScrcpyPath = () => {
  const possiblePaths = [
    // In development
    path.join(__dirname, '..', '..', 'resources', 'scrcpy', 'scrcpy.exe'),
    // In packaged app
    path.join(process.resourcesPath, 'scrcpy', 'scrcpy.exe'),
  ];

  const fs = require('fs');
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return 'scrcpy'; // fallback to PATH
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
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

// IPC handlers for scrcpy control from renderer
ipcMain.handle('start-scrcpy', (event, args) => {
  if (scrcpyProcess && scrcpyProcess.exitCode === null) {
    return { success: false, message: 'Already running' };
  }

  const scrcpyPath = args.path || getBundledScrcpyPath();
  const cmdArgs = ['--no-audio'];

  if (args.width && args.height) {
    cmdArgs.push('--window-width', String(args.width));
    cmdArgs.push('--window-height', String(args.height));
  }

  if (args.bitrate) {
    cmdArgs.push('--video-bit-rate', `${args.bitrate}M`);
  }

  if (args.maxFps) {
    cmdArgs.push('--max-fps', String(args.maxFps));
  }

  if (args.noControl) {
    cmdArgs.push('--no-control');
  }

  if (args.alwaysOnTop) {
    cmdArgs.push('--always-on-top');
  }

  if (args.borderless) {
    cmdArgs.push('--window-borderless');
  }

  try {
    scrcpyProcess = spawn(scrcpyPath, cmdArgs, { shell: true });

    scrcpyProcess.on('error', (err) => {
      console.error('scrcpy error:', err.message);
    });

    scrcpyProcess.on('close', (code) => {
      console.log(`scrcpy exited with code ${code}`);
      scrcpyProcess = null;
    });

    return { success: true, pid: scrcpyProcess.pid };
  } catch (e) {
    return { success: false, message: e.message };
  }
});

ipcMain.handle('stop-scrcpy', () => {
  if (scrcpyProcess) {
    scrcpyProcess.kill();
    scrcpyProcess = null;
    return { success: true };
  }
  return { success: false, message: 'Not running' };
});

ipcMain.handle('scrcpy-status', () => {
  return { running: scrcpyProcess !== null && scrcpyProcess.exitCode === null };
});

ipcMain.handle('get-scrcpy-path', () => {
  return getBundledScrcpyPath();
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (scrcpyProcess) scrcpyProcess.kill();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (scrcpyProcess) scrcpyProcess.kill();
});
