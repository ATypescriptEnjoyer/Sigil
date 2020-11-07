import { app, BrowserView, BrowserWindow, dialog, ipcMain } from "electron";
import { Subscription } from "sub-events";
import lolapi from "./lol-api";
import { ChampLoadout } from "./lol-api/LeagueApiInterfaces";
import { productName } from "../package.json";
import icon from "./images/icon.ico";

import Store from "electron-store";

// This is imported as a raw string.
import styles from "./injects/uggstyles.inject.css";
// @ts-expect-error: Imported as a string, not actual JS.
import loadoutjs from "./injects/loadout.inject";

const leagueApi = new lolapi();
let MainBrowserWindow: BrowserWindow = null;
let uggView: BrowserView = null;
let importView: BrowserView = null;
let champSelectSubscription: Subscription = null;

const store = new Store();

declare const MAIN_WINDOW_WEBPACK_ENTRY: any;
declare const MAIN_HEADER_WEBPACK_ENTRY: any;

if (require('electron-squirrel-startup')) app.quit();
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit();
}
else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (MainBrowserWindow) {
      if (MainBrowserWindow.isMinimized()) MainBrowserWindow.restore();
      MainBrowserWindow.focus();
    }
  });
  app.on("ready", () => {
    if (process.platform !== "win32") {
      dialog.showErrorBox("None Windows Platform Detected.", "This program isn't meant for you.. Sorry!");
      app.quit();
    }
    createWindow();
    leagueApi.start();
    champSelectSubscription = leagueApi.onChampSelected.subscribe((champData) => {
      importView.webContents.send("button-state", "disabled");
      const url = champData.role === "aram" ?
        `https://u.gg/lol/champions/aram/${champData.champion}-aram` :
        `https://u.gg/lol/champions/${champData.champion}/build?role=${champData.role}`;
      loadUggUrl(url)
        .then(_ => importView.webContents.send("button-state", "enabled"))
        .catch(_ => importView.webContents.send("button-state", "enabled"));
    });
  });
}

const createWindow = () => {
  MainBrowserWindow = new BrowserWindow({
    height: 720,
    width: 1500,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    title: productName,
    frame: false,
    icon,
  });
  MainBrowserWindow.setBackgroundColor("#0b0b23");
  MainBrowserWindow.setResizable(false);
  MainBrowserWindow.webContents.loadURL(MAIN_HEADER_WEBPACK_ENTRY);
  addUggToBrowserWindow();
  addImportToBrowserWindow().then(() => loadFlashPosition());
  loadUggUrl("https://u.gg/lol/tier-list");
}

const loadFlashPosition = (): void => {
  ipcMain.on("flash-position-set", (_event, args) => {
    store.set("flash-pos", args);
  });
  if(store.has("flash-pos")) {
    importView.webContents.send("flash-position-get", store.get("flash-pos"));
  }
}

const addUggToBrowserWindow = (): void => {
  if (uggView !== null)
    return;
  const bounds = MainBrowserWindow.getBounds();
  uggView = new BrowserView();
  uggView.setBackgroundColor("#0b0b23");
  MainBrowserWindow.addBrowserView(uggView);
  uggView.setBounds({ x: 0, y: 30, height: bounds.height - 30, width: Math.floor(bounds.width / 1.2) });
}

const addImportToBrowserWindow = (): Promise<void> => {
  if (importView !== null)
    return;
  importView = new BrowserView({ webPreferences: { nodeIntegration: true } });
  importView.setBackgroundColor("#0b0b23");
  MainBrowserWindow.addBrowserView(importView);
  const bounds = MainBrowserWindow.getBounds();
  const uggBounds = uggView.getBounds();
  importView.setBounds({ x: uggBounds.width, y: 30, height: bounds.height - 30, width: bounds.width - uggBounds.width });
  return importView.webContents.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
}

const loadUggUrl = (url: string): Promise<void> => {
  return uggView.webContents.loadURL(url).then(async response => {
    await uggView.webContents.insertCSS(styles);
    return response;
  });
}

const getChampLoadoutData = async (): Promise<ChampLoadout> => {
  return uggView.webContents.executeJavaScript(loadoutjs)
    .then(val => JSON.parse(val))
    .catch(_ => null);
}

app.on("before-quit", () => {
  leagueApi?.stop();
  champSelectSubscription?.cancel();
})

app.on("window-all-closed", () => {
  app.quit();
});

// LCU API uses a self signed cert, we need to tell electron to allow it.
app.on('certificate-error', (event, _webContents, _url, _error, _certificate, callback) => {
  event.preventDefault();
  callback(true);
});

ipcMain.on("import-click", async (_event, _arg) => {
  importView.webContents.send("button-state", "disabled");
  try {
    let json = await getChampLoadoutData();
    await leagueApi.importChampLoadout(json);
  }
  catch (e) { /** Usually random errors that don't actually matter. Just ignore them.. */ }
  importView.webContents.send("button-state", "enabled");
})