import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import path from "node:path";
import fs from "node:fs";
const isDev = process.env.NODE_ENV === "development";
let mainWindow = null;
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
                x: typeof parsed.x === "number" ? parsed.x : undefined,
                y: typeof parsed.y === "number" ? parsed.y : undefined,
                isMaximized: Boolean(parsed.isMaximized)
            };
        }
    }
    catch { }
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
    }
    catch { }
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
        if (result.canceled || result.filePaths.length === 0)
            return null;
        return result.filePaths[0];
    });
    ipcMain.handle("dialog:saveFile", async (_evt, opts) => {
        const result = await dialog.showSaveDialog({
            defaultPath: opts?.defaultPath,
            filters: [
                { name: "JSON", extensions: [opts?.ext || "json"] },
                { name: "All Files", extensions: ["*"] }
            ]
        });
        if (result.canceled || !result.filePath)
            return null;
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
    if (state.isMaximized) {
        win.maximize();
    }
    win.on("close", () => saveWindowState(win));
    win.on("move", () => saveWindowState(win));
    win.on("resize", () => saveWindowState(win));
    if (isDev) {
        win.loadURL("http://localhost:5174");
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(path.join(__dirname, "../dist/index.html"));
    }
}
// 单实例锁
const singleLock = app.requestSingleInstanceLock();
if (!singleLock) {
    app.quit();
}
else {
    app.on("second-instance", () => {
        if (mainWindow) {
            if (mainWindow.isMinimized())
                mainWindow.restore();
            mainWindow.focus();
        }
    });
    app.whenReady().then(() => {
        createMenu();
        registerIpcHandlers();
        createWindow();
    });
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
