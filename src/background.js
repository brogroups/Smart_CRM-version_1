"use strict";

import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  Tray,
  globalShortcut,
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import { eventController } from "./main/event";
import connection from "./main/utils/connection";
import createsuperadmin from "./main/utils/createsuperadmin";
import { statisticCreateConfig } from "./main/config/statistic.config";
import { notificationCreateConfig } from "./main/config/notification.config";

const { autoUpdater } = require("electron-updater");
const isDevelopment = process.env.NODE_ENV !== "production";
const path = require("path");

// Disable HTTP cache
app.commandLine.appendSwitch("disable-http-cache");

let mainWindow;
const gotTheLock = app.requestSingleInstanceLock();

autoUpdater.autoDownload = false;

// Prevent multiple instances
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  protocol.registerSchemesAsPrivileged([
    { scheme: "app", privileges: { secure: true, standard: true } },
  ]);

  app.on("ready", async () => {
    if (isDevelopment && !process.env.IS_TEST) {
      try {
        await installExtension(VUEJS_DEVTOOLS);
      } catch (e) {
        console.error("Vue Devtools failed to install:", e.toString());
      }
    }

    if (!isDevelopment) launchAtStartup();

    await createWindow();
    eventController(ipcMain);
    await connection();
    await createsuperadmin();
    await statisticCreateConfig();
    await notificationCreateConfig();
    Menu.setApplicationMenu(null);
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      enableRemoteModule: true,
    },
  });

  mainWindow.webContents.openDevTools();

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
  } else {
    createProtocol("app");
    mainWindow.loadURL("app://./index.html");
    mainWindow.webContents.setZoomFactor(0.9);
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("close", (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
}

function launchAtStartup() {
  app.setLoginItemSettings({
    openAtLogin: true,
  });
}

let tray = null;

app.whenReady().then(() => {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, "..", "build", "icons", "icon.ico")
  );

  tray = new Tray(icon);

  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      } else {
        mainWindow.minimize();
      }
    } else {
      mainWindow.show();
    }
  });

  tray.setToolTip("Smart");
});

ipcMain.on("minimize-window", () => {
  mainWindow.minimize();
});

ipcMain.on("maximize-window", () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on("close", () => {
  mainWindow.close();
  app.quit();
});

autoUpdater.on("update-available", () => {
  if (mainWindow) {
    mainWindow.webContents.send(
      "update-available",
      "Update is available, do you want to update?"
    );
  }

  ipcMain.on("update", (event, args) => {
    if (args.update) {
      autoUpdater.downloadUpdate();
    }
  });
});

// Prevent F5 and DevTools shortcuts in production
// app.on('browser-window-focus', () => {
//   if (!isDevelopment) {
//     globalShortcut.register('CommandOrControl+R', () => {});
//     globalShortcut.register('F5', () => {});
//     globalShortcut.register('F12', () => {});
//   }
// });

// app.on('browser-window-blur', () => {
//   if (!isDevelopment) {
//     globalShortcut.unregister('CommandOrControl+R');
//     globalShortcut.unregister('F5');
//     globalShortcut.unregister('F12');
//   }
// });

if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
