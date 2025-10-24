import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("desktopAPI", {
    openFile: async () => {
        return ipcRenderer.invoke("dialog:openFile");
    },
    saveFile: async (opts) => {
        return ipcRenderer.invoke("dialog:saveFile", opts);
    }
});
