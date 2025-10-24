import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("desktopAPI", {
  openFile: async (): Promise<string | null> => {
    return ipcRenderer.invoke("dialog:openFile");
  },
  saveFile: async (opts?: { defaultPath?: string; ext?: string }): Promise<string | null> => {
    return ipcRenderer.invoke("dialog:saveFile", opts);
  }
});

export {};


