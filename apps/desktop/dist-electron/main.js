import { app, nativeImage, Tray, Menu, dialog, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === "development";
let mainWindow = null;
let tray = null;
function getWindowStateFile() {
  const userData = app.getPath("userData");
  return path.join(userData, "window-state.json");
}
function loadWindowState() {
  const stateFile = getWindowStateFile();
  try {
    if (fs.existsSync(stateFile)) {
      const raw = fs.readFileSync(stateFile, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        width: Math.max(800, Number(parsed.width) || 1200),
        height: Math.max(600, Number(parsed.height) || 800),
        x: typeof parsed.x === "number" ? parsed.x : void 0,
        y: typeof parsed.y === "number" ? parsed.y : void 0,
        isMaximized: Boolean(parsed.isMaximized)
      };
    }
  } catch {
  }
  return { width: 1200, height: 800 };
}
function saveWindowState(win) {
  const stateFile = getWindowStateFile();
  const bounds = win.getBounds();
  const payload = {
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    isMaximized: win.isMaximized()
  };
  try {
    fs.writeFileSync(stateFile, JSON.stringify(payload));
  } catch {
  }
}
function createMenu() {
  const template = [
    {
      label: "应用",
      submenu: [
        { role: "reload", label: "重新加载" },
        { role: "forcereload", label: "强制重新加载" },
        { type: "separator" },
        { role: "toggledevtools", label: "切换开发者工具" },
        { type: "separator" },
        { role: "quit", label: "退出" }
      ]
    },
    {
      label: "视图",
      submenu: [
        { role: "togglefullscreen", label: "切换全屏" },
        { role: "resetzoom", label: "重置缩放" },
        { role: "zoomin", label: "放大" },
        { role: "zoomout", label: "缩小" }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
function registerIpcHandlers() {
  ipcMain.handle("dialog:openFile", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        { name: "JSON", extensions: ["json"] },
        { name: "CSV", extensions: ["csv"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });
  ipcMain.handle("dialog:saveFile", async (_evt, opts) => {
    const result = await dialog.showSaveDialog({
      defaultPath: opts == null ? void 0 : opts.defaultPath,
      filters: [
        { name: "JSON", extensions: [(opts == null ? void 0 : opts.ext) || "json"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });
    if (result.canceled || !result.filePath) return null;
    return result.filePath;
  });
}
function createWindow() {
  const state = loadWindowState();
  const win = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow = win;
  win.on("close", (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      win.hide();
      return;
    }
    saveWindowState(win);
  });
  if (state.isMaximized) {
    win.maximize();
  }
  win.on("move", () => saveWindowState(win));
  win.on("resize", () => saveWindowState(win));
  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL;
    if (devUrl) {
      win.loadURL(devUrl);
      win.webContents.openDevTools();
    } else {
      console.error("VITE_DEV_SERVER_URL is not set");
    }
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}
const singleLock = app.requestSingleInstanceLock();
if (!singleLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  app.whenReady().then(() => {
    createMenu();
    registerIpcHandlers();
    startBackendServer();
    setTimeout(() => {
      createWindow();
    }, 2e3);
    try {
      const iconPath = path.join(process.resourcesPath || __dirname, "icon.png");
      let image = nativeImage.createFromPath(iconPath);
      if (image.isEmpty()) {
        image = nativeImage.createFromPath(path.join(process.cwd(), "apps/desktop/icon.png"));
      }
      tray = new Tray(image);
    } catch {
      tray = new Tray(nativeImage.createEmpty());
    }
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "显示窗口",
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      { type: "separator" },
      {
        label: "退出",
        click: () => {
          app.isQuiting = true;
          app.quit();
        }
      }
    ]);
    tray.setToolTip("PartFlow");
    tray.setContextMenu(contextMenu);
    tray.on("click", () => {
      if (!mainWindow) return;
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  });
}
function startBackendServer() {
  console.log("⚠️ 当前版本需要手动启动后端服务器");
  console.log("📝 请在项目目录运行: pnpm --filter @partflow/server dev");
  if (!isDev) {
    setTimeout(() => {
      dialog.showMessageBox({
        type: "info",
        title: "需要启动后端服务",
        message: "PartFlow Desktop 需要后端服务支持",
        detail: "当前版本需要手动启动后端服务器。\n\n请确保后端服务正在运行 (http://localhost:3333)\n\n如需帮助，请查看项目文档。",
        buttons: ["我知道了"]
      });
    }, 3e3);
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.on("before-quit", () => {
  console.log("🔄 Application quitting, cleaning up...");
  app.isQuiting = true;
});
app.on("will-quit", () => {
});
