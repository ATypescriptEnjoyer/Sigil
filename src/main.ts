import { app, BrowserView, BrowserWindow, dialog, ipcMain } from "electron";
import { Subscription } from "sub-events";
import lolapi from "./lol-api";
import { ChampLoadout } from "./lol-api/LeagueApiInterfaces";
import { productName } from "../package.json";

const leagueApi = new lolapi();
let MainBrowserWindow: BrowserWindow = null;
let uggView: BrowserView = null;
let importView: BrowserView = null;
let champSelectSubscription: Subscription = null;

declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

if (require('electron-squirrel-startup')) app.quit();

const createWindow = () => {
  console.log("Main Entry: " + MAIN_WINDOW_WEBPACK_ENTRY);
  MainBrowserWindow = new BrowserWindow({ height: 720, width: 1500, webPreferences: { nodeIntegration: true }, title: productName });
  MainBrowserWindow.setResizable(false);
  addUggToBrowserWindow();
  addImportToBrowserWindow();
  uggView.webContents.loadURL("https://u.gg/lol/tier-list").then(_ => {
    setTimeout(() =>
      uggView.webContents.executeJavaScript(`
        document.getElementsByClassName("title-header")[0].scrollIntoView({alignToTop: true, behavior: "smooth"});
      `)
      , 2000);
  });
}

const addUggToBrowserWindow = (): void => {
  if (uggView !== null)
    return;
  const bounds = MainBrowserWindow.getBounds();
  uggView = new BrowserView();
  MainBrowserWindow.addBrowserView(uggView);
  uggView.setBounds({ x: 0, y: 0, height: bounds.height, width: Math.floor(bounds.width / 1.2) });
}

const addImportToBrowserWindow = (): void => {
  if (importView !== null)
    return;
  importView = new BrowserView({ webPreferences: { nodeIntegration: true } });
  MainBrowserWindow.addBrowserView(importView);
  const mainBounds = MainBrowserWindow.getBounds();
  const uggBounds = uggView.getBounds();
  importView.setBounds({ x: uggBounds.width, y: 0, height: mainBounds.height, width: mainBounds.width - uggBounds.width });
  importView.webContents.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
}

const getChampLoadoutData = async (): Promise<ChampLoadout> => {
  const js = `
    JSON.stringify({
      trees: Array.from(document.getElementsByClassName("rune-tree")).map(x => x.getElementsByClassName("perk-style-title")[0].innerText),
      perks: Array.from(document.getElementsByClassName("perk-active")).map(x => x.firstElementChild.getAttribute("alt")),
      shards: Array.from(document.getElementsByClassName("shard-active")).map(x => x.firstElementChild.getAttribute("alt")),
      spells: Array.from(document.getElementsByClassName("summoner-spells")[0].getElementsByTagName("img")).map(x => x.getAttribute("alt"))
    });
  `;
  return uggView.webContents.executeJavaScript(js)
    .then(val => JSON.parse(val))
    .catch(_ => null);
}

app.on("ready", () => {
  if (process.platform !== "win32") {
    dialog.showErrorBox("None Windows Platform Detected.", "This program isn't meant for you.. Sorry!");
    app.quit();
  }
  createWindow();
  leagueApi.start();
  champSelectSubscription = leagueApi.onChampSelected.subscribe((champData) => {
    importView.webContents.send("button-state", "disabled");
    uggView.webContents.loadURL(`https://u.gg/lol/champions/${champData.champion}/build?role=${champData.role}`)
      .then(_ => importView.webContents.send("button-state", "enabled"))
  });
});

app.on("before-quit", () => {
  leagueApi.stop();
  champSelectSubscription?.cancel();
})

app.on("window-all-closed", () => {
  app.quit();
});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(true);
});

ipcMain.on("import-click", async (event, arg) => {
  importView.webContents.send("button-state", "disabled");
  const json = await getChampLoadoutData();
  await leagueApi.importChampLoadout(json);
  importView.webContents.send("button-state", "enabled");
})