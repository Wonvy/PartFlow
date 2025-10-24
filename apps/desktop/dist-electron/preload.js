import { contextBridge as n, ipcRenderer as e } from "electron";
n.exposeInMainWorld("desktopAPI", {
  openFile: async () => e.invoke("dialog:openFile"),
  saveFile: async (i) => e.invoke("dialog:saveFile", i)
});
